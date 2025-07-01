import 'server-only';
import viralLoopsDocs from '@api/viral-loops-docs';

interface ViralLoopsParticipant {
  email: string;
  firstname?: string;
  lastname?: string;
  referralCode?: string;
}

export class ViralLoopsService {
  static async registerParticipant(participant: ViralLoopsParticipant) {
    if (!participant.referralCode) return null;

    try {
      const data = await viralLoopsDocs.postCampaignParticipant({
        user: {
          firstname: participant.firstname || '',
          lastname: participant.lastname || '',
          email: participant.email
        },
        referrer: participant.referralCode ? { referralCode: participant.referralCode } : undefined,
        publicToken: process.env.VIRAL_LOOPS_CAMPAIGN_ID || '',
      }, {
        apiToken: process.env.VIRAL_LOOPS_API_TOKEN || ''
      });

      return data;
    } catch (error) {
      throw new Error('Error registering participant with Viral Loops:' + error.message);
    }
  }

}
