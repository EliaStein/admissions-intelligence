import { getAdminClient } from '../lib/supabase-admin-client';
import viralLoopsDocs from '@api/viral-loops-docs';
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
      const pendings: PendingReward[] = await viralLoopsDocs.getCampaignParticipantRewardsPending({
        referralCode: referee.referral_code_used,
        apiToken: process.env.VIRAL_LOOPS_API_TOKEN
      }) as any;
      const rewordId = pendings[0]?.rewards[0]?.id;
      if (!rewordId) return false;

      const referrerEmail = pendings[0]?.user.email;
      const { data: referrer } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', referrerEmail)
        .single();

      await viralLoopsDocs.postCampaignParticipantRewardsRedeem({
        user: {
          referralCode: referee.referral_code_used
        },
        rewardId: rewordId
      }, {
        apiToken: process.env.VIRAL_LOOPS_API_TOKEN as string
      });

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
      console.error('Error in markReferralPayment:', error);
      return false;
    }
  }
}
