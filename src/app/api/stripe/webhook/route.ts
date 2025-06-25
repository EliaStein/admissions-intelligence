import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CONFIG_KEYS, ConfigService } from '../../../../services/configService';
import { CreditService } from '../../../../services/creditService';

export async function POST(request: NextRequest) {
  try {
<<<<<<< HEAD
=======
    // Get Stripe configuration
>>>>>>> 011134a (wip - pricing layout, stripe price and service outline)
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
<<<<<<< HEAD
=======
      // Verify the webhook signature
>>>>>>> 011134a (wip - pricing layout, stripe price and service outline)
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

<<<<<<< HEAD
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
=======
    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        
        console.log('Processing completed checkout session:', session.id);

        // Extract metadata
        const userId = session.metadata?.userId;
        const creditsToAdd = session.metadata?.credits;
        const customerEmail = session.metadata?.email;

        if (!userId || !creditsToAdd) {
          console.error('Missing required metadata in checkout session:', {
            userId,
            creditsToAdd,
            sessionId: session.id
          });
          return NextResponse.json(
            { error: 'Missing required metadata' },
            { status: 400 }
          );
        }

        const credits = parseInt(creditsToAdd, 10);
        if (isNaN(credits) || credits <= 0) {
          console.error('Invalid credits amount:', creditsToAdd);
          return NextResponse.json(
            { error: 'Invalid credits amount' },
            { status: 400 }
          );
        }

        // Add credits to user account
        const success = await CreditService.addCredits(
          userId,
          credits,
          `Credit purchase - Stripe session ${session.id}`
        );

        if (!success) {
          console.error('Failed to add credits for user:', userId);
          return NextResponse.json(
            { error: 'Failed to add credits' },
            { status: 500 }
          );
        }

        console.log(`Successfully added ${credits} credits to user ${userId} (${customerEmail})`);
        break;

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment failed:', paymentIntent.id);
        // You might want to notify the user or log this for follow-up
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
>>>>>>> 011134a (wip - pricing layout, stripe price and service outline)

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
