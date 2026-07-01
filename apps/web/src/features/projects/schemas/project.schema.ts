import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().default(""),
  // description: z.string().min(1),
});

export type ProjectFormValues = z.input<typeof projectSchema>;
