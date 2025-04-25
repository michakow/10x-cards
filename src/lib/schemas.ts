import { z } from "zod";

export const createGenerationSchema = z.object({
  sourceText: z
    .string()
    .min(1000, "Text must be at least 1000 characters")
    .max(10000, "Text cannot exceed 10000 characters"),
});

export type CreateGenerationSchema = typeof createGenerationSchema;
