import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getBaseUrl } from '@/utils/url'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  // Get the correct base URL for redirects
  const baseUrl = getBaseUrl();

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/'
  }

  if (error) {
    console.error('OAuth error received:', { error, errorDescription });
    return NextResponse.redirect(`${baseUrl}/auth/auth-code-error?error=${encodeURIComponent(error)}&description=${encodeURIComponent(errorDescription || '')}`)
  }

  if (code) {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      return NextResponse.redirect(`${baseUrl}/auth/auth-code-error?error=exchange_failed&description=${encodeURIComponent(exchangeError.message)}`)
    }

    if (data.session) {
      // For Google OAuth users, ensure they have a profile in our users table
      try {
        const response = await fetch(`${baseUrl}/api/auth/google-callback`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to create user profile for Google OAuth user:', response.status, errorText);
        }
      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
      }

      // Use the correct base URL for redirects
      const redirectUrl = `${baseUrl}${next}`;

      console.log('Redirecting to:', redirectUrl);
      console.log('Base URL used:', baseUrl);
      console.log('Origin from request:', origin);

      return NextResponse.redirect(redirectUrl);
    } else {
      console.error('No session created after code exchange');
      return NextResponse.redirect(`${baseUrl}/auth/auth-code-error?error=no_session&description=No session created after code exchange`)
    }
  }

  return NextResponse.redirect(`${baseUrl}/auth/callback-handler`)
}
