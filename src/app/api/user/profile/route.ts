import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { z } from 'zod';
import { getAdminClient } from '../../../../lib/supabase-admin-client';

// Zod schema for profile update validation
const profileUpdateSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, 'First name cannot be empty')
    .max(50, 'First name cannot be longer than 50 characters')
    .regex(/^[^<>"'&]*$/, 'First name contains invalid characters')
    .optional(),
  last_name: z
    .string()
    .trim()
    .min(1, 'Last name cannot be empty')
    .max(50, 'Last name cannot be longer than 50 characters')
    .regex(/^[^<>"'&]*$/, 'Last name contains invalid characters')
    .optional(),
}).refine(
  (data) => data.first_name !== undefined || data.last_name !== undefined,
  {
    message: 'At least one field (first_name or last_name) must be provided',
  }
);

export async function PUT(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the token and get the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const requestBody = await request.json();

    // Validate and sanitize the input using Zod
    const validationResult = profileUpdateSchema.safeParse(requestBody);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors[0]?.message || 'Invalid input data';
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;
    const supaAdmin = await getAdminClient();

    // Update the user's profile
    const { data: updatedUser, error: updateError } = await supaAdmin
      .from('users')
      .update(updateData)
      .eq('id', user.id)
      .select('first_name, last_name, email, role, created_at')
      .single();

    if (updateError) {
      console.error('Error updating user profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error in user profile PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
