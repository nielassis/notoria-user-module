import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(5555),
  SECRET: z.string(),
  FRONT_END_URL: z.string().url(),
});

if (envSchema.safeParse(process.env).success === false) {
  throw new Error("Variaveis de ambiente nao encontradas");
}

export const env = envSchema.parse(process.env);
