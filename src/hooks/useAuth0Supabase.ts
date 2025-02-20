import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { supabase } from '../lib/supabase';

export function useAuth0Supabase() {
  const { user, isAuthenticated } = useAuth0();

  useEffect(() => {
    const syncUserWithSupabase = async () => {
      if (isAuthenticated && user) {
        try {
          // Check if user exists
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('auth0_user_id', user.sub)
            .single();

          if (!existingUser) {
            // Create new user profile
            const { error } = await supabase
              .from('profiles')
              .insert({
                auth0_user_id: user.sub,
                email: user.email,
                credits_remaining: 0,
              });

            if (error) throw error;
          }
        } catch (error) {
          console.error('Error syncing user with Supabase:', error);
        }
      }
    };

    syncUserWithSupabase();
  }, [isAuthenticated, user]);

  return { user, isAuthenticated };
}
