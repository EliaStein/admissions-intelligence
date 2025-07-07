import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from './supabase-admin-client';
import type { SupabaseClient, User } from '@supabase/supabase-js';

export interface AdminGuardResult {
  success: true;
  user: User;
  adminId: string;
  supaAdmin: SupabaseClient<any, "public", any>;
}

export interface AdminGuardError {
  success: false;
  response: NextResponse;
}

/**
 * AdminGuard utility for validating admin authentication and authorization
 * 
 * @param request - The NextRequest object containing the authorization header
 * @returns Promise<AdminGuardResult | AdminGuardError> - Success with user data or error response
 * 
 * @example
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   const guardResult = await AdminGuard.validate(request);
 *   if (!guardResult.success) {
 *     return guardResult.response;
 *   }
 *   
 *   const { user, adminId } = guardResult;
 *   // Continue with admin-only logic...
 * }
 * ```
 */
export class AdminGuard {
  static async validate(request: NextRequest): Promise<AdminGuardResult | AdminGuardError> {
    try {
      // Get the authorization header
      const authHeader = request.headers.get('authorization');
      if (!authHeader) {
        return {
          success: false,
          response: NextResponse.json(
            { error: 'Authorization header required' },
            { status: 401 }
          )
        };
      }

      const token = authHeader.replace('Bearer ', '');
      const supaAdmin = await getAdminClient();

      // Verify the token and check if user is admin
      const { data: { user }, error: authError } = await supaAdmin.auth.getUser(token);
      if (authError || !user) {
        return {
          success: false,
          response: NextResponse.json(
            { error: 'Invalid authentication token' },
            { status: 401 }
          )
        };
      }

      // Check if user is admin
      const { data: adminData, error: adminError } = await supaAdmin
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (adminError || !adminData) {
        return {
          success: false,
          response: NextResponse.json(
            { error: 'Admin access required' },
            { status: 403 }
          )
        };
      }

      return {
        success: true,
        supaAdmin,
        user,
        adminId: adminData.id
      };
    } catch (error) {
      console.error('AdminGuard validation error:', error);
      return {
        success: false,
        response: NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      };
    }
  }
}
