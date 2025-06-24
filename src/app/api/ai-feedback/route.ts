import { NextRequest, NextResponse } from 'next/server';
import { CONFIG_KEYS, ConfigService } from '../../../services/configService';

interface AiFeedbackRequest {
  essay: {
    id?: string;
    student_first_name: string;
    student_last_name: string;
    student_email: string;
    student_college: string | null;
    selected_prompt: string;
    personal_statement: boolean;
    essay_content: string;
    created_at?: string;
  };
  user_info?: {
    user_id?: string;
    email?: string;
    [key: string]: any;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Retrieve OpenAI API key from config table
    const openAIKey = await ConfigService.getConfigValue(CONFIG_KEYS.OPEN_AI_KEY);
    if (!openAIKey) {
      console.error('OpenAI API key not found in config table');
      return NextResponse.json(
        { error: 'AI service configuration error' },
        { status: 500 }
      );
    }

    console.log('OpenAI API key retrieved successfully');

    // Parse the request body
    const body: AiFeedbackRequest = await request.json();
    
    // Validate required fields
    if (!body.essay) {
      return NextResponse.json(
        { error: 'Essay data is required' },
        { status: 400 }
      );
    }

    const { essay, user_info } = body;

    // Validate required essay fields
    const requiredFields = [
      'student_first_name',
      'student_last_name', 
      'student_email',
      'selected_prompt',
      'essay_content'
    ];

    for (const field of requiredFields) {
      if (!essay[field as keyof typeof essay]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Log the received data to console
    console.log('=== AI Feedback Request Received ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Essay Data:', {
      student_name: `${essay.student_first_name} ${essay.student_last_name}`,
      student_email: essay.student_email,
      student_college: essay.student_college,
      essay_type: essay.personal_statement ? 'Personal Statement' : 'Supplemental Essay',
      selected_prompt: essay.selected_prompt,
      essay_length: essay.essay_content.length,
      essay_word_count: essay.essay_content.split(/\s+/).filter(word => word.length > 0).length,
      essay_preview: essay.essay_content.substring(0, 100) + (essay.essay_content.length > 100 ? '...' : '')
    });
    
    if (user_info) {
      console.log('User Info:', user_info);
    }
    
    console.log('=== End AI Feedback Request ===\n');

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Essay received successfully for AI feedback processing',
      received_at: new Date().toISOString(),
      essay_id: essay.id || 'pending',
      word_count: essay.essay_content.split(/\s+/).filter(word => word.length > 0).length
    });

  } catch (error) {
    console.error('Error processing AI feedback request:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to process AI feedback request'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to submit essays for feedback.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to submit essays for feedback.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to submit essays for feedback.' },
    { status: 405 }
  );
}
