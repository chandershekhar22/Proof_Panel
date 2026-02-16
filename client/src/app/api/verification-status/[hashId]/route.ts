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
      .from('verification_statuses')
      .select('verified, proof_status, verified_at, linkedin_name, linkedin_email, auto_verified, fail_reason')
      .eq('hash_id', hashId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found — return default pending status
        return successResponse({ verified: false, proofStatus: 'Pending' });
      }
      console.error('Error fetching verification status:', error);
      return errorResponse('Failed to fetch verification status');
    }

    return successResponse({
      verified: data.verified,
      proofStatus: data.proof_status,
      verifiedAt: data.verified_at,
      linkedinName: data.linkedin_name,
      linkedinEmail: data.linkedin_email,
      autoVerified: data.auto_verified,
      failReason: data.fail_reason,
    });
  } catch (error) {
    console.error('Fetch verification status error:', error);
    return errorResponse('An unexpected error occurred');
  }
}
