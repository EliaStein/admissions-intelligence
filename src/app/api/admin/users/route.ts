import { NextRequest, NextResponse } from 'next/server';
import { AdminGuard } from '../../../../lib/admin-guard';

export async function GET(request: NextRequest) {
  try {
    const guardResult = await AdminGuard.validate(request);
    if (!guardResult.success) {
      return guardResult.response;
    }

    const { supaAdmin } = guardResult;

    // Get all users with their information
    const { data: users, error: usersError } = await supaAdmin
      .from('users')
      .select(`
        id,
        email,
        first_name,
        last_name,
        role,
        credits,
        is_active,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    return NextResponse.json({ users });

  } catch (error) {
    console.error('Error in admin users API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
