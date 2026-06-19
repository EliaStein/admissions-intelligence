import { describe, it, expect } from 'vitest';
import { adminUserUpdateSchema } from '@/lib/validators';

describe('adminUserUpdateSchema', () => {
  it('accepts a valid partial update', () => {
    const r = adminUserUpdateSchema.safeParse({ credits: 5, role: 'admin' });
    expect(r.success).toBe(true);
  });

  it('accepts an empty object (caller rejects separately)', () => {
    expect(adminUserUpdateSchema.safeParse({}).success).toBe(true);
  });

  it('rejects negative or fractional credits', () => {
    expect(adminUserUpdateSchema.safeParse({ credits: -1 }).success).toBe(false);
    expect(adminUserUpdateSchema.safeParse({ credits: 1.5 }).success).toBe(false);
  });

  it('rejects unknown roles', () => {
    expect(adminUserUpdateSchema.safeParse({ role: 'superuser' }).success).toBe(false);
  });

  it('rejects unknown fields (e.g. attempts to set id or email)', () => {
    expect(adminUserUpdateSchema.safeParse({ id: 'x' }).success).toBe(false);
    expect(adminUserUpdateSchema.safeParse({ email: 'a@b.com' }).success).toBe(false);
  });

  it('rejects wrong types', () => {
    expect(adminUserUpdateSchema.safeParse({ is_active: 'yes' }).success).toBe(false);
    expect(adminUserUpdateSchema.safeParse({ credits: '5' }).success).toBe(false);
  });
});
