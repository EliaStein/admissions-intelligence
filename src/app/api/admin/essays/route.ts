import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '../../../../lib/supabase-admin-client';

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

    // Get query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const personalStatement = searchParams.get('personal_statement');

    const offset = (page - 1) * limit;

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
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`student_first_name.ilike.%${search}%,student_last_name.ilike.%${search}%,student_email.ilike.%${search}%,student_college.ilike.%${search}%`);
    }

    if (personalStatement !== null && personalStatement !== undefined) {
      query = query.eq('personal_statement', personalStatement === 'true');
    }

    // Apply pagination and ordering
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    const { data: essays, error: essaysError, count } = await query;

    if (essaysError) {
      console.error('Error fetching essays:', essaysError);
      return NextResponse.json(
        { error: 'Failed to fetch essays' },
        { status: 500 }
      );
    }

    // Get user information for essays
    const essaysWithUserInfo = await Promise.all(
      (essays || []).map(async (essay) => {
        // Try to get user info from users table
        const { data: userData } = await supabase
          .from('users')
          .select('id, credits, role, is_active')
          .eq('email', essay.student_email)
          .single();

        return {
          ...essay,
          user_info: userData || null
        };
      })
    );

    return NextResponse.json({
      essays: essaysWithUserInfo,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in admin essays API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Essay ID is required' },
        { status: 400 }
      );
    }

    // Update the essay
    const { data: updatedEssay, error: updateError } = await supabase
      .from('essays')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating essay:', updateError);
      return NextResponse.json(
        { error: 'Failed to update essay' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      essay: updatedEssay
    });

  } catch (error) {
    console.error('Error in admin essays PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Essay ID is required' },
        { status: 400 }
      );
    }

    // Delete the essay
    const { error: deleteError } = await supabase
      .from('essays')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting essay:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete essay' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Essay deleted successfully'
    });

  } catch (error) {
    console.error('Error in admin essays DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
