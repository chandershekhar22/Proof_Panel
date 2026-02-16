import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabase } from '@/lib/supabase';
import { errorResponse, messageResponse } from '@/lib/response';
import { isValidRole, VALID_ROLES } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password || !role) {
      return errorResponse('Email, password, and role are required', 400);
    }

    if (!isValidRole(role)) {
      return errorResponse(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, 400);
    }

    const supabase = getSupabase();

    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, password_hash, first_name, last_name, role, created_at')
      .eq('email', email.toLowerCase())
      .eq('role', role)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return errorResponse('No account found with this email and role. Please sign up first.', 401);
      }
      console.error('Error fetching user:', fetchError);
      return errorResponse('Failed to authenticate');
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);

    if (!passwordValid) {
      return errorResponse('Invalid password', 401);
    }

    return messageResponse('Signed in successfully', {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      createdAt: user.created_at,
    });
  } catch (error) {
    console.error('Signin error:', error);
    return errorResponse('An unexpected error occurred during signin');
  }
}
