import { getAdminClient } from '../lib/supabase-admin-client';
import type { Database } from '../types/supabase';

type Referral = Database['public']['Tables']['referrals']['Row'];
type ReferralUpdate = Database['public']['Tables']['referrals']['Update'];

export class ReferralService {
  /**
   * Find referral by referral code
   */
  static async findReferralByCode(referralCode: string): Promise<Referral | null> {
    try {
      const supabaseAdmin = await getAdminClient();

      const { data, error } = await supabaseAdmin
        .from('referrals')
        .select('*')
        .eq('referral_code', referralCode)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        console.error('Error finding referral by code:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in findReferralByCode:', error);
      return null;
    }
  }

  /**
   * Mark referral as payment completed
   */
  static async markReferralPayment(refereeId: string): Promise<boolean> {
    try {
      const supabaseAdmin = await getAdminClient();

      const updateData: ReferralUpdate = {
        payment_completed: true,
        payment_at: new Date().toISOString(),
      };

      const { error } = await supabaseAdmin
        .from('referrals')
        .update(updateData)
        .eq('referee_id', refereeId)
        .eq('signup_completed', true)
        .eq('payment_completed', false);

      if (error) {
        console.error('Error marking referral payment:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in markReferralPayment:', error);
      return false;
    }
  }

  /**
   * Process referral rewards (give credits to referrer)
   */
  static async processReferralReward(referralId: string, rewardCredits: number = 1): Promise<boolean> {
    try {
      const supabaseAdmin = await getAdminClient();

      // Get the referral
      const { data: referral, error: referralError } = await supabaseAdmin
        .from('referrals')
        .select('referrer_id, reward_given')
        .eq('id', referralId)
        .single();

      if (referralError || !referral || referral.reward_given) {
        console.error('Referral not found or reward already given:', referralError);
        return false;
      }

      // Add credits to referrer
      const { data: userData, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('credits')
        .eq('id', referral.referrer_id)
        .single();

      if (fetchError) {
        console.error('Error fetching referrer credits:', fetchError);
        return false;
      }

      const currentCredits = userData?.credits || 0;
      const newCredits = currentCredits + rewardCredits;

      // Update referrer credits
      const { error: updateCreditsError } = await supabaseAdmin
        .from('users')
        .update({ credits: newCredits })
        .eq('id', referral.referrer_id);

      if (updateCreditsError) {
        console.error('Error updating referrer credits:', updateCreditsError);
        return false;
      }

      // Mark reward as given
      const { error: updateReferralError } = await supabaseAdmin
        .from('referrals')
        .update({ reward_given: true })
        .eq('id', referralId);

      if (updateReferralError) {
        console.error('Error marking reward as given:', updateReferralError);
        return false;
      }

      console.log(`Successfully gave ${rewardCredits} credits to referrer ${referral.referrer_id}`);
      return true;
    } catch (error) {
      console.error('Error in processReferralReward:', error);
      return false;
    }
  }

}
