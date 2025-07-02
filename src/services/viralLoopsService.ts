import 'server-only';

interface ViralLoopsParticipant {
  email: string;
  firstname?: string;
  lastname?: string;
  referralCode?: string;
}

interface CampaignParticipantResponse {
  user: {
    email: string;
    firstname: string;
    lastname: string;
    referralCode: string;
  };
  campaign: {
    id: string;
    name: string;
  };
}

export class ViralLoopsService {
  /**
   * Custom implementation of postCampaignParticipant
   * Replaces the buggy viralLoopsDocs.postCampaignParticipant
   */
  static async postCampaignParticipant(participant: ViralLoopsParticipant): Promise<CampaignParticipantResponse> {
    try {
      const apiToken = process.env.VIRAL_LOOPS_API_TOKEN;
      const campaignId = process.env.VIRAL_LOOPS_CAMPAIGN_ID;

      if (!apiToken) {
        throw new Error('VIRAL_LOOPS_API_TOKEN is not configured');
      }

      if (!campaignId) {
        throw new Error('VIRAL_LOOPS_CAMPAIGN_ID is not configured');
      }

      const url = 'https://app.viral-loops.com/api/v3/campaign/participant';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'apiToken': apiToken
        },
        body: JSON.stringify({
          user: {
            firstname: participant.firstname || '',
            lastname: participant.lastname || '',
            email: participant.email
          },
          referrer: {
            referralCode: participant.referralCode
          },
          publicToken: campaignId
        })
      });

      if (!response.ok) {
        throw new Error(`Viral Loops API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.log('participant', participant);
      console.error('Error creating campaign participant:', error);
      throw error;
    }
  }

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
    console.log('registerParticipant', participant);
    if (!participant.referralCode) return null;

    try {
      const data = await this.postCampaignParticipant(participant);
      await this.postCampaignParticipantConvert(participant.email);
      return data;
    } catch (error) {
      console.error('Error in registerParticipant:', JSON.stringify(error));
      throw error;
    }
  }
}
