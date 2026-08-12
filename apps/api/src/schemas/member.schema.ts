import z from 'zod';

export const MemberSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  username: z.string().optional().nullable(),
  email: z.string().email(),
});

// export const PublicMemberSchema = MemberSchema.omit({ password: true });
export const PublicMemberSchema = MemberSchema;

export type Member = z.infer<typeof MemberSchema>;
// export type PublicMember = z.infer<typeof PublicMemberSchema>;
