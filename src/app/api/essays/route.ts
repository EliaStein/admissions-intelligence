import { NextRequest, NextResponse } from 'next/server';
import { Essay } from '../../../types/essay';
import { getAdminClient } from '../../../lib/supabase-admin-client';
import { getAuthenticatedUser } from '../../../lib/api-auth';
import { EmailService } from '../../../services/emailService';
import { AIService } from '../../../services/aiService';
import { AiFeedbackRequest } from '../../../types/aiService';
import { CreditService } from '../../../services/creditService';
import { EssayDuplicateDetectionService } from '../../../services/essayDuplicateDetectionService';

const MAX_ESSAY_LENGTH = 50_000; // chars; well above any real essay

interface EssaySubmissionRequest {
  essay: Essay;
  word_count?: number;
  user_info?: {
    user_id?: string;
    email?: string;
    [key: string]: unknown;
  };
}

export async function POST(request: NextRequest) {
  try {
    // The user is derived from the verified token — never from the request
    // body, which would let callers spend other users' credits (or nobody's).
    const user = await getAuthenticatedUser(request);
    if (!user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    const userId = user.id;

    const body: EssaySubmissionRequest = await request.json();

    // Handle both legacy format (direct Essay) and new format (with essay property)
    const essay: Essay = 'essay' in body ? body.essay : body as Essay;
    const wordCount = body.word_count;

    if (!essay?.essay_content || essay.essay_content.length > MAX_ESSAY_LENGTH) {
      return NextResponse.json(
        { error: 'Essay content is missing or too long' },
        { status: 400 }
      );
    }

    // Ownership comes from the verified token, never the request body. A
    // body-supplied student_email would let a caller attribute the essay to
    // anyone — making it readable under their RLS scope, sending the feedback
    // email to an attacker-chosen address, and keying the duplicate/rate-limit
    // checks off a spoofable value.
    essay.student_email = user.email;

    // Check for duplicate submissions (only for personal statements with AI feedback requested)
    if (wordCount && essay.personal_statement) {
      const duplicateCheck = await EssayDuplicateDetectionService.checkForDuplicate(
        essay.student_email,
        essay.personal_statement
      );

      if (duplicateCheck.isDuplicate) {
        return NextResponse.json(
          {
            error: 'Duplicate submission detected',
            message: duplicateCheck.message,
            isDuplicate: true,
            submissionCount: duplicateCheck.submissionCount
          },
          { status: 429 } // Too Many Requests
        );
      }
    }

    // Consume the credit atomically before generating feedback; refunded
    // below if generation fails. A post-generation consume would let two
    // concurrent submissions get feedback for one credit.
    if (wordCount) {
      const creditConsumed = await CreditService.consumeCredits(
        userId,
        1,
        'AI feedback for essay submission'
      );
      if (!creditConsumed) {
        return NextResponse.json(
          {
            error: 'Insufficient credits',
            message: 'You need at least 1 credit to get AI feedback. Please purchase more credits.',
            requiresCredits: true
          },
          { status: 402 } // Payment Required
        );
      }
    }

    const supabaseAdmin = await getAdminClient();

    const { data, error } = await supabaseAdmin
      .from('essays')
      .insert(essay)
      .select()
      .single();

    if (error) {
      console.error('Error saving essay:', error.message);
      if (wordCount) await CreditService.addCredits(userId, 1); // refund
      return NextResponse.json(
        { error: 'Failed to save essay', details: error.message },
        { status: 500 }
      );
    }

    if (wordCount && data) {
      try {
        const aiFeedbackRequest: AiFeedbackRequest = {
          essay: {
            id: data.id,
            student_first_name: essay.student_first_name,
            student_last_name: essay.student_last_name,
            student_email: essay.student_email,
            student_college: essay.student_college,
            selected_prompt: essay.selected_prompt,
            personal_statement: essay.personal_statement,
            essay_content: essay.essay_content,
            created_at: data.created_at,
            word_count: wordCount,
          },
          user_info: { user_id: userId, email: user.email }
        };

        await AIService.processAIFeedbackRequest(aiFeedbackRequest).then(async (feedback) => {
          const { error: updateError } = await supabaseAdmin
            .from('essays')
            .update({ essay_feedback: feedback.feedback })
            .eq('id', data.id);

          if (updateError) {
            throw updateError;
          }

          // Send feedback email to student
          try {
            const studentName = `${essay.student_first_name} ${essay.student_last_name}`;
            const essayType = essay.personal_statement ? 'Personal Statement' : 'Supplemental Essay';

            await EmailService.sendEssayFeedbackEmail(
              essay.student_email,
              studentName,
              essayType,
              feedback.feedback
            );
          } catch (emailError) {
            console.error('Error sending feedback email to student:', emailError);
            // Don't fail the request if email fails, just log it
          }
        })
      } catch (aiError) {
        console.error('Error generating feedback:', aiError);
        await CreditService.addCredits(userId, 1); // refund
        return NextResponse.json(
          { error: 'Failed to save essay', details: aiError },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Essay saved successfully',
      essay: data,
    });

  } catch (error) {
    console.error('Error processing essay submission:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Failed to save essay',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
