import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "../services/authStudent.service";
import { updateStudentSchema } from "../objects/student.schema";
import { ClassesIdParams } from "../interfaces/classes.interfaces";
import { ClassroomIdParams } from "../interfaces/classroom.interfaces";

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

export async function changeStudentPassword(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.user;

  if (request.user.role !== "student") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  const parsedBody = updateStudentSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return reply.status(400).send({
      error: "Dados inválidos",
      details: parsedBody.error.flatten(),
    });
  }

  const { newPassword } = parsedBody.data;

  try {
    const dataToUpdate = {
      ...(newPassword && { password: await bcrypt.hash(newPassword, 10) }),
    };

    const updatedStudent = await prisma.student.update({
      where: { id: id },
      data: dataToUpdate,
      select: {
        name: true,
        email: true,
        createdAt: true,
      },
    });
    return reply
      .status(200)
      .send({ updatedStudent, newPassword, success: true });
  } catch (error) {
    console.error("Erro ao atualizar senha do aluno:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function getAllStudentClassroom(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.user;

  if (request.user.role !== "student") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  const student = await prisma.student.findUnique({
    where: { id },
  });

  if (!student) {
    return reply.status(404).send({ error: "Aluno nao encontrado" });
  }

  try {
    const studentClassrooms = await prisma.studentClassroom.findMany({
      where: {
        studentId: id,
      },
      include: {
        classroom: true,
      },
    });

    return reply.status(200).send(studentClassrooms);
  } catch (error) {
    console.error("Erro ao buscar turmas do aluno:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function getAllStudentsInClassroom(
  request: FastifyRequest<{
    Params: ClassroomIdParams;
  }>,
  reply: FastifyReply
) {
  const { id: studentId, role } = request.user;
  const { classroomId } = request.params;

  if (role !== "student") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const isEnrolled = await prisma.studentClassroom.findFirst({
      where: {
        studentId,
        classroomId,
      },
    });

    if (!isEnrolled) {
      return reply
        .status(403)
        .send({ error: "Você não está matriculado nesta turma" });
    }

    const classmates = await prisma.studentClassroom.findMany({
      where: {
        classroomId,
        studentId: {
          not: studentId,
        },
      },
      select: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const result = classmates.map((entry) => entry.student);

    return reply.status(200).send(result);
  } catch (error) {
    console.error("Erro ao buscar colegas de turma:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function getClassroomById(
  request: FastifyRequest<{
    Params: ClassroomIdParams;
  }>,
  reply: FastifyReply
) {
  const { classroomId } = request.params;
  const { id } = request.user;

  if (request.user.role !== "student") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const student = await prisma.studentClassroom.findFirst({
      where: {
        studentId: id,
      },
    });

    if (!student) {
      return reply
        .status(404)
        .send({ error: "Aluno nao matriculado nessa turma" });
    }

    const classroom = await prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    return reply.status(200).send(classroom);
  } catch (error) {
    console.error("Erro ao buscar turma:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}
