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
      console.log('hasSufficientCredits', { currentCredits });
      return currentCredits >= requiredCredits;
    } catch (error) {
      console.error('Error checking credit balance:', error);
      return false;
    }
  }

  // Atomic: single UPDATE guarded by `credits >= amount`, so concurrent
  // requests can't double-spend. Returns false when credits are insufficient.
  static async consumeCredits(userId: string, amount: number = 1, description: string = 'Essay feedback'): Promise<boolean> {
    try {
      const supaAdmin = await getAdminClient();
      const { data, error } = await supaAdmin
        .rpc('consume_user_credits', { p_user_id: userId, p_amount: amount, p_description: description });

      if (error) {
        console.error('Error consuming credits:', error);
        return false;
      }

      if (data === null) {
        console.error('Insufficient credits for user:', userId);
        return false;
      }

      console.log(`Successfully consumed ${amount} credits for user ${userId}. Remaining: ${data}`);
      return true;
    } catch (error) {
      console.error('Error in consumeCredits:', error);
      return false;
    }
  }

  static async addCredits(userId: string, amount: number, description: string = 'Credit added'): Promise<boolean> {
    try {
      const supabaseAdmin = await getAdminClient();
      const { data, error } = await supabaseAdmin
        .rpc('add_user_credits', { p_user_id: userId, p_amount: amount, p_description: description });

      if (error || data === null) {
        console.error('[Error] adding credits:', error ?? 'user not found');
        return false;
      }

      console.log(`[Success] added ${amount} credits for user ${userId}. New balance: ${data}`);
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
