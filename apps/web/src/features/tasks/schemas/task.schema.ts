import { z } from "zod";

export const PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string(),
  remark: z.string(),
  priority: z.enum(PRIORITIES),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
