import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { getSupabase } from '@/lib/supabase';
import { errorResponse, messageResponse } from '@/lib/response';
import { isValidEmail, isValidRole, VALID_ROLES } from '@/lib/validation';
import { SALT_ROUNDS } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, role } = await request.json();

    if (!email || !password || !firstName || !lastName || !role) {
      return errorResponse('All fields are required: email, password, firstName, lastName, role', 400);
    }

    if (!isValidRole(role)) {
      return errorResponse(`Invalid role. Must be one of: ${VALID_ROLES.join(', ')}`, 400);
    }

    if (!isValidEmail(email)) {
      return errorResponse('Invalid email format', 400);
    }

    if (password.length < 6) {
      return errorResponse('Password must be at least 6 characters long', 400);
    }

    const supabase = getSupabase();

    // Check if user already exists with this email and role
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', email.toLowerCase())
      .eq('role', role)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing user:', checkError);
      return errorResponse('Failed to check existing user');
    }

    if (existingUser) {
      return errorResponse('An account with this email and role already exists', 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        role: role,
      })
      .select('id, email, first_name, last_name, role, created_at')
      .single();

    if (insertError) {
      console.error('Error creating user:', insertError);
      return errorResponse('Failed to create user account');
    }

    return messageResponse('Account created successfully', {
      id: newUser.id,
      email: newUser.email,
      firstName: newUser.first_name,
      lastName: newUser.last_name,
      role: newUser.role,
      createdAt: newUser.created_at,
    }, 201);
  } catch (error) {
    console.error('Signup error:', error);
    return errorResponse('An unexpected error occurred during signup');
  }
}
