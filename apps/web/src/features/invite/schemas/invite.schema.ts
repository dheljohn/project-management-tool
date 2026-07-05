import { z } from "zod";

export const createInviteSchema = z.object({
  maxUses: z.coerce.number().int().min(1).max(1000).default(10),
  expiresInDays: z.coerce.number().int().min(1).max(30).default(7),
});
export type CreateInviteInput = z.input<typeof createInviteSchema>;
export type CreateInviteOutput = z.output<typeof createInviteSchema>;

export const joinProjectSchema = z.object({
  code: z
    .string()
    .trim()
    .min(6, "Code must be at least 6 characters")
    .max(12, "Code is too long")
    .transform((val) => val.toUpperCase()),
});
export type JoinProjectInput = z.infer<typeof joinProjectSchema>;
