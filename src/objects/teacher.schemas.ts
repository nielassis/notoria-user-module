import { z } from "zod";
import { email } from "zod/v4";

export const createTeacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const updateTeacherSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  oldPassword: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional(),
});
