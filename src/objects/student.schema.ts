import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
});

export const updateStudentSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  newPassword: z.string().min(6).optional(),
});
