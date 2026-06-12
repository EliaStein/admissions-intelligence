import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CONFIG_KEYS, ConfigService } from '../../../../services/configService';
import { CreditService } from '../../../../services/creditService';
import { ReferralService } from '../../../../services/referralService';
import { creditPackages } from '../../../../config/products';
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
    const priceId = session.metadata?.priceId;
    if (!userId || !priceId) {
      console.log('[no user id / price id] ', event.type);
      return NextResponse.json({ received: true });
    }

    // Credits are derived from the server-side package list, never from
    // metadata a client could have influenced.
    const creditPackage = creditPackages.find(p => p.priceId === priceId);
    if (!creditPackage) {
      console.error('[unknown price id] ', priceId);
      return NextResponse.json({ received: true });
    }

    // Idempotency: Stripe retries deliveries. Claim the event id first;
    // a conflict means another delivery already processed (or is processing) it.
    const supabaseAdmin = await getAdminClient();
    const { data: claimed, error: claimError } = await supabaseAdmin
      .from('stripe_events')
      .insert({ id: event.id })
      .select('id')
      .maybeSingle();

    if (claimError || !claimed) {
      if (claimError && claimError.code !== '23505') {
        console.error('[stripe_events] failed to record event:', claimError);
        return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
      }
      console.log('[duplicate event] ', event.id);
      return NextResponse.json({ received: true });
    }

    const granted = await CreditService.addCredits(userId, creditPackage.credits);
    if (!granted) {
      // Release the claim and let Stripe retry — the user paid.
      await supabaseAdmin.from('stripe_events').delete().eq('id', event.id);
      return NextResponse.json({ error: 'Failed to grant credits' }, { status: 500 });
    }

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
