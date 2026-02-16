import { NextRequest } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { errorResponse, messageResponse } from '@/lib/response';
import { isValidCategory, VALID_CATEGORIES } from '@/lib/validation';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { professionalCategories } = await request.json();

    if (!professionalCategories || !Array.isArray(professionalCategories)) {
      return errorResponse('professionalCategories array is required', 400);
    }

    const invalidCategories = professionalCategories.filter((cat: string) => !isValidCategory(cat));
    if (invalidCategories.length > 0) {
      return errorResponse(
        `Invalid categories: ${invalidCategories.join(', ')}. Valid categories are: ${VALID_CATEGORIES.join(', ')}`,
        400
      );
    }

    const supabase = getSupabase();

    const { data: user, error } = await supabase
      .from('users')
      .update({ professional_categories: professionalCategories })
      .eq('id', id)
      .select('id, email, first_name, last_name, role, professional_categories')
      .single();

    if (error) {
      console.error('Error updating user categories:', error);
      return errorResponse('Failed to update professional categories');
    }

    return messageResponse('Professional categories updated successfully', {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      professionalCategories: user.professional_categories,
    });
  } catch (error) {
    console.error('Update categories error:', error);
    return errorResponse('An unexpected error occurred');
  }
}
