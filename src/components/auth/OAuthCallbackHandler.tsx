'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function OAuthCallbackHandler() {
  const router = useRouter();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');

        if (accessToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });

          if (error) {
            console.error('Error setting session from tokens:', error);
            router.push('/auth/auth-code-error?error=session_error&description=' + encodeURIComponent(error.message));
            return;
          }

          if (data.session) {
            try {
              // Get referral code from localStorage
              const referralCode = localStorage.getItem('referralCode');

              const requestBody = { referralCode: referralCode };

              const response = await fetch('/api/auth/google-callback', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${data.session.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Failed to create user profile:', response.status, errorText);
              } else {
                const result = await response.json();

                if (referralCode && (result.success || result.shouldClearReferralCode)) {
                  localStorage.removeItem('referralCode');
                }
              }
            } catch (profileError) {
              console.error('💥 Error creating user profile:', profileError);
            }

            window.history.replaceState({}, document.title, window.location.pathname);
            router.push('/');
            return;
          } else {
            console.error('No session created from tokens');
            router.push('/auth/auth-code-error?error=no_session&description=No session created from tokens');
            return;
          }
        }

        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        const sessionCreated = urlParams.get('session');

        if (error) {
          console.error('❌ OAuth error in URL params:', error);
          router.push(`/auth/auth-code-error?error=${error}&description=${urlParams.get('error_description') || ''}`);
          return;
        }

        // Handle case where session was already created by OAuth callback
        if (sessionCreated === 'created') {
          try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
              console.error('❌ Error getting current session:', sessionError);
              router.push('/auth/auth-code-error?error=session_error&description=' + encodeURIComponent(sessionError.message));
              return;
            }

            if (session) {
              // Get referral code from localStorage
              const referralCode = localStorage.getItem('referralCode');

              const requestBody = { referralCode: referralCode };

              const response = await fetch('/api/auth/google-callback', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Failed to create user profile (OAuth flow):', response.status, errorText);
              } else {
                const result = await response.json();

                if (referralCode && (result.success || result.shouldClearReferralCode)) {
                  localStorage.removeItem('referralCode');
                }
              }

              // Clean up URL and redirect
              window.history.replaceState({}, document.title, window.location.pathname);
              router.push('/');
              return;
            } else {
              console.error('❌ No session found despite session=created parameter');
              router.push('/auth/auth-code-error?error=no_session&description=No session found');
              return;
            }
          } catch (sessionCheckError) {
            console.error('💥 Error checking session:', sessionCheckError);
            router.push('/auth/auth-code-error?error=session_check_error&description=' + encodeURIComponent(sessionCheckError instanceof Error ? sessionCheckError.message : 'Unknown error'));
            return;
          }
        }

        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError);
            router.push('/auth/auth-code-error?error=exchange_failed&description=' + encodeURIComponent(exchangeError.message));
            return;
          }

          if (data.session) {
            try {
              // Get referral code from localStorage
              const referralCode = localStorage.getItem('referralCode');

              const requestBody = { referralCode: referralCode };

              const response = await fetch('/api/auth/google-callback', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${data.session.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Failed to create user profile (PKCE flow):', response.status, errorText);
              } else {
                const result = await response.json();

                if (referralCode && (result.success || result.shouldClearReferralCode)) {
                  localStorage.removeItem('referralCode');
                }
              }
            } catch (profileError) {
              console.error('💥 Error creating user profile (PKCE flow):', profileError);
            }

            router.push('/');
            return;
          }
        }

        router.push('/auth/auth-code-error?error=no_valid_response&description=No valid OAuth response found');

      } catch (error) {
        console.error('Error in OAuth callback handler:', error);
        router.push('/auth/auth-code-error?error=handler_error&description=' + encodeURIComponent(error instanceof Error ? error.message : 'Unknown error'));
      }
    };

    // Check if we're being called from OAuth callback or have OAuth parameters
    const hasOAuthParams = window.location.hash.includes('access_token=') ||
                          window.location.search.includes('code=') ||
                          window.location.search.includes('session=created') ||
                          window.location.pathname === '/auth/callback-handler';

    if (hasOAuthParams) {
      handleOAuthCallback();
    }
  }, [router]);

  return null;
}
