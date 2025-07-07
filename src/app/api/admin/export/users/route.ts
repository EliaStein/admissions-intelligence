import { NextRequest, NextResponse } from 'next/server';
import { AdminGuard } from '../../../../../lib/admin-guard';

export async function GET(request: NextRequest) {
  try {
    const guardResult = await AdminGuard.validate(request);
    if (!guardResult.success) {
      return guardResult.response;
    }

    const { supaAdmin } = guardResult;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const includeInactive = searchParams.get('include_inactive') === 'true';

    // Build query
    let query = supaAdmin
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
      `);

    // Apply filters
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    // Order by creation date
    query = query.order('created_at', { ascending: false });

    const { data: users, error: usersError } = await query;

    if (usersError) {
      console.error('Error fetching users for export:', usersError);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Get essay counts for each user
    const usersWithEssayCounts = await Promise.all(
      (users || []).map(async (user) => {
        const { count } = await supaAdmin
          .from('essays')
          .select('*', { count: 'exact', head: true })
          .eq('student_email', user.email);

        return {
          ...user,
          essay_count: count || 0
        };
      })
    );

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = [
        'ID',
        'Email',
        'First Name',
        'Last Name',
        'Role',
        'Credits',
        'Active',
        'Essay Count',
        'Created At',
        'Updated At'
      ];

      const csvRows = usersWithEssayCounts.map(user => [
        user.id,
        user.email,
        user.first_name,
        user.last_name,
        user.role,
        user.credits,
        user.is_active ? 'Yes' : 'No',
        user.essay_count,
        user.created_at,
        user.updated_at
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Return CSV file
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="users-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Return JSON format
    return NextResponse.json({
      users: usersWithEssayCounts,
      exportedAt: new Date().toISOString(),
      totalCount: usersWithEssayCounts.length
    });

  } catch (error) {
    console.error('Error in admin users export API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
