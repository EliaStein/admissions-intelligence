import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/api-auth', () => ({ getAuthenticatedUser: vi.fn() }));
vi.mock('@/lib/supabase-admin-client', () => ({ getAdminClient: vi.fn() }));
vi.mock('@/services/creditService', () => ({
  CreditService: { consumeCredits: vi.fn(), addCredits: vi.fn() },
}));
vi.mock('@/services/aiService', () => ({
  AIService: { processAIFeedbackRequest: vi.fn() },
}));
vi.mock('@/services/emailService', () => ({
  EmailService: { sendEssayFeedbackEmail: vi.fn() },
}));
vi.mock('@/services/essayDuplicateDetectionService', () => ({
  EssayDuplicateDetectionService: { checkForDuplicate: vi.fn() },
}));

import { POST } from '@/app/api/essays/route';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { getAdminClient } from '@/lib/supabase-admin-client';
import { CreditService } from '@/services/creditService';
import { AIService } from '@/services/aiService';
import { EmailService } from '@/services/emailService';
import { EssayDuplicateDetectionService } from '@/services/essayDuplicateDetectionService';

let insertedEssay: Record<string, unknown> | undefined;

function fakeAdmin() {
  const q: Record<string, unknown> = {};
  q.insert = (v: Record<string, unknown>) => { insertedEssay = v; return q; };
  q.select = () => q;
  q.update = () => q;
  q.eq = () => q;
  q.single = () =>
    Promise.resolve({ data: { ...insertedEssay, id: 'essay-1', created_at: '2026-01-01' }, error: null });
  q.then = (resolve: (v: unknown) => unknown) => Promise.resolve({ error: null }).then(resolve);
  return { from: () => q };
}

function makeReq(body: unknown) {
  return new NextRequest('http://localhost/api/essays', {
    method: 'POST',
    headers: { authorization: 'Bearer tok', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const baseEssay = {
  student_first_name: 'Auth',
  student_last_name: 'User',
  student_email: 'auth@example.com',
  student_college: 'USC',
  selected_prompt: 'Favorite book',
  personal_statement: false,
  essay_content: 'The Brothers Karamazov, for the way it argues with itself.',
};

beforeEach(() => {
  vi.clearAllMocks();
  insertedEssay = undefined;
  (getAuthenticatedUser as Mock).mockResolvedValue({ id: 'user-1', email: 'auth@example.com' });
  (getAdminClient as Mock).mockResolvedValue(fakeAdmin());
  (CreditService.consumeCredits as Mock).mockResolvedValue(true);
  (CreditService.addCredits as Mock).mockResolvedValue(true);
  (AIService.processAIFeedbackRequest as Mock).mockResolvedValue({ feedback: 'Nice work' });
  (EmailService.sendEssayFeedbackEmail as Mock).mockResolvedValue(undefined);
  (EssayDuplicateDetectionService.checkForDuplicate as Mock).mockResolvedValue({ isDuplicate: false });
});

// A prompt whose school states no word limit sends no `word_count`. That must
// still be a normal, complete submission — the prompt's limit has nothing to do
// with whether the student gets what they paid for.
describe('POST /api/essays — prompt with no stated word limit', () => {
  it('still consumes a credit', async () => {
    await POST(makeReq({ essay: baseEssay }));
    expect(CreditService.consumeCredits).toHaveBeenCalledWith(
      'user-1', 1, expect.any(String)
    );
  });

  it('still generates AI feedback', async () => {
    await POST(makeReq({ essay: baseEssay }));
    expect(AIService.processAIFeedbackRequest).toHaveBeenCalled();
  });

  it('still emails the feedback to the student', async () => {
    await POST(makeReq({ essay: baseEssay }));
    expect(EmailService.sendEssayFeedbackEmail).toHaveBeenCalled();
  });

  it('refunds the credit when generation fails, even with no word limit', async () => {
    (AIService.processAIFeedbackRequest as Mock).mockRejectedValue(new Error('openai down'));
    await POST(makeReq({ essay: baseEssay }));
    expect(CreditService.addCredits).toHaveBeenCalledWith('user-1', 1, expect.any(String));
  });
});
