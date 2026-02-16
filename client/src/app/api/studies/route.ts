import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { successResponse, errorResponse, messageResponse } from '@/lib/response';
import { isValidUUID, isValidTargetCategory, VALID_TARGET_CATEGORIES, determineTargetCategory } from '@/lib/validation';

// GET /api/studies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const createdBy = searchParams.get('createdBy');
    const status = searchParams.get('status');

    const supabase = getSupabase();

    let query = supabase
      .from('studies')
      .select(`*, study_tags (tag)`)
      .order('created_at', { ascending: false });

    if (createdBy) {
      query = query.eq('created_by', createdBy);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: studies, error } = await query;

    if (error) {
      console.error('Error fetching studies:', error);
      return errorResponse('Failed to fetch studies');
    }

    const formattedStudies = (studies || []).map((study) => ({
      ...study,
      tags: study.study_tags ? study.study_tags.map((t: { tag: string }) => t.tag) : [],
      study_tags: undefined,
    }));

    return successResponse(formattedStudies);
  } catch (error) {
    console.error('Fetch studies error:', error);
    return errorResponse('An unexpected error occurred');
  }
}

// POST /api/studies
export async function POST(request: NextRequest) {
  try {
    const {
      name,
      companyName,
      audience,
      targetingCriteria,
      targetCompletes,
      surveyLength,
      surveyMethod,
      externalUrl,
      cpi,
      payout,
      isUrgent,
      tags,
      createdBy,
      status,
      targetCategory,
    } = await request.json();

    if (!name || !audience || !targetCompletes || !surveyMethod) {
      return errorResponse('Required fields: name, audience, targetCompletes, surveyMethod', 400);
    }

    if (targetCategory && !isValidTargetCategory(targetCategory)) {
      return errorResponse(
        `Invalid targetCategory. Must be one of: ${VALID_TARGET_CATEGORIES.join(', ')}`,
        400
      );
    }

    const supabase = getSupabase();

    const effectiveCpi = cpi || 7.5;
    const totalCost = effectiveCpi * targetCompletes;
    const effectivePayout = payout || Math.round(effectiveCpi * 0.6 * 100) / 100;
    const validCreatedBy = isValidUUID(createdBy) ? createdBy : null;

    const { data: study, error: insertError } = await supabase
      .from('studies')
      .insert({
        name,
        company_name: companyName || 'Research Company',
        audience,
        targeting_criteria: targetingCriteria || {},
        target_completes: targetCompletes,
        survey_length: surveyLength || 15,
        survey_method: surveyMethod,
        external_url: externalUrl,
        cpi: effectiveCpi,
        total_cost: totalCost,
        payout: effectivePayout,
        status: status || 'active',
        is_urgent: isUrgent || false,
        created_by: validCreatedBy,
        launched_at: status === 'active' ? new Date().toISOString() : null,
        target_category: determineTargetCategory(audience, targetCategory),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating study:', insertError);
      return errorResponse('Failed to create study');
    }

    // Insert tags if provided
    if (tags && tags.length > 0) {
      const tagInserts = tags.map((tag: string) => ({
        study_id: study.id,
        tag,
      }));

      const { error: tagError } = await supabase.from('study_tags').insert(tagInserts);

      if (tagError) {
        console.error('Error inserting tags:', tagError);
      }
    }

    return messageResponse('Study created successfully', study, 201);
  } catch (error) {
    console.error('Create study error:', error);
    return errorResponse('An unexpected error occurred');
  }
}
