import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const { hashIds } = await request.json();

    if (!hashIds || !Array.isArray(hashIds)) {
      return errorResponse('hashIds array is required', 400);
    }

    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('verification_statuses')
      .select('hash_id, verified, proof_status, verified_at, linkedin_name, linkedin_email, auto_verified, fail_reason')
      .in('hash_id', hashIds);

    if (error) {
      console.error('Error fetching verification statuses:', error);
      return errorResponse('Failed to fetch verification statuses');
    }

    // Build the statuses map, defaulting missing hashIds to pending
    const statuses: Record<string, unknown> = {};
    for (const hashId of hashIds) {
      const found = (data || []).find((d) => d.hash_id === hashId);
      if (found) {
        statuses[hashId] = {
          verified: found.verified,
          proofStatus: found.proof_status,
          verifiedAt: found.verified_at,
          linkedinName: found.linkedin_name,
          linkedinEmail: found.linkedin_email,
          autoVerified: found.auto_verified,
          failReason: found.fail_reason,
        };
      } else {
        statuses[hashId] = { verified: false, proofStatus: 'Pending' };
      }
    }

    return successResponse(statuses);
  } catch (error) {
    console.error('Fetch verification statuses error:', error);
    return errorResponse('An unexpected error occurred');
  }
}
