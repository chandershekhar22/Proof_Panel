import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { successResponse, errorResponse, messageResponse } from '@/lib/response';

// GET /api/studies/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    const { data: study, error } = await supabase
      .from('studies')
      .select(`*, study_tags (tag)`)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Study not found', 404);
      }
      console.error('Error fetching study:', error);
      return errorResponse('Failed to fetch study');
    }

    const formattedStudy = {
      ...study,
      tags: study.study_tags ? study.study_tags.map((t: { tag: string }) => t.tag) : [],
      study_tags: undefined,
    };

    return successResponse(formattedStudy);
  } catch (error) {
    console.error('Fetch study error:', error);
    return errorResponse('An unexpected error occurred');
  }
}

// PATCH /api/studies/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status, currentCompletes } = await request.json();

    const supabase = getSupabase();

    const updates: Record<string, unknown> = {};

    if (status) {
      updates.status = status;
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }
      if (status === 'active') {
        updates.launched_at = new Date().toISOString();
      }
    }

    if (currentCompletes !== undefined) {
      updates.current_completes = currentCompletes;
    }

    const { data: study, error } = await supabase
      .from('studies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating study:', error);
      return errorResponse('Failed to update study');
    }

    return messageResponse('Study updated successfully', study);
  } catch (error) {
    console.error('Update study error:', error);
    return errorResponse('An unexpected error occurred');
  }
}
