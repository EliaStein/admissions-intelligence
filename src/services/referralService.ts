import 'server-only';
import { getAdminClient } from '../lib/supabase-admin-client';
interface Reward {
  id: string;
  name: string;
  value: number;
  isMonetary: boolean;
  metadata: {
    rewardName: string;
    announced: boolean;
    type: string;
  };
}

interface PendingReward {
  user: {
    firstname: string;
    lastname: string;
    email: string;
    referralCode: string;
    risk: number;
    referralCountTotal: number;
  };
  rewards: Reward[];
}
export class ReferralService {

  /**
   * Custom implementation of getCampaignParticipantRewardsPending
   * Replaces the buggy viralLoopsDocs.getCampaignParticipantRewardsPending
   */
  static async getCampaignParticipantRewardsPending(referralCode: string): Promise<PendingReward[]> {
    try {
      const apiToken = process.env.VIRAL_LOOPS_API_TOKEN;
      if (!apiToken) {
        throw new Error('VIRAL_LOOPS_API_TOKEN is not configured');
      }

      const url = `https://app.viral-loops.com/api/v3/campaign/participant/rewards/pending?referralCode=${encodeURIComponent(referralCode)}&filter=`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'apiToken': apiToken
        }
      });

      if (!response.ok) {
        throw new Error(`Viral Loops API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data as PendingReward[];
    } catch (error) {
      console.error('Error fetching pending rewards:', error);
      throw error;
    }
  }

  /**
   * Custom implementation of postCampaignParticipantRewardsRedeem
   * Replaces the buggy viralLoopsDocs.postCampaignParticipantRewardsRedeem
   */
  static async postCampaignParticipantRewardsRedeem(referralCode: string, rewardId: string): Promise<void> {
    try {
      const apiToken = process.env.VIRAL_LOOPS_API_TOKEN;
      if (!apiToken) {
        throw new Error('VIRAL_LOOPS_API_TOKEN is not configured');
      }

      const url = 'https://app.viral-loops.com/api/v3/campaign/participant/rewards/redeem';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'apiToken': apiToken
        },
        body: JSON.stringify({
          user: {
            referralCode: referralCode
          },
          rewardId: rewardId
        })
      });

      if (!response.ok) {
        throw new Error(`Viral Loops API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      throw error;
    }
  }

  static async findRefereeByCode(refereeId: string) {
    try {
      const supabaseAdmin = await getAdminClient();

      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', refereeId)
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

  static async rewardReferrer(refereeId: string): Promise<boolean> {
    try {
      const referee = await this.findRefereeByCode(refereeId);
      if (!referee) return false;

      const supabaseAdmin = await getAdminClient();
      const pendings: PendingReward[] = await this.getCampaignParticipantRewardsPending(referee.referral_code_used);

      const rewordId = pendings[0]?.rewards[0]?.id;
      console.log({ rewordId })
      if (!rewordId) return false;

      const referrerEmail = pendings[0]?.user.email;
      const { data: referrer } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', referrerEmail)
        .single();

      await this.postCampaignParticipantRewardsRedeem(referee.referral_code_used, rewordId);

      await supabaseAdmin.from('users')
        .update({
          credits: referrer.credits + 1
        })
        .eq('id', referrer.id);

      await supabaseAdmin.from('users')
        .update({
          referral_code_used: null
        })
        .eq('id', refereeId);


      return true;
    } catch (error) {
      console.error('Error in markReferralPayment:', JSON.stringify(error));
      return false;
    }
  }
}
