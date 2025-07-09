import { FastifyReply, FastifyRequest } from "fastify";
import {
  createTeacherSchema,
  updateTeacherSchema,
} from "../objects/teacher.schemas";
import bcrypt from "bcryptjs";
import prisma from "../lib/prisma";
import { generateToken } from "../services/authTeacher.service";
import {
  createStudentSchema,
  updateStudentSchema,
} from "../objects/student.schema";
import { generatePassword } from "../lib/generateStudentPassword";
import { StudentIdParams } from "../interfaces/student.interfaces";

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

// ações do professor -> estudantes

export async function createStudent(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.user;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  const parsedBody = createStudentSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return reply.status(400).send({
      error: "Dados inválidos",
      details: parsedBody.error.flatten(),
    });
  }

  const { name, email } = parsedBody.data;
  const teacherId = id;

  try {
    const existingStudent = await prisma.student.findUnique({
      where: { email, teacherId },
    });

    if (existingStudent) {
      return reply.status(409).send({ error: "Email ja cadastrado" });
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const student = await prisma.student.create({
      data: {
        password: hashedPassword,
        name,
        email,
        teacherId,
      },
    });

    return reply
      .status(201)
      .send({ student, temporaryPassword: plainPassword });
  } catch (error) {
    return reply
      .status(500)
      .send({ error: "Erro interno do servidor ao criar aluno" });
  }
}

export async function getAllStudents(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.user;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const students = await prisma.student.findMany({
      where: { teacherId: id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    return reply.status(200).send(students);
  } catch (error) {
    return reply
      .status(500)
      .send({ error: "Erro interno do servidor ao buscar alunos" });
  }
}

export async function updateStudent(
  request: FastifyRequest<{
    Params: StudentIdParams;
  }>,
  reply: FastifyReply
) {
  const { id } = request.user;
  const { studentId } = request.params;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  const parsedBody = updateStudentSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return reply.status(400).send({
      error: "Dados inválidos",
      details: parsedBody.error.flatten(),
    });
  }

  const { name, email, newPassword } = parsedBody.data;

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId, teacherId: id },
    });

    if (!student) {
      return reply.status(404).send({ error: "Aluno nao encontrado" });
    }

    const dataToUpdate = {
      ...(name && { name }),
      ...(email && { email }),
      ...(newPassword && { password: await bcrypt.hash(newPassword, 10) }),
    };

    const updatedStudent = await prisma.student.update({
      where: { id: studentId, teacherId: id },
      data: dataToUpdate,
      select: {
        name: true,
        email: true,
        createdAt: true,
      },
    });
    return reply.status(200).send({ updatedStudent, success: true });
  } catch (error) {
    console.error("Erro ao atualizar aluno:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function deleteStudent(
  request: FastifyRequest<{
    Params: StudentIdParams;
  }>,
  reply: FastifyReply
) {
  const { id } = request.user;
  const { studentId } = request.params;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return reply.status(404).send({ error: "Aluno nao encontrado" });
    }

    await prisma.student.delete({
      where: { id: studentId, teacherId: id },
    });

    return reply.status(200).send({
      success: true,
      message: "Aluno deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar aluno:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}
