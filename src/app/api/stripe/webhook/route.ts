import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CONFIG_KEYS, ConfigService } from '../../../../services/configService';
import { CreditService } from '../../../../services/creditService';
import { ReferralService } from '../../../../services/referralService';

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

    await ReferralService.rewardReferrer(userId);

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
