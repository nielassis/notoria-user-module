import { z } from "zod";

export const createActivitySchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  type: z.enum(["EXERCISE", "COMPLEMENTARY_MATERIAL", "ASSIGNMENT"]),
  fileUrl: z.string().url().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateActivitySchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  dueDate: z.string().datetime().optional().nullable(),
  type: z.enum(["ASSIGNMENT", "EXERCISE", "COMPLEMENTARY_MATERIAL"]).optional(),
});
