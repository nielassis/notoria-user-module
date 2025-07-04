import { z } from "zod";
import { email } from "zod/v4";

export const createTeacherSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});
