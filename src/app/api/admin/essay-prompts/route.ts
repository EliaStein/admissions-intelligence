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

    // Get all essay prompts with school information
    const { data: essayPrompts, error: promptsError } = await supabase
      .from('essay_prompts')
      .select(`
        id,
        prompt,
        word_count,
        created_at,
        updated_at,
        schools (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (promptsError) {
      console.error('Error fetching essay prompts:', promptsError);
      return NextResponse.json(
        { error: 'Failed to fetch essay prompts' },
        { status: 500 }
      );
    }

    return NextResponse.json({ essayPrompts });

  } catch (error) {
    console.error('Error in admin essay prompts API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
