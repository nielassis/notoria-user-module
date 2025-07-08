import jwt from "jsonwebtoken";
import { Student } from "@prisma/client";
import { env } from "../config/env";

const SECRET = env.SECRET;

export function generateToken(student: Student) {
  const token = jwt.sign(
    {
      sub: student.id,
      email: student.email,
      name: student.name,
      role: "student",
    },
    SECRET,
    {
      expiresIn: "7d",
    }
  );

  return `Bearer ${token}`;
}
