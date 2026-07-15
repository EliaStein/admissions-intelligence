import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/api-auth', () => ({ getAuthenticatedUser: vi.fn() }));
vi.mock('word-extractor', () => ({
  default: class {
    extract() {
      return Promise.resolve({ getBody: () => 'extracted text' });
    }
  },
}));

import { POST } from '@/app/api/extract-text/route';
import { getAuthenticatedUser } from '@/lib/api-auth';

function makeReq(file?: File) {
  const form = new FormData();
  if (file) form.append('file', file);
  return new NextRequest('http://localhost/api/extract-text', {
    method: 'POST',
    headers: { authorization: 'Bearer tok' },
    body: form,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  (getAuthenticatedUser as Mock).mockResolvedValue({ id: 'user-1', email: 'auth@example.com' });
});

describe('POST /api/extract-text', () => {
  it('returns 401 when unauthenticated', async () => {
    (getAuthenticatedUser as Mock).mockResolvedValue(null);
    const res = await POST(makeReq(new File(['x'], 'a.doc')));
    expect(res.status).toBe(401);
  });

  it('returns 413 when the file exceeds the size limit', async () => {
    // Real >10MB payload — FormData round-trips actual bytes, so a faked
    // `.size` would not survive request.formData().
    const file = new File([new Uint8Array(11 * 1024 * 1024)], 'big.doc');
    const res = await POST(makeReq(file));
    expect(res.status).toBe(413);
  });

  it('rejects non-.doc files with 400', async () => {
    const res = await POST(makeReq(new File(['x'], 'a.pdf')));
    expect(res.status).toBe(400);
  });

  it('extracts text from a valid .doc for an authenticated user', async () => {
    const res = await POST(makeReq(new File(['x'], 'a.doc')));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ success: true, content: 'extracted text' });
  });
});
