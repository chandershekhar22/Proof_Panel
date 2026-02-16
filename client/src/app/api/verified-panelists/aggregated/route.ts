import { getSupabase } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET() {
  try {
    const supabase = getSupabase();

    // Fetch verified panelists
    const { data: verifiedData, error: verifiedError } = await supabase
      .from('verified_panelists')
      .select('*')
      .eq('status', 'verified');

    if (verifiedError) {
      console.error('Supabase fetch error:', verifiedError);
      return errorResponse('Failed to fetch verified panelists');
    }

    // Count failed
    const { count: failedCount, error: countError } = await supabase
      .from('verified_panelists')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed');

    if (countError) {
      console.error('Supabase count error:', countError);
    }

    // Aggregate the data
    const aggregated: Record<string, Record<string, number> | number> = {
      jobTitle: {},
      industry: {},
      companySize: {},
      jobFunction: {},
      employmentStatus: {},
      totalVerified: (verifiedData || []).length,
      totalFailed: failedCount || 0,
    };

    for (const panelist of verifiedData || []) {
      if (panelist.job_title) {
        (aggregated.jobTitle as Record<string, number>)[panelist.job_title] =
          ((aggregated.jobTitle as Record<string, number>)[panelist.job_title] || 0) + 1;
      }
      if (panelist.industry) {
        (aggregated.industry as Record<string, number>)[panelist.industry] =
          ((aggregated.industry as Record<string, number>)[panelist.industry] || 0) + 1;
      }
      if (panelist.company_size) {
        (aggregated.companySize as Record<string, number>)[panelist.company_size] =
          ((aggregated.companySize as Record<string, number>)[panelist.company_size] || 0) + 1;
      }
      if (panelist.job_function) {
        (aggregated.jobFunction as Record<string, number>)[panelist.job_function] =
          ((aggregated.jobFunction as Record<string, number>)[panelist.job_function] || 0) + 1;
      }
      if (panelist.employment_status) {
        (aggregated.employmentStatus as Record<string, number>)[panelist.employment_status] =
          ((aggregated.employmentStatus as Record<string, number>)[panelist.employment_status] || 0) + 1;
      }
    }

    return successResponse(aggregated);
  } catch (error) {
    console.error('Error fetching aggregated data:', error);
    return errorResponse('Failed to fetch aggregated data');
  }
}
