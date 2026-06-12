import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '../../../services/aiService';
import { AiFeedbackRequest } from '../../../types/aiService';
import { getAuthenticatedUser } from '../../../lib/api-auth';
import { CreditService } from '../../../services/creditService';

const MAX_ESSAY_LENGTH = 50_000; // chars; well above any real essay

export async function POST(request: NextRequest) {
  try {
    // Feedback costs OpenAI tokens and a user credit — require a verified
    // user and consume the credit before generating.
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body: AiFeedbackRequest = await request.json();

    if (!body?.essay?.essay_content || body.essay.essay_content.length > MAX_ESSAY_LENGTH) {
      return NextResponse.json(
        { error: 'Essay content is missing or too long' },
        { status: 400 }
      );
    }

    const creditConsumed = await CreditService.consumeCredits(
      user.id,
      1,
      'AI feedback request'
    );
    if (!creditConsumed) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          message: 'You need at least 1 credit to get AI feedback. Please purchase more credits.',
          requiresCredits: true
        },
        { status: 402 }
      );
    }

    try {
      const response = await AIService.processAIFeedbackRequest(body);
      return NextResponse.json(response);
    } catch (aiError) {
      await CreditService.addCredits(user.id, 1); // refund
      throw aiError;
    }

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
