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

export async function POST(request: NextRequest) {
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
    const { school_id, prompt, word_count } = body;

    if (!school_id || !prompt || !word_count) {
      return NextResponse.json(
        { error: 'School ID, prompt, and word count are required' },
        { status: 400 }
      );
    }

    // Create the essay prompt
    const { data: newPrompt, error: createError } = await supabase
      .from('essay_prompts')
      .insert({
        school_id,
        prompt,
        word_count: word_count.toString()
      })
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
      .single();

    if (createError) {
      console.error('Error creating essay prompt:', createError);
      return NextResponse.json(
        { error: 'Failed to create essay prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      essayPrompt: newPrompt
    });

  } catch (error) {
    console.error('Error in admin essay prompts POST API:', error);
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
    const { id, school_id, prompt, word_count } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Essay prompt ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (school_id !== undefined) updateData.school_id = school_id;
    if (prompt !== undefined) updateData.prompt = prompt;
    if (word_count !== undefined) updateData.word_count = word_count.toString();

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the essay prompt
    const { data: updatedPrompt, error: updateError } = await supabase
      .from('essay_prompts')
      .update(updateData)
      .eq('id', id)
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
      .single();

    if (updateError) {
      console.error('Error updating essay prompt:', updateError);
      return NextResponse.json(
        { error: 'Failed to update essay prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      essayPrompt: updatedPrompt
    });

  } catch (error) {
    console.error('Error in admin essay prompts PUT API:', error);
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
        { error: 'Essay prompt ID is required' },
        { status: 400 }
      );
    }

    // Delete the essay prompt
    const { error: deleteError } = await supabase
      .from('essay_prompts')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting essay prompt:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete essay prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Essay prompt deleted successfully'
    });

  } catch (error) {
    console.error('Error in admin essay prompts DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
