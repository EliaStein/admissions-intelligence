import { z } from 'zod';

/**
 * Validates the body of the admin "update user" endpoint. Every field is
 * optional (partial update), but when present it must be well-formed:
 * - credits: non-negative integer (no negative balances, no floats)
 * - role: a known role, not arbitrary text
 * The route rejects the request when no valid field is supplied.
 */
export const adminUserUpdateSchema = z
  .object({
    first_name: z.string().trim().min(1).max(100),
    last_name: z.string().trim().min(1).max(100),
    role: z.enum(['student', 'admin']),
    credits: z.number().int().min(0),
    is_active: z.boolean(),
  })
  .partial()
  .strict();

export type AdminUserUpdate = z.infer<typeof adminUserUpdateSchema>;
