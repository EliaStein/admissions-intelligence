import { supabase } from '../lib/supabase';
import { getAdminClient } from '../lib/supabase-admin-client';

export interface CreditBalance {
  credits: number;
  userId: string;
}

export interface CreditTransaction {
  userId: string;
  amount: number;
  type: 'consume' | 'add';
  description: string;
}

export class CreditService {
  // TODO: move to backend
  static async getCreditBalance(userId: string): Promise<number> {
    try {
      const supaAdmin = await getAdminClient();
      const { data, error } = await supaAdmin
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching credit balance:', error);
        throw new Error('Failed to fetch credit balance');
      }

      return data?.credits || 0;
    } catch (error) {
      console.error('Error in getCreditBalance:', error);
      throw error;
    }
  }

  static async hasSufficientCredits(userId: string, requiredCredits: number = 1): Promise<boolean> {
    try {
      const currentCredits = await this.getCreditBalance(userId);
      return currentCredits >= requiredCredits;
    } catch (error) {
      console.error('Error checking credit balance:', error);
      return false;
    }
  }

  // TODO: move to backend
  static async consumeCredits(userId: string, amount: number = 1, description: string = 'Essay feedback'): Promise<boolean> {
    try {
      const supaAdmin = await getAdminClient();

      // First check if user has sufficient credits
      const { data: userData, error: fetchError } = await supaAdmin
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('Error fetching user credits:', fetchError);
        return false;
      }

      const currentCredits = userData?.credits || 0;
      if (currentCredits < amount) {
        console.error('Insufficient credits:', { currentCredits, required: amount });
        return false;
      }

      // Consume credits
      const { error: updateError } = await supaAdmin
        .from('users')
        .update({ credits: currentCredits - amount })
        .eq('id', userId);

      if (updateError) {
        console.error('Error consuming credits:', updateError);
        return false;
      }

      console.log(`Successfully consumed ${amount} credits for user ${userId}. Remaining: ${currentCredits - amount}`);
      return true;
    } catch (error) {
      console.error('Error in consumeCredits:', error);
      return false;
    }
  }

  // TODO: move to backend
  static async addCredits(userId: string, amount: number): Promise<boolean> {
    try {
      const supabaseAdmin = await getAdminClient();

      const { data: userData, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (fetchError) {
        console.error('[Error] fetching user credits:', fetchError);
        return false;
      }

      const currentCredits = userData?.credits || 0;
      const newCredits = currentCredits + amount;

      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ credits: newCredits })
        .eq('id', userId);

      if (updateError) {
        console.error('[Error] adding credits:', updateError);
        return false;
      }

      console.log(`[Success] added ${amount} credits for user ${userId}. New balance: ${newCredits}`);
      return true;
    } catch (error) {
      console.error('Error in addCredits:', error);
      return false;
    }
  }

  // TODO: move to backend
  static async getCurrentUserCredits(): Promise<number> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      return await this.getCreditBalance(session.user.id);
    } catch (error) {
      console.error('[Error] getting current user credits:', error);
      throw error;
    }
  }
}
