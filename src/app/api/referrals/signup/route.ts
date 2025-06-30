import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { ViralLoopsService } from '../../../../services/viralLoopsService';
import { ReferralService } from '../../../../services/referralService';

interface SignupReferralRequest {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  referralCode?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    // Verify the token with Supabase
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const body: SignupReferralRequest = await request.json();
    const { userId, email, firstName, lastName, referralCode } = body;

    // Verify the user ID matches the authenticated user
    if (userId !== user.id) {
      return NextResponse.json(
        { error: 'User ID mismatch' },
        { status: 403 }
      );
    }

    let viralLoopsParticipantId: string | null = null;

    try {
      // Register with Viral Loops and track signup
      viralLoopsParticipantId = await ViralLoopsService.registerAndTrackSignup(
        email,
        firstName,
        lastName,
        referralCode
      );

      if (viralLoopsParticipantId) {
        console.log('Successfully registered with Viral Loops:', viralLoopsParticipantId);
      }
    } catch (viralLoopsError) {
      console.error('Error with Viral Loops integration:', viralLoopsError);
      // Don't fail the request if Viral Loops fails
    }

    // If there's a referral code, handle referral tracking
    if (referralCode) {
      try {
        // Mark the referral as signed up
        const referralMarked = await ReferralService.markReferralSignup(referralCode, userId);
        
        if (referralMarked) {
          console.log('Successfully marked referral signup for code:', referralCode);
        }

        // Update the referral with Viral Loops participant ID if available
        if (viralLoopsParticipantId) {
          // This would require adding a method to update the viral_loops_participant_id
          // For now, we'll log it
          console.log('Viral Loops participant ID for referral:', viralLoopsParticipantId);
        }
      } catch (referralError) {
        console.error('Error tracking referral signup:', referralError);
        // Don't fail the request if referral tracking fails
      }
    }

    return NextResponse.json({
      success: true,
      viralLoopsParticipantId,
      message: 'Referral signup tracking completed'
    });

  } catch (error) {
    console.error('Error processing referral signup:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process referral signup',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
