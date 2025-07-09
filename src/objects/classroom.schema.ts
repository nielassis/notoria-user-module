import { z } from "zod";

export const createClassroomSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});

export const updateClassroomSchema = z.object({
  name: z.string().min(3).optional(),
});
