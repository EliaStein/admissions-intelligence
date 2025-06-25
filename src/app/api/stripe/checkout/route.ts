import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { CONFIG_KEYS, ConfigService } from '../../../../services/configService';
import { supabase } from '../../../../lib/supabase';

interface CheckoutRequest {
  priceId: string;
  credits: number;
  successUrl?: string;
  cancelUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
<<<<<<< HEAD
=======
    // Get Stripe secret key from config
>>>>>>> 011134a (wip - pricing layout, stripe price and service outline)
    const stripeSecretKey = await ConfigService.getConfigValue(CONFIG_KEYS.STRIPE_SECRET_KEY);
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: 'Stripe configuration not found' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

<<<<<<< HEAD
    // Guard: Get the authorization header
=======
    // Get the authenticated user
>>>>>>> 011134a (wip - pricing layout, stripe price and service outline)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

<<<<<<< HEAD
    // Verify the token with Supabase
    const token = authHeader.replace('Bearer ', '');
=======
    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token with Supabase
>>>>>>> 011134a (wip - pricing layout, stripe price and service outline)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    const body: CheckoutRequest = await request.json();
    const { priceId, credits, successUrl, cancelUrl } = body;

    if (!priceId || !credits) {
      return NextResponse.json(
        { error: 'Price ID and credits amount are required' },
        { status: 400 }
      );
    }

<<<<<<< HEAD
=======
    // Create Stripe checkout session
>>>>>>> 011134a (wip - pricing layout, stripe price and service outline)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl || `${request.nextUrl.origin}/profile?payment=success`,
      cancel_url: cancelUrl || `${request.nextUrl.origin}/purchase-credits?payment=cancelled`,
      customer_email: user.email,
      allow_promotion_codes: true,
      metadata: {
        userId: user.id,
        credits: credits.toString(),
        email: user.email || '',
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
