import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { errorResponse } from '@/lib/response';
import { exchangeCodeForToken, getLinkedInProfile } from '@/lib/linkedin';

// Helper: store verified panelist in the verified_panelists table (permanent aggregation data)
async function storeVerifiedPanelist(
  hashId: string,
  attributes: Record<string, string | null>,
  status: 'verified' | 'failed'
) {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('verified_panelists').upsert(
      {
        hash_id: hashId,
        status,
        job_title: attributes.jobTitle || null,
        industry: attributes.industry || null,
        company_size: attributes.companySize || null,
        job_function: attributes.jobFunction || null,
        employment_status: attributes.employmentStatus || null,
        verified_at: new Date().toISOString(),
      },
      { onConflict: 'hash_id' }
    );

    if (error) {
      console.error('Error storing verified panelist:', error);
    }
  } catch (err) {
    console.error('storeVerifiedPanelist error:', err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { code, state } = await request.json();

    if (!code) {
      return errorResponse('Authorization code is required', 400);
    }

    // Decode state to get hashId
    let hashId: string | null = null;
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString());
        hashId = decoded.hashId;
      } catch {
        console.error('Failed to decode state');
      }
    }

    // Exchange code for tokens
    const tokenData = await exchangeCodeForToken(code);
    const profileData = await getLinkedInProfile(tokenData.access_token, tokenData.id_token);

    const supabase = getSupabase();

    // Get stored respondent attributes from Supabase
    let respondentAttributes: Record<string, string | null> = {};
    if (hashId) {
      const { data } = await supabase
        .from('respondent_attributes')
        .select('*')
        .eq('hash_id', hashId)
        .single();

      if (data) {
        respondentAttributes = {
          jobTitle: data.job_title,
          industry: data.industry,
          companySize: data.company_size,
          jobFunction: data.job_function,
          employmentStatus: data.employment_status,
        };
      }
    }

    // Mark panelist as verified in verification_statuses table
    if (hashId) {
      await supabase.from('verification_statuses').upsert(
        {
          hash_id: hashId,
          verified: true,
          proof_status: 'Verified',
          verified_at: new Date().toISOString(),
          linkedin_name: profileData.name,
          linkedin_email: profileData.email,
        },
        { onConflict: 'hash_id' }
      );

      // Store in permanent verified_panelists table
      await storeVerifiedPanelist(hashId, respondentAttributes, 'verified');

      // Batch verification logic for TEST-* accounts
      if (hashId.startsWith('TEST-')) {
        const { data: batchMates } = await supabase
          .from('batch_relationships')
          .select('mate_hash_id')
          .eq('test_hash_id', hashId);

        if (batchMates && batchMates.length > 0) {
          const mateHashIds = batchMates.map((b) => b.mate_hash_id);

          // Shuffle and pick 2 to verify, rest to fail
          const shuffled = [...mateHashIds].sort(() => Math.random() - 0.5);
          const toVerify = shuffled.slice(0, 2);
          const toFail = shuffled.slice(2, 4);

          // Mark 2 as verified
          for (const mateHashId of toVerify) {
            await supabase.from('verification_statuses').upsert(
              {
                hash_id: mateHashId,
                verified: true,
                proof_status: 'Verified',
                verified_at: new Date().toISOString(),
                linkedin_name: 'Auto Verified',
                linkedin_email: 'auto@verified.com',
                auto_verified: true,
              },
              { onConflict: 'hash_id' }
            );

            // Get mate attributes and store in verified_panelists
            const { data: mateData } = await supabase
              .from('respondent_attributes')
              .select('*')
              .eq('hash_id', mateHashId)
              .single();

            const mateAttrs = mateData
              ? {
                  jobTitle: mateData.job_title,
                  industry: mateData.industry,
                  companySize: mateData.company_size,
                  jobFunction: mateData.job_function,
                  employmentStatus: mateData.employment_status,
                }
              : {} as Record<string, string | null>;

            await storeVerifiedPanelist(mateHashId, mateAttrs, 'verified');
          }

          // Mark 2 as failed
          for (const mateHashId of toFail) {
            await supabase.from('verification_statuses').upsert(
              {
                hash_id: mateHashId,
                verified: false,
                proof_status: 'Failed',
                verified_at: new Date().toISOString(),
                auto_verified: true,
                fail_reason: 'Verification failed - attributes mismatch',
              },
              { onConflict: 'hash_id' }
            );

            const { data: mateData } = await supabase
              .from('respondent_attributes')
              .select('*')
              .eq('hash_id', mateHashId)
              .single();

            const mateAttrs = mateData
              ? {
                  jobTitle: mateData.job_title,
                  industry: mateData.industry,
                  companySize: mateData.company_size,
                  jobFunction: mateData.job_function,
                  employmentStatus: mateData.employment_status,
                }
              : {} as Record<string, string | null>;

            await storeVerifiedPanelist(mateHashId, mateAttrs, 'failed');
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        hashId,
        linkedin: {
          sub: profileData.sub,
          name: profileData.name,
          email: profileData.email,
          picture: profileData.picture,
          email_verified: profileData.email_verified,
        },
        attributes: {
          jobTitle: respondentAttributes.jobTitle,
          industry: respondentAttributes.industry,
          companySize: respondentAttributes.companySize,
        },
        verified: true,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
    const errMsg = error instanceof Error ? error.message : 'Failed to complete LinkedIn authentication';
    return errorResponse(errMsg);
  }
}
