import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseAnonKey } from '@/config/supabase'
import { getAdminClient } from '@/lib/supabase-admin-client'
import { ViralLoopsService } from '@/services/viralLoopsService'

export async function POST(request: NextRequest) {
  console.log('🔥 GOOGLE CALLBACK ENDPOINT HIT!');

  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ No valid authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🎫 Access token received, length:', accessToken.length);

    // Verify the session with Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.error('❌ Invalid access token or user not found:', userError);
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    console.log('✅ User verified:', user.id);

    // Parse request body
    const body = await request.json();
    const { referralCode } = body;
    console.log('🎯 Referral code from request:', referralCode);

    // Get admin client for database operations
    const supabaseAdmin = await getAdminClient();

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, referral_code_used')
      .eq('id', user.id)
      .single();

    console.log('🔍 Existing user check:', {
      exists: !!existingUser,
      hasReferralCode: !!existingUser?.referral_code_used,
      checkError: checkError?.code
    });

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('❌ Database error checking existing user:', checkError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    let shouldClearReferralCode = false;

    // If user doesn't exist, create new user profile
    if (!existingUser) {
      console.log('👤 Creating new user profile...');

      const userMetadata = user.user_metadata || {};
      const firstName = userMetadata.given_name || userMetadata.first_name || userMetadata.full_name?.split(' ')[0] || 'User';
      const lastName = userMetadata.family_name || userMetadata.last_name || userMetadata.full_name?.split(' ').slice(1).join(' ') || '';
      const email = user.email;

      if (!email) {
        console.error('❌ No email found in user data');
        return NextResponse.json({ error: 'No email found' }, { status: 400 });
      }

      // Create user profile
      const { error: insertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          email: email.toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          role: 'student',
          is_active: true,
          credits: 0,
          referral_code_used: referralCode || null
        });

      if (insertError) {
        console.error('❌ Failed to create user profile:', insertError);
        return NextResponse.json({ error: 'Failed to create user profile' }, { status: 500 });
      }

      console.log('✅ User profile created successfully');

      // Register with Viral Loops
      try {
        const viralLoopsData = {
          email,
          firstname: firstName,
          lastname: lastName,
          ...(referralCode && { referralCode })
        };

        console.log('🔗 Registering with Viral Loops:', { email, firstName, lastName, hasReferralCode: !!referralCode });
        await ViralLoopsService.registerParticipant(viralLoopsData);
        console.log('✅ Viral Loops registration successful');

        if (referralCode) {
          shouldClearReferralCode = true;
        }
      } catch (viralLoopsError) {
        console.error('❌ Viral Loops registration failed:', viralLoopsError);
        // Don't fail the whole process if Viral Loops fails
        if (referralCode) {
          shouldClearReferralCode = true; // Still clear it to prevent retry loops
        }
      }
    } else {
      console.log('👤 User already exists');

      // If user exists but doesn't have a referral code and one is provided, update it
      if (!existingUser.referral_code_used && referralCode) {
        console.log('🔗 Updating existing user with referral code...');

        const { error: updateError } = await supabaseAdmin
          .from('users')
          .update({ referral_code_used: referralCode })
          .eq('id', user.id);

        if (updateError) {
          console.error('❌ Failed to update user with referral code:', updateError);
        } else {
          console.log('✅ User updated with referral code');

          // Try to register with Viral Loops with the referral code
          try {
            const email = user.email;
            const userMetadata = user.user_metadata || {};
            const firstName = userMetadata.given_name || userMetadata.first_name || userMetadata.full_name?.split(' ')[0] || 'User';
            const lastName = userMetadata.family_name || userMetadata.last_name || userMetadata.full_name?.split(' ').slice(1).join(' ') || '';

            await ViralLoopsService.registerParticipant({
              email: email!,
              firstname: firstName,
              lastname: lastName,
              referralCode
            });
            console.log('✅ Viral Loops registration with referral code successful');
          } catch (viralLoopsError) {
            console.error('❌ Viral Loops registration with referral code failed:', viralLoopsError);
          }
        }

        shouldClearReferralCode = true;
      } else if (referralCode) {
        // User exists and already has a referral code, or referral code provided but user already processed
        console.log('🔗 User already has referral code or referral code already processed');
        shouldClearReferralCode = true;
      }
    }

    return NextResponse.json({
      success: true,
      shouldClearReferralCode,
      message: existingUser ? 'User profile updated' : 'User profile created successfully',
      newUser: !existingUser,
      userEmail: user.email
    });

  } catch (error) {
    console.error('💥 Error in Google callback:', error);
    return NextResponse.json({
      error: 'Internal server error',
      shouldClearReferralCode: true // Clear referral code to prevent retry loops
    }, { status: 500 });
  }
}
