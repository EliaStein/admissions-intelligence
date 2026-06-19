import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('@/lib/supabase-admin-client', () => ({ getAdminClient: vi.fn() }));
vi.mock('@/services/creditService', () => ({
  CreditService: { addCredits: vi.fn() },
}));

import { ReferralService } from '@/services/referralService';
import { getAdminClient } from '@/lib/supabase-admin-client';
import { CreditService } from '@/services/creditService';

// A chainable + thenable query stub. `.single()` pops the next queued row;
// terminal awaits (e.g. update().eq()) resolve to { error: null }.
function makeAdmin(singleQueue: Array<{ data: unknown; error: unknown }>) {
  const q: Record<string, unknown> = {};
  for (const m of ['select', 'eq', 'update', 'insert', 'delete', 'order']) {
    q[m] = () => q;
  }
  q.single = () => Promise.resolve(singleQueue.shift() ?? { data: null, error: null });
  q.then = (resolve: (v: unknown) => unknown) => Promise.resolve({ data: null, error: null }).then(resolve);
  return { from: () => q };
}

const calls: string[] = [];

beforeEach(() => {
  calls.length = 0;
  vi.restoreAllMocks();
  (CreditService.addCredits as Mock).mockReset();

  vi.spyOn(ReferralService, 'getCampaignParticipantRewardsPending').mockResolvedValue([
    { user: { email: 'referrer@example.com' } as never, rewards: [{ id: 'reward-1' } as never] },
  ]);
  vi.spyOn(ReferralService, 'postCampaignParticipantRewardsRedeem').mockImplementation(async () => {
    calls.push('redeem');
  });
  (CreditService.addCredits as Mock).mockImplementation(async () => {
    calls.push('addCredits');
    return true;
  });
});

describe('ReferralService.rewardReferrer', () => {
  it('grants the credit before redeeming the external reward (happy path)', async () => {
    (getAdminClient as Mock).mockResolvedValue(
      makeAdmin([
        { data: { referral_code_used: 'CODE1' }, error: null }, // findRefereeByCode
        { data: { id: 'referrer-1' }, error: null }, // referrer lookup
      ])
    );

    const result = await ReferralService.rewardReferrer('referee-1');

    expect(result).toBe(true);
    expect(CreditService.addCredits).toHaveBeenCalledWith('referrer-1', 1, 'Referral reward');
    // Grant must happen before the external redeem so a DB failure can't burn it.
    expect(calls).toEqual(['addCredits', 'redeem']);
  });

  it('does not redeem or grant when the referrer row is missing', async () => {
    (getAdminClient as Mock).mockResolvedValue(
      makeAdmin([
        { data: { referral_code_used: 'CODE1' }, error: null }, // referee
        { data: null, error: null }, // referrer not found
      ])
    );

    const result = await ReferralService.rewardReferrer('referee-1');

    expect(result).toBe(false);
    expect(CreditService.addCredits).not.toHaveBeenCalled();
    expect(calls).not.toContain('redeem');
  });

  it('does not redeem the external reward when the credit grant fails', async () => {
    (getAdminClient as Mock).mockResolvedValue(
      makeAdmin([
        { data: { referral_code_used: 'CODE1' }, error: null },
        { data: { id: 'referrer-1' }, error: null },
      ])
    );
    (CreditService.addCredits as Mock).mockResolvedValue(false);

    const result = await ReferralService.rewardReferrer('referee-1');

    expect(result).toBe(false);
    expect(calls).not.toContain('redeem');
  });
});
