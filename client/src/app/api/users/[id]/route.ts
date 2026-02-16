import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, professional_categories, created_at')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('User not found', 404);
      }
      console.error('Error fetching user:', error);
      return errorResponse('Failed to fetch user');
    }

    return successResponse({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      professionalCategories: user.professional_categories || [],
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Fetch user error:', error);
    return errorResponse('An unexpected error occurred');
  }
}
