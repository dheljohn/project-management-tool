import { z } from "zod";

export const PRIORITIES = ["Critical", "High", "Medium", "Low"] as const;

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string(),
  remark: z.string().optional(),
  priority: z.enum(PRIORITIES),
  assigneeIds: z.array(z.number()),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
