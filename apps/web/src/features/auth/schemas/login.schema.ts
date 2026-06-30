import { z } from "zod";

export const loginSchema = z.object({
  user_id: z.string().min(1, "User ID is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
