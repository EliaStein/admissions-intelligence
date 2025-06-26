import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '../../../../../lib/supabase-admin-client';

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header required' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = await getAdminClient();

    // Verify the token and check if user is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: adminData, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (adminError || !adminData) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const personalStatement = searchParams.get('personal_statement');

    // Build query
    let query = supabase
      .from('essays')
      .select(`
        id,
        student_first_name,
        student_last_name,
        student_email,
        student_college,
        selected_prompt,
        personal_statement,
        essay_content,
        essay_feedback,
        created_at,
        updated_at
      `);

    // Apply filters
    if (startDate) {
      query = query.gte('created_at', startDate);
    }
    if (endDate) {
      query = query.lte('created_at', endDate);
    }
    if (personalStatement !== null && personalStatement !== undefined) {
      query = query.eq('personal_statement', personalStatement === 'true');
    }

    // Order by creation date
    query = query.order('created_at', { ascending: false });

    const { data: essays, error: essaysError } = await query;

    if (essaysError) {
      console.error('Error fetching essays for export:', essaysError);
      return NextResponse.json(
        { error: 'Failed to fetch essays' },
        { status: 500 }
      );
    }

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = [
        'ID',
        'First Name',
        'Last Name',
        'Email',
        'College',
        'Essay Type',
        'Prompt',
        'Essay Content',
        'AI Feedback',
        'Created At',
        'Updated At'
      ];

      const csvRows = essays?.map(essay => [
        essay.id,
        essay.student_first_name,
        essay.student_last_name,
        essay.student_email,
        essay.student_college || '',
        essay.personal_statement ? 'Personal Statement' : 'Supplemental Essay',
        `"${essay.selected_prompt.replace(/"/g, '""')}"`, // Escape quotes
        `"${essay.essay_content.replace(/"/g, '""')}"`, // Escape quotes
        essay.essay_feedback ? `"${essay.essay_feedback.replace(/"/g, '""')}"` : '',
        essay.created_at,
        essay.updated_at
      ]) || [];

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      // Return CSV file
      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="essays-export-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Return JSON format
    return NextResponse.json({
      essays,
      exportedAt: new Date().toISOString(),
      totalCount: essays?.length || 0
    });

  } catch (error) {
    console.error('Error in admin essays export API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
