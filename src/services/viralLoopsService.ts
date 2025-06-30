import 'server-only';

interface ViralLoopsParticipant {
  email: string;
  firstname?: string;
  lastname?: string;
  referralCode?: string;
}

interface ViralLoopsResponse {
  status: string;
  data?: any;
  message?: string;
}

export class ViralLoopsService {
  private static readonly API_BASE_URL = 'https://app.viral-loops.com/api/v3';
  private static readonly CAMPAIGN_ID = process.env.VIRAL_LOOPS_CAMPAIGN_ID;
  private static readonly API_TOKEN = process.env.VIRAL_LOOPS_API_TOKEN;

  /**
   * Register a new participant in the Viral Loops campaign
   */
  static async registerParticipant(participant: ViralLoopsParticipant): Promise<string | null> {
    try {
      if (!this.CAMPAIGN_ID || !this.API_TOKEN) {
        console.error('Viral Loops configuration missing');
        return null;
      }

      const response = await fetch(`${this.API_BASE_URL}/campaign/participant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_TOKEN}`,
        },
        body: JSON.stringify({
          campaignId: this.CAMPAIGN_ID,
          email: participant.email,
          firstname: participant.firstname,
          lastname: participant.lastname,
          referralCode: participant.referralCode,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Viral Loops API error:', response.status, errorText);
        return null;
      }

      const data: ViralLoopsResponse = await response.json();
      
      if (data.status === 'success' && data.data?.participantId) {
        console.log('Successfully registered participant with Viral Loops:', data.data.participantId);
        return data.data.participantId;
      } else {
        console.error('Viral Loops registration failed:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Error registering participant with Viral Loops:', error);
      return null;
    }
  }

  /**
   * Track a conversion event for a participant
   */
  static async trackConversion(participantId: string, conversionType: string = 'payment'): Promise<boolean> {
    try {
      if (!this.CAMPAIGN_ID || !this.API_TOKEN) {
        console.error('Viral Loops configuration missing');
        return false;
      }

      const response = await fetch(`${this.API_BASE_URL}/campaign/participant/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_TOKEN}`,
        },
        body: JSON.stringify({
          campaignId: this.CAMPAIGN_ID,
          participantId: participantId,
          conversionType: conversionType,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Viral Loops conversion tracking error:', response.status, errorText);
        return false;
      }

      const data: ViralLoopsResponse = await response.json();
      
      if (data.status === 'success') {
        console.log('Successfully tracked conversion with Viral Loops:', participantId);
        return true;
      } else {
        console.error('Viral Loops conversion tracking failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error tracking conversion with Viral Loops:', error);
      return false;
    }
  }

  /**
   * Get participant information by email
   */
  static async getParticipantByEmail(email: string): Promise<any | null> {
    try {
      if (!this.CAMPAIGN_ID || !this.API_TOKEN) {
        console.error('Viral Loops configuration missing');
        return null;
      }

      const response = await fetch(`${this.API_BASE_URL}/campaign/participant?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.API_TOKEN}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Viral Loops get participant error:', response.status, errorText);
        return null;
      }

      const data: ViralLoopsResponse = await response.json();
      
      if (data.status === 'success' && data.data) {
        return data.data;
      } else {
        console.error('Viral Loops get participant failed:', data.message);
        return null;
      }
    } catch (error) {
      console.error('Error getting participant from Viral Loops:', error);
      return null;
    }
  }

  /**
   * Register a participant and track their signup
   */
  static async registerAndTrackSignup(
    email: string,
    firstName?: string,
    lastName?: string,
    referralCode?: string
  ): Promise<string | null> {
    try {
      // First register the participant
      const participantId = await this.registerParticipant({
        email,
        firstname: firstName,
        lastname: lastName,
        referralCode,
      });

      if (!participantId) {
        return null;
      }

      // Track signup conversion
      await this.trackConversion(participantId, 'signup');

      return participantId;
    } catch (error) {
      console.error('Error in registerAndTrackSignup:', error);
      return null;
    }
  }
}
