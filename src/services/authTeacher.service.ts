import jwt from "jsonwebtoken";
import { Teacher } from "@prisma/client";
import { env } from "../config/env";

const SECRET = env.SECRET;

export function generateToken(teacher: Teacher) {
  const token = jwt.sign(
    { sub: teacher.id, email: teacher.email, name: teacher.name },
    SECRET,
    {
      expiresIn: "7d",
    }
  );

  return token;
}
