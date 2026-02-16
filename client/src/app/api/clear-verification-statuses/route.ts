import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { errorResponse, messageResponse } from '@/lib/response';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hashIds } = body;

    const supabase = getSupabase();

    if (hashIds && Array.isArray(hashIds)) {
      // Clear specific hashIds
      await supabase.from('verification_statuses').delete().in('hash_id', hashIds);
      await supabase.from('respondent_attributes').delete().in('hash_id', hashIds);
    } else {
      // Clear all
      await supabase.from('verification_statuses').delete().gte('id', 0);
      await supabase.from('respondent_attributes').delete().gte('id', 0);
    }

    return messageResponse('Verification statuses cleared');
  } catch (error) {
    console.error('Clear verification statuses error:', error);
    return errorResponse('Failed to clear verification statuses');
  }
}
