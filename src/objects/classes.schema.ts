import { z } from "zod";

export const updateClassesSchema = z.object({
  score: z.number().optional(),
});
