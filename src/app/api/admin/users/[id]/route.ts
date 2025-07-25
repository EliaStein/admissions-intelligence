import { NextRequest, NextResponse } from 'next/server';
import { AdminGuard } from '../../../../../lib/admin-guard';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guardResult = await AdminGuard.validate(request);
    if (!guardResult.success) {
      return guardResult.response;
    }

    const { supaAdmin } = guardResult;

    // Await params before accessing properties
    const { id: userId } = await params;

    // Get user information
    const { data: userData, error: userError } = await supaAdmin
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
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's essays
    const { data: essaysData, error: essaysError } = await supaAdmin
      .from('essays')
      .select(`
        id,
        selected_prompt,
        personal_statement,
        student_college,
        essay_content,
        essay_feedback,
        created_at
      `)
      .eq('student_email', userData.email)
      .order('created_at', { ascending: false });

    if (essaysError) {
      console.error('Error fetching user essays:', essaysError);
      // Don't fail the request, just return empty essays
    }

    return NextResponse.json({
      user: userData,
      essays: essaysData || []
    });

  } catch (error) {
    console.error('Error in admin user GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guardResult = await AdminGuard.validate(request);
    if (!guardResult.success) {
      return guardResult.response;
    }

    const { supaAdmin } = guardResult;

    // Await params before accessing properties
    const { id: userId } = await params;
    const updateData = await request.json();

    // Validate the update data
    const allowedFields = ['first_name', 'last_name', 'role', 'credits', 'is_active'];
    const filteredData: any = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update the user
    const { data: updatedUser, error: updateError } = await supaAdmin
      .from('users')
      .update(filteredData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error in admin user PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guardResult = await AdminGuard.validate(request);
    if (!guardResult.success) {
      return guardResult.response;
    }

    const { supaAdmin, user } = guardResult;

    // Await params before accessing properties
    const { id: userId } = await params;

    // Prevent admin from deleting themselves
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Delete the user (this will cascade to related records due to foreign key constraints)
    const { error: deleteError } = await supaAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Error deleting user:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete user' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error in admin user DELETE API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
