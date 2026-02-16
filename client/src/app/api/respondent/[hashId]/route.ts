import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ hashId: string }> }
) {
  try {
    const { hashId } = await params;
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('respondent_attributes')
      .select('*')
      .eq('hash_id', hashId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return errorResponse('Respondent not found', 404);
      }
      console.error('Error fetching respondent:', error);
      return errorResponse('Failed to fetch respondent');
    }

    return successResponse({
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      company: data.company,
      location: data.location,
      employmentStatus: data.employment_status,
      jobTitle: data.job_title,
      jobFunction: data.job_function,
      companySize: data.company_size,
      industry: data.industry,
    });
  } catch (error) {
    console.error('Fetch respondent error:', error);
    return errorResponse('An unexpected error occurred');
  }
}
