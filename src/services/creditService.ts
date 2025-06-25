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
<<<<<<< HEAD
=======
  /**
   * Get the current credit balance for a user
   */
>>>>>>> 011134a (wip - pricing layout, stripe price and service outline)
  static async getCreditBalance(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
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

<<<<<<< HEAD
=======
  /**
   * Check if a user has sufficient credits
   */
>>>>>>> 011134a (wip - pricing layout, stripe price and service outline)
  static async hasSufficientCredits(userId: string, requiredCredits: number = 1): Promise<boolean> {
    try {
      const currentCredits = await this.getCreditBalance(userId);
      return currentCredits >= requiredCredits;
    } catch (error) {
      console.error('Error checking credit balance:', error);
      return false;
    }
  }

<<<<<<< HEAD
=======
  /**
   * Consume credits for a user (server-side only)
   */
>>>>>>> 011134a (wip - pricing layout, stripe price and service outline)
  static async consumeCredits(userId: string, amount: number = 1, description: string = 'Essay feedback'): Promise<boolean> {
    try {
      const supabaseAdmin = await getAdminClient();

      // First check if user has sufficient credits
      const { data: userData, error: fetchError } = await supabaseAdmin
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
      const { error: updateError } = await supabaseAdmin
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

<<<<<<< HEAD
  static async addCredits(userId: string, amount: number): Promise<boolean> {
    try {
      const supabaseAdmin = await getAdminClient();

=======
  /**
   * Add credits to a user (server-side only, typically after payment)
   */
  static async addCredits(userId: string, amount: number, description: string = 'Credit purchase'): Promise<boolean> {
    try {
      const supabaseAdmin = await getAdminClient();

      // Get current credits
>>>>>>> 011134a (wip - pricing layout, stripe price and service outline)
      const { data: userData, error: fetchError } = await supabaseAdmin
        .from('users')
        .select('credits')
        .eq('id', userId)
        .single();

      if (fetchError) {
<<<<<<< HEAD
        console.error('[Error] fetching user credits:', fetchError);
=======
        console.error('Error fetching user credits:', fetchError);
>>>>>>> 011134a (wip - pricing layout, stripe price and service outline)
        return false;
      }

      const currentCredits = userData?.credits || 0;
      const newCredits = currentCredits + amount;

<<<<<<< HEAD
=======
      // Add credits
>>>>>>> 011134a (wip - pricing layout, stripe price and service outline)
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ credits: newCredits })
        .eq('id', userId);

      if (updateError) {
<<<<<<< HEAD
        console.error('[Error] adding credits:', updateError);
        return false;
      }

      console.log(`[Success] added ${amount} credits for user ${userId}. New balance: ${newCredits}`);
=======
        console.error('Error adding credits:', updateError);
        return false;
      }

      console.log(`Successfully added ${amount} credits for user ${userId}. New balance: ${newCredits}`);
>>>>>>> 011134a (wip - pricing layout, stripe price and service outline)
      return true;
    } catch (error) {
      console.error('Error in addCredits:', error);
      return false;
    }
  }

<<<<<<< HEAD
=======
  /**
   * Get credit balance for the current authenticated user (client-side)
   */
>>>>>>> 011134a (wip - pricing layout, stripe price and service outline)
  static async getCurrentUserCredits(): Promise<number> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      return await this.getCreditBalance(session.user.id);
    } catch (error) {
<<<<<<< HEAD
      console.error('[Error] getting current user credits:', error);
=======
      console.error('Error getting current user credits:', error);
>>>>>>> 011134a (wip - pricing layout, stripe price and service outline)
      throw error;
    }
  }
}
