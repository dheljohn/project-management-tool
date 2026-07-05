import { z } from "zod";

export const projectSchema = z.object({
  name: z.string().min(2, "Project name is required").max(50),
  description: z.string().optional(),
  wipLimit: z.preprocess(
    (val) => (val === "" || val === 0 || val === "0" ? undefined : val),
    z.coerce
      .number()
      .min(0, "WIP limit cannot be negative")
      .max(100, "WIP limit cannot be greater than 100")
      .optional(),
  ),
});

export type ProjectFormInput = z.input<typeof projectSchema>;
export type ProjectFormOutput = z.infer<typeof projectSchema>;
