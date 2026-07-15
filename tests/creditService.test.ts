import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('@/lib/supabase-admin-client', () => ({ getAdminClient: vi.fn() }));

import { CreditService } from '@/services/creditService';
import { getAdminClient } from '@/lib/supabase-admin-client';

const rpc = vi.fn();
beforeEach(() => {
  rpc.mockReset();
  (getAdminClient as Mock).mockResolvedValue({ rpc });
});

describe('CreditService.consumeCredits', () => {
  it('calls the atomic RPC with the description and returns true on success', async () => {
    rpc.mockResolvedValue({ data: 4, error: null });
    const ok = await CreditService.consumeCredits('user-1', 1, 'AI feedback');
    expect(ok).toBe(true);
    expect(rpc).toHaveBeenCalledWith('consume_user_credits', {
      p_user_id: 'user-1',
      p_amount: 1,
      p_description: 'AI feedback',
    });
  });

  it('returns false when the RPC reports insufficient credits (data null)', async () => {
    rpc.mockResolvedValue({ data: null, error: null });
    expect(await CreditService.consumeCredits('user-1', 1)).toBe(false);
  });

  it('returns false on RPC error', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    expect(await CreditService.consumeCredits('user-1', 1)).toBe(false);
  });
});

describe('CreditService.addCredits', () => {
  it('forwards the description and returns true on success', async () => {
    rpc.mockResolvedValue({ data: 6, error: null });
    const ok = await CreditService.addCredits('user-1', 1, 'Refund: feedback generation failed');
    expect(ok).toBe(true);
    expect(rpc).toHaveBeenCalledWith('add_user_credits', {
      p_user_id: 'user-1',
      p_amount: 1,
      p_description: 'Refund: feedback generation failed',
    });
  });

  it('returns false when the user is missing (data null) so failed refunds are detectable', async () => {
    rpc.mockResolvedValue({ data: null, error: null });
    expect(await CreditService.addCredits('user-1', 1)).toBe(false);
  });

  it('returns false on RPC error', async () => {
    rpc.mockResolvedValue({ data: null, error: { message: 'boom' } });
    expect(await CreditService.addCredits('user-1', 1)).toBe(false);
  });
});
