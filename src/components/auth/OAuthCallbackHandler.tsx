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
              console.log('Retrieved referral code from localStorage:', referralCode);

              const response = await fetch('/api/auth/google-callback', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${data.session.access_token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  referralCode: referralCode
                })
              });

              if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to create user profile:', response.status, errorText);
              } else {
                const result = await response.json();
                console.log('User profile creation result:', result);

                if (referralCode && (result.success || result.shouldClearReferralCode)) {
                  localStorage.removeItem('referralCode');
                  console.log('Referral code cleared from localStorage');
                }
              }
            } catch (profileError) {
              console.error('Error creating user profile:', profileError);
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

        if (error) {
          console.error('OAuth error in URL params:', error);
          router.push(`/auth/auth-code-error?error=${error}&description=${urlParams.get('error_description') || ''}`);
          return;
        }

        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          
          if (exchangeError) {
            console.error('Error exchanging code for session:', exchangeError);
            router.push('/auth/auth-code-error?error=exchange_failed&description=' + encodeURIComponent(exchangeError.message));
            return;
          }

          if (data.session) {
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

    if (window.location.hash.includes('access_token=') || window.location.search.includes('code=')) {
      handleOAuthCallback();
    }
  }, [router]);

  return null;
}
