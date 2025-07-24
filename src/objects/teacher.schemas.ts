import { z } from "zod";

export const createTeacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string(),
  discipline: z.string(),
  educationalInstitution: z.string(),
  experience: z.string(),
});

export const updateTeacherSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  discipline: z.string().optional(),
  educationalInstitution: z.string().optional(),
  experience: z.string().optional(),
  oldPassword: z.string().min(6).optional(),
  newPassword: z.string().min(6).optional(),
});
