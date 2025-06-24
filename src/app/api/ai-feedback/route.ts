import { NextRequest, NextResponse } from 'next/server';
import { AiFeedbackRequest, AIService } from '../../../services/aiService';

export async function POST(request: NextRequest) {
  try {
    const body: AiFeedbackRequest = await request.json();
    const response = await AIService.processAIFeedbackRequest(body);
    return NextResponse.json(response);

  } catch (error) {
    console.error('Error processing AI feedback request:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to process AI feedback request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
