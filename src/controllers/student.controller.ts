import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "../services/authStudent.service";

export async function studentLogin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email, password } = request.body as {
    email: string;
    password: string;
  };

  try {
    const student = await prisma.student.findUnique({
      where: {
        email,
      },
    });

    if (!student) {
      return reply.status(401).send({ error: "Credenciais inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);

    if (!isPasswordValid) {
      return reply.status(401).send({ error: "Credenciais inválidas" });
    }

    const token = generateToken(student);

    return reply.status(200).send({
      token,
    });
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}
