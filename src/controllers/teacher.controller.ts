import { FastifyReply, FastifyRequest } from "fastify";
import { createTeacherSchema } from "../objects/teacher.schemas";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { generateToken } from "../services/authTeacher.service";

export async function createTeacher(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const body = createTeacherSchema.safeParse(request.body);

  if (!body.success) {
    return reply
      .status(400)
      .send({ error: "Dados inválidos", details: body.error.flatten() });
  }

  const { name, email, password } = body.data;

  try {
    const existingEmail = await prisma.teacher.findUnique({
      where: {
        email,
      },
    });

    if (existingEmail) {
      return reply.status(409).send({ error: "Email já está em uso" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const teacher = await prisma.teacher.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    return reply.status(201).send(teacher);
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function teacherLogin(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email, password } = request.body as {
    email: string;
    password: string;
  };

  try {
    const teacher = await prisma.teacher.findUnique({
      where: {
        email,
      },
    });

    if (!teacher) {
      return reply.status(401).send({ error: "Credenciais inválidas" });
    }

    const isPasswordValid = await bcrypt.compare(password, teacher.password);

    if (!isPasswordValid) {
      return reply.status(401).send({ error: "Credenciais inválidas" });
    }

    const token = generateToken(teacher);

    return reply.status(200).send({
      token,
    });
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}
