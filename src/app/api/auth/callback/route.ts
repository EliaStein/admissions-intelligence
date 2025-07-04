import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { supabaseUrl, supabaseAnonKey } from '@/config/supabase'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/'
  }

  if (code) {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data?.session) {
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
    }
  } else {
    // Check if this might be implicit flow - redirect to callback handler instead of error page
    // The callback handler can process tokens from URL hash
    const redirectUrl = `${origin}/auth/callback-handler`;

    const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
    const isLocalEnv = process.env.NODE_ENV === 'development'
    if (isLocalEnv) {
      return NextResponse.redirect(redirectUrl)
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}/auth/callback-handler`)
    } else {
      return NextResponse.redirect(redirectUrl)
    }
  }
}
