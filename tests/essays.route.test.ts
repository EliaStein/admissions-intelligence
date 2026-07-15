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
  q.insert = (v: Record<string, unknown>) => {
    insertedEssay = v;
    return q;
  };
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
  student_email: 'victim@example.com', // attacker-supplied; must be ignored
  student_college: null,
  selected_prompt: 'Why us?',
  personal_statement: true,
  essay_content: 'My essay content',
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

describe('POST /api/essays — auth', () => {
  it('returns 401 when there is no authenticated user', async () => {
    (getAuthenticatedUser as Mock).mockResolvedValue(null);
    const res = await POST(makeReq({ essay: baseEssay, word_count: 500 }));
    expect(res.status).toBe(401);
  });
});

describe('POST /api/essays — ownership (IDOR fix)', () => {
  it('forces student_email to the verified token, ignoring the body value', async () => {
    const res = await POST(makeReq({ essay: { ...baseEssay }, word_count: 500 }));
    expect(res.status).toBe(200);

    // The persisted row uses the token email, not the attacker-supplied one.
    expect(insertedEssay?.student_email).toBe('auth@example.com');

    // Duplicate check is keyed off the token email, not the spoofable value.
    expect(EssayDuplicateDetectionService.checkForDuplicate).toHaveBeenCalledWith(
      'auth@example.com',
      true
    );

    // Feedback email goes to the token email.
    expect(EmailService.sendEssayFeedbackEmail).toHaveBeenCalledWith(
      'auth@example.com',
      expect.any(String),
      expect.any(String),
      'Nice work'
    );
  });
});

describe('POST /api/essays — credits & duplicates', () => {
  it('returns 429 and does not consume a credit on duplicate submission', async () => {
    (EssayDuplicateDetectionService.checkForDuplicate as Mock).mockResolvedValue({
      isDuplicate: true,
      message: 'dup',
      submissionCount: 5,
    });
    const res = await POST(makeReq({ essay: { ...baseEssay }, word_count: 500 }));
    expect(res.status).toBe(429);
    expect(CreditService.consumeCredits).not.toHaveBeenCalled();
  });

  it('returns 402 when the user has no credits', async () => {
    (CreditService.consumeCredits as Mock).mockResolvedValue(false);
    const res = await POST(makeReq({ essay: { ...baseEssay }, word_count: 500 }));
    expect(res.status).toBe(402);
  });

  it('refunds the credit (with a reason) when feedback generation fails', async () => {
    (AIService.processAIFeedbackRequest as Mock).mockRejectedValue(new Error('openai down'));
    const res = await POST(makeReq({ essay: { ...baseEssay }, word_count: 500 }));
    expect(res.status).toBe(500);
    expect(CreditService.addCredits).toHaveBeenCalledWith(
      'user-1',
      1,
      'Refund: feedback generation failed'
    );
  });
});
