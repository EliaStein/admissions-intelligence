import { NextRequest, NextResponse } from 'next/server';
import { Essay } from '../../../types/essay';
import { getAdminClient } from '../../../lib/supabase-admin-client';
import emailjs from '@emailjs/nodejs';
import { EMAILJS_CONFIG } from '../../../config/emailjs';
import { AIService } from '../../../services/aiService';
import { AiFeedbackRequest } from '../../../types/aiService';

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
    const body: EssaySubmissionRequest = await request.json();

    // Handle both legacy format (direct Essay) and new format (with essay property)
    const essay: Essay = 'essay' in body ? body.essay : body as Essay;
    const wordCount = body.word_count;
    const userInfo = body.user_info;

    const supabaseAdmin = await getAdminClient();

    const { data, error } = await supabaseAdmin
      .from('essays')
      .insert(essay)
      .select()
      .single();

    if (error) {
      console.error('Error saving essay:', error.message);
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
          ...(userInfo && { user_info: userInfo })
        };

        // run in background
        AIService.processAIFeedbackRequest(aiFeedbackRequest).then(async (feedback) => {
          try {
            const { error: updateError } = await supabaseAdmin
              .from('essays')
              .update({ essay_feedback: feedback.feedback })
              .eq('id', data.id);

            if (updateError) {
              console.error('Error saving AI feedback to database:', updateError.message);
            } else {
              console.log('AI feedback saved successfully to database for essay:', data.id);
            }
          } catch (saveError) {
            console.error('Error saving AI feedback:', saveError);
          }
        }).catch(error => {
          console.error('Error generating AI feedback:', error);
        });
      } catch (aiError) {
        console.error('Error generating AI feedback:', aiError);
        // Don't fail the request if AI feedback fails, just log it
      }
    }

    try {
      const templateParams = {
        to_email: EMAILJS_CONFIG.TO_EMAIL,
        student_name: `${essay.student_first_name} ${essay.student_last_name}`,
        student_email: essay.student_email,
        college: essay.student_college || 'Personal Statement',
        prompt: essay.selected_prompt,
        essay_type: essay.personal_statement ? 'Personal Statement' : 'Supplemental Essay',
        essay_content: essay.essay_content,
        submission_date: new Date().toLocaleString()
      };

      await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        {
          publicKey: EMAILJS_CONFIG.PUBLIC_KEY,
        }
      );

    } catch (emailError) {
      console.error('Error sending email notification:', emailError);
      // Don't fail the request if email fails, just log it
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
