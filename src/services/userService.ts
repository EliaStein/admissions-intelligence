import { getAdminClient } from '../lib/supabase-admin-client';
import { ViralLoopsService } from './viralLoopsService';
import { ReferralService } from './referralService';

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
}

export interface CreateUserResponse {
  success: boolean;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    is_active: boolean;
  };
  error?: string;
}

export class UserService {

  static async createUser(userData: CreateUserRequest): Promise<CreateUserResponse> {
    const { email, password, firstName, lastName, referralCode } = userData;

    try {
      const supabaseAdmin = await getAdminClient();

      // Create user with Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        password,
        email_confirm: true,
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        return {
          success: false,
          error: authError.message || 'Failed to create user account'
        };
      }

      if (!authData.user) {
        return {
          success: false,
          error: 'Failed to create user account'
        };
      }

      // Insert user data into custom users table
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email: email.toLowerCase(),
          first_name: firstName,
          last_name: lastName,
          role: 'student',
          is_active: true,
          referral_code_used: referralCode || null
        })
        .select()
        .single();

      if (userError) {
        console.error('Error creating user profile:', userError);

        // If user table insert fails, delete the auth user
        try {
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        } catch (deleteError) {
          console.error('Error cleaning up auth user:', deleteError);
        }

        return {
          success: false,
          error: 'Failed to create user profile'
        };
      }

      if (referralCode) {
        try {
          await this.handleReferralTracking({
            userId: authData.user.id,
            email: email.toLowerCase(),
            firstName,
            lastName,
            referralCode
          });
        } catch (referralError) {
          console.error('Error with referral tracking:', referralError);
          // Don't fail the user creation if referral tracking fails
        }
      }

      return {
        success: true,
        user: userData
      };

    } catch (error) {
      console.error('Error in createUser:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      };
    }
  }

  private static async handleReferralTracking(data: {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    referralCode: string;
  }): Promise<void> {
    const { userId, email, firstName, lastName, referralCode } = data;

    let viralLoopsParticipantId: string | null = null;

    try {
      viralLoopsParticipantId = await ViralLoopsService.registerAndTrackSignup(
        email,
        firstName,
        lastName,
        referralCode
      );

      if (viralLoopsParticipantId) {
        console.log('Successfully registered with Viral Loops:', viralLoopsParticipantId);
      }
    } catch (viralLoopsError) {
      console.error('Error with Viral Loops integration:', viralLoopsError);
      // Continue with referral tracking even if Viral Loops fails
    }

    try {
      // Mark referral as signed up
      const signupSuccess = await ReferralService.markReferralSignup(referralCode, userId);
      if (signupSuccess) {
        console.log('Referral signup marked successfully');
      } else {
        console.error('Failed to mark referral signup');
      }
    } catch (referralError) {
      console.error('Error marking referral signup:', referralError);
    }
  }

  static async getUserById(userId: string) {
    try {
      const supabaseAdmin = await getAdminClient();

      const { data, error } = await supabaseAdmin
        .from('users')
        .select(`
          id,
          email,
          first_name,
          last_name,
          role,
          credits,
          is_active,
          created_at,
          updated_at
        `)
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserById:', error);
      return null;
    }
  }

  static async updateUser(userId: string, updateData: Partial<{
    first_name: string;
    last_name: string;
    role: string;
    credits: number;
    is_active: boolean;
  }>) {
    try {
      const supabaseAdmin = await getAdminClient();

      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateUser:', error);
      return null;
    }
  }

  static async deleteUser(userId: string) {
    try {
      const supabaseAdmin = await getAdminClient();

      // Soft delete by setting is_active to false
      const { error } = await supabaseAdmin
        .from('users')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteUser:', error);
      return false;
    }
  }
}
