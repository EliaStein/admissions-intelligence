import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '../../../../lib/supabase-admin-client';
import { AdminGuard } from '../../../../lib/admin-guard';

export async function GET(request: NextRequest) {
  try {
    // Validate admin authentication and authorization
    const guardResult = await AdminGuard.validate(request);
    if (!guardResult.success) {
      return guardResult.response;
    }

    const { supaAdmin } = guardResult;

    // Get all essay prompts with school information
    const { data: essayPrompts, error: promptsError } = await supaAdmin
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
    // Validate admin authentication and authorization
    const guardResult = await AdminGuard.validate(request);
    if (!guardResult.success) {
      return guardResult.response;
    }

    const { supaAdmin } = guardResult;
    const body = await request.json();
    const { school_id, prompt, word_count } = body;

    if (!school_id || !prompt || !word_count) {
      return NextResponse.json(
        { error: 'School ID, prompt, and word count are required' },
        { status: 400 }
      );
    }

    // Create the essay prompt
    const { data: newPrompt, error: createError } = await supaAdmin
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
    // Validate admin authentication and authorization
    const guardResult = await AdminGuard.validate(request);
    if (!guardResult.success) {
      return guardResult.response;
    }

    const { supaAdmin } = guardResult;

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
    const { data: updatedPrompt, error: updateError } = await supaAdmin
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
    // Validate admin authentication and authorization
    const guardResult = await AdminGuard.validate(request);
    if (!guardResult.success) {
      return guardResult.response;
    }

    const { supaAdmin } = guardResult;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Essay prompt ID is required' },
        { status: 400 }
      );
    }

    // Delete the essay prompt
    const { error: deleteError } = await supaAdmin
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
