import 'server-only';
import viralLoopsDocs from '@api/viral-loops-docs';

interface ViralLoopsParticipant {
  email: string;
  firstname?: string;
  lastname?: string;
  referralCode?: string;
}

export class ViralLoopsService {

  /**
   * Custom implementation of postCampaignParticipantConvert
   * Replaces the buggy viralLoopsDocs.postCampaignParticipantConvert
   */
  static async postCampaignParticipantConvert(email: string): Promise<void> {
    try {
      const apiToken = process.env.VIRAL_LOOPS_API_TOKEN;
      if (!apiToken) {
        throw new Error('VIRAL_LOOPS_API_TOKEN is not configured');
      }

      const url = 'https://app.viral-loops.com/api/v3/campaign/participant/convert';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'apiToken': apiToken
        },
        body: JSON.stringify({
          user: {
            email: email
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Viral Loops API error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error converting participant:', error);
      throw error;
    }
  }

  static async registerParticipant(participant: ViralLoopsParticipant) {
    if (!participant.referralCode) return null;

    try {
      const data = await viralLoopsDocs.postCampaignParticipant({
        user: {
          firstname: participant.firstname || '',
          lastname: participant.lastname || '',
          email: participant.email
        },
        referrer: { referralCode: participant.referralCode },
      }, {
        apiToken: process.env.VIRAL_LOOPS_API_TOKEN
      });
      console.log('postCampaignParticipant result', JSON.stringify(data));
      await this.postCampaignParticipantConvert(participant.email);
      return data;
    } catch (error) {
      console.log('registerParticipant', participant);
      console.error('Error in registerParticipant:', JSON.stringify(error));
      throw error;
    }
  }
}
