import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CONFIG_KEYS, ConfigService } from '../../../../services/configService';
import { CreditService } from '../../../../services/creditService';
import { ReferralService } from '../../../../services/referralService';
import { ViralLoopsService } from '../../../../services/viralLoopsService';
import { getAdminClient } from '../../../../lib/supabase-admin-client';

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = await ConfigService.getConfigValue(CONFIG_KEYS.STRIPE_SECRET_KEY);
    const webhookSecret = await ConfigService.getConfigValue(CONFIG_KEYS.STRIPE_WEBHOOK_SECRET);

    if (!stripeSecretKey || !webhookSecret) {
      console.error('Missing Stripe configuration');
      return NextResponse.json(
        { error: 'Stripe configuration not found' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    // Get the raw body
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    const session = event.data.object as Stripe.Checkout.Session;
    if (!['checkout.session.completed'].includes(event.type)) {
      console.log('[Unregistered Event] ', event.type);
      return NextResponse.json({ received: true });
    }
    const userId = session.metadata?.userId;
    const credits = session.metadata?.credits;
    if (!userId || !credits) {
      console.log('[no user id] ', event.type);
      return NextResponse.json({ received: true });
    }
    await CreditService.addCredits(
      userId,
      +credits,
    );

    // Handle referral tracking for first payment
    try {
      // Check if this is the user's first payment by marking referral payment
      const referralMarked = await ReferralService.markReferralPayment(userId);

      if (referralMarked) {
        console.log(`Marked referral payment for user ${userId}`);

        // Find the referral to process reward
        const dbClient = await getAdminClient();
        const { data: referrals, error } = await dbClient
          .from('referrals')
          .select('id, referrer_id')
          .eq('referee_id', userId)
          .eq('payment_completed', true)
          .eq('reward_given', false);

        if (!error && referrals && referrals.length > 0) {
          const referral = referrals[0];
          // Process referral reward (give 1 credit to referrer)
          await ReferralService.processReferralReward(referral.id, 1);
          console.log(`Processed referral reward for referrer ${referral.referrer_id}`);

          // Track conversion with Viral Loops if participant ID exists
          if (referral.viral_loops_participant_id) {
            try {
              await ViralLoopsService.trackConversion(referral.viral_loops_participant_id, 'payment');
              console.log(`Tracked payment conversion with Viral Loops for participant ${referral.viral_loops_participant_id}`);
            } catch (viralLoopsError) {
              console.error('Error tracking Viral Loops conversion:', viralLoopsError);
            }
          }
        }
      }
    } catch (referralError) {
      console.error('Error processing referral tracking:', referralError);
      // Don't fail the webhook if referral tracking fails
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
