import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseAnonKey } from '@/config/supabase'

export async function GET(request: Request) {
  console.log('🔥 AUTH CALLBACK ENDPOINT HIT!');
  console.log('🔗 Request URL:', request.url);

  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  console.log('🎫 Auth code received:', code ? 'YES' : 'NO');
  console.log('🌐 Origin:', origin);

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/'
  }
  console.log('➡️ Next redirect:', next);

  if (code) {
    console.log('✅ Code found, exchanging for session...');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    console.log('🔄 Exchange result:', {
      hasData: !!data,
      hasSession: !!data?.session,
      hasError: !!error,
      errorMessage: error?.message
    });

    if (!error && data?.session) {
      console.log('🎉 Session created successfully, redirecting to client-side handler...');

      // Redirect to client-side handler to handle user registration and referral code from localStorage
      const redirectUrl = `${origin}/auth/callback-handler?session=created`;
      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(redirectUrl)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}/auth/callback-handler?session=created`)
      } else {
        return NextResponse.redirect(redirectUrl)
      }
    } else {
      console.log('❌ No session or error occurred:', { hasError: !!error, errorMessage: error?.message });
    }
  } else {
    console.log('❌ No auth code found in request');
  }

  // return the user to an error page with instructions
  console.log('🚨 Redirecting to error page');
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
