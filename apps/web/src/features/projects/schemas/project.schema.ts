import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(2, "Project name is required").max(50),
  description: z.string().optional(),
  // description: z.string().min(1),
});

export type ProjectFormValues = z.input<typeof projectSchema>;
