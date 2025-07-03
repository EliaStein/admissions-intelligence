import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase-admin-client';
import { ViralLoopsService } from '@/services/viralLoopsService';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');

    // Get referral code from request body if provided
    const body = await request.json().catch(() => ({}));
    const referralCode = body.referralCode || null;

    console.log('Google OAuth callback API called');
    console.log('Request body:', body);
    console.log('Referral code from request:', referralCode);

    const supabaseAdmin = await getAdminClient();

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      console.error('Token verification failed:', authError);
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking existing user:', checkError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'User already exists',
        user: existingUser
      });
    }

    const userMetadata = user.user_metadata || {};
    const firstName = userMetadata.given_name || userMetadata.first_name || userMetadata.full_name?.split(' ')[0] || 'User';
    const lastName = userMetadata.family_name || userMetadata.last_name || userMetadata.full_name?.split(' ').slice(1).join(' ') || '';
    const email = user.email;

    if (!email) {
      console.error('No email found in user data');
      return NextResponse.json(
        { error: 'Email not found in Google account' },
        { status: 400 }
      );
    }

    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: user.id,
        email: email.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
        role: 'student',
        is_active: true,
        credits: 0,
        referral_code_used: referralCode
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating user profile:', insertError);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    console.log('User profile created successfully:', newUser.id);

    // Register with Viral Loops
    try {
      await ViralLoopsService.registerParticipant({
        email,
        firstname: firstName,
        lastname: lastName,
        referralCode: referralCode
      });
    } catch (viralLoopsError) {
      console.error('Error registering with Viral Loops:', viralLoopsError);
    }

    return NextResponse.json({
      success: true,
      message: 'User profile created successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Error in Google callback API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
