import { FastifyReply, FastifyRequest } from "fastify";
import {
  createTeacherSchema,
  updateTeacherSchema,
} from "../objects/teacher.schemas";
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

export async function teacherProfile(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const { id } = request.user;

    const teacher = await prisma.teacher.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!teacher) {
      return reply.status(404).send({ error: "Usuário não encontrado" });
    }

    return reply.status(200).send(teacher);
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function teacherUpdate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.user;

  const parsedBody = updateTeacherSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return reply.status(400).send({
      error: "Dados inválidos",
      details: parsedBody.error.flatten(),
    });
  }

  const { name, email, oldPassword, newPassword } = parsedBody.data;

  if (!name && !email && !newPassword) {
    return reply
      .status(400)
      .send({ error: "Nenhum dado fornecido para atualização" });
  }

  try {
    const teacher = await prisma.teacher.findUnique({ where: { id } });

    if (!teacher) {
      return reply.status(404).send({ error: "Usuário não encontrado" });
    }

    const updateData: { name?: string; email?: string; password?: string } = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    if (newPassword) {
      if (!oldPassword) {
        return reply.status(400).send({
          error: "A senha atual é obrigatória para atualizar a senha",
        });
      }

      const isPasswordCorrect = await bcrypt.compare(
        oldPassword,
        teacher.password
      );

      if (!isPasswordCorrect) {
        return reply.status(401).send({ error: "Senha atual incorreta" });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedNewPassword;
    }

    const updatedTeacher = await prisma.teacher.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return reply.status(200).send(updatedTeacher);
  } catch (error) {
    console.error("Erro ao atualizar professor:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}
