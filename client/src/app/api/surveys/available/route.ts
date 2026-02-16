import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { successResponse, errorResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    const supabase = getSupabase();

    // Get user's professional categories if userId is provided
    let userCategories: string[] = [];
    let isVehicleOwner = false;

    if (userId) {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('professional_categories')
        .eq('id', userId)
        .single();

      if (!userError && user && user.professional_categories) {
        userCategories = user.professional_categories;
        isVehicleOwner = userCategories.includes('vehicle');
      }
    }

    // Get all active studies
    const { data: studies, error } = await supabase
      .from('studies')
      .select(`*, study_tags (tag)`)
      .eq('status', 'active')
      .order('is_urgent', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching available surveys:', error);
      return errorResponse('Failed to fetch available surveys');
    }

    // Filter based on user categories
    let filteredStudies = studies || [];

    if (userId && userCategories.length > 0 && !isVehicleOwner) {
      filteredStudies = filteredStudies.filter((study) => {
        const surveyCategory = study.target_category || 'all';
        return surveyCategory === 'all' || userCategories.includes(surveyCategory);
      });
    }

    // Format for member dashboard
    const availableSurveys = filteredStudies.map((study) => {
      let match = 85;
      const surveyCategory = study.target_category || 'all';

      if (userCategories.length > 0) {
        if (surveyCategory === 'all') {
          match = Math.floor(Math.random() * 10) + 85;
        } else if (userCategories.includes(surveyCategory)) {
          match = Math.floor(Math.random() * 8) + 92;
        } else if (isVehicleOwner) {
          match = Math.floor(Math.random() * 15) + 80;
        } else {
          match = Math.floor(Math.random() * 10) + 75;
        }
      } else {
        match = Math.floor(Math.random() * 15) + 85;
      }

      return {
        id: study.id,
        title: study.name,
        company: study.company_name || 'Research Company',
        tags: study.study_tags ? study.study_tags.map((t: { tag: string }) => t.tag) : [],
        match,
        duration: `${study.survey_length} min`,
        payout: study.payout,
        urgent: study.is_urgent,
        audience: study.audience,
        targetCategory: study.target_category || 'all',
        surveyMethod: study.survey_method,
        externalUrl: study.external_url,
        targetCompletes: study.target_completes,
        currentCompletes: study.current_completes || 0,
      };
    });

    return successResponse(availableSurveys);
  } catch (error) {
    console.error('Fetch available surveys error:', error);
    return errorResponse('An unexpected error occurred');
  }
}
