import { FastifyReply, FastifyRequest } from "fastify";
import { ClassesIdParams } from "../interfaces/classes.interfaces";
import prisma from "../lib/prisma";

export async function insertStudentInClassroom(
  request: FastifyRequest<{
    Params: ClassesIdParams;
  }>,
  reply: FastifyReply
) {
  const id = request.user.id;
  const { classroomId, studentId } = request.params;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: id,
      },
    });

    if (!classroom) {
      return reply.status(404).send({ error: "Turma não encontrada" });
    }

    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        teacherId: id,
      },
    });

    if (!student) {
      return reply.status(404).send({ error: "Aluno não encontrado" });
    }

    const alreadyInserted = await prisma.studentClassroom.findFirst({
      where: {
        studentId,
        classroomId,
      },
    });

    if (alreadyInserted) {
      return reply
        .status(409)
        .send({ error: "Aluno já está inserido nesta turma" });
    }

    if (!studentId || !classroomId) {
      return reply.status(400).send({ error: "Parâmetros inválidos" });
    }

    await prisma.studentClassroom.create({
      data: {
        studentId,
        classroomId,
      },
    });

    const activities = await prisma.activity.findMany({
      where: { classroomId },
      select: { id: true },
    });

    if (activities.length > 0) {
      await prisma.activitySubmission.createMany({
        data: activities.map((activity) => ({
          studentId,
          activityId: activity.id,
          status: "PENDING",
        })),
        skipDuplicates: true,
      });
    }

    return reply
      .status(200)
      .send({ success: true, message: "Aluno inserido com sucesso" });
  } catch (error) {
    console.error("Erro ao inserir aluno na turma:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function removeStudentFromClassroom(
  request: FastifyRequest<{
    Params: ClassesIdParams;
  }>,
  reply: FastifyReply
) {
  const { id } = request.user;
  const { classroomId, studentId } = request.params;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: id,
      },
    });

    if (!classroom) {
      return reply.status(404).send({ error: "Turma nao encontrada" });
    }

    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        teacherId: id,
      },
    });

    if (!student) {
      return reply.status(404).send({ error: "Aluno nao encontrado" });
    }

    const studentClassroom = await prisma.studentClassroom.findFirst({
      where: {
        studentId,
        classroomId,
      },
    });

    if (!studentClassroom) {
      return reply
        .status(404)
        .send({ error: "Aluno nao encontrado nesta turma" });
    }

    await prisma.studentClassroom.delete({
      where: {
        id: studentClassroom.id,
      },
    });

    return reply.status(200).send({
      success: true,
      message: "Aluno removido com sucesso",
    });
  } catch (error) {
    console.error("Erro ao remover aluno da turma:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function getStudentsInClassroom(
  request: FastifyRequest<{
    Params: ClassesIdParams;
  }>,
  reply: FastifyReply
) {
  const { id } = request.user;
  const { classroomId } = request.params;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: id,
      },
    });

    if (!classroom) {
      return reply.status(404).send({ error: "Turma nao encontrada" });
    }

    const classes = await prisma.studentClassroom.findMany({
      where: {
        classroomId,
      },
      select: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return reply.status(200).send(classes);
  } catch (error) {
    console.error("Erro ao buscar alunos na turma:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function getStudentByIdInClassroom(
  request: FastifyRequest<{
    Params: ClassesIdParams;
  }>,
  reply: FastifyReply
) {
  const id = request.user.id;
  const { classroomId, studentId } = request.params;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId: id,
      },
    });

    if (!classroom) {
      return reply.status(404).send({ error: "Turma não encontrada" });
    }

    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        teacherId: id,
      },
    });

    if (!student) {
      return reply.status(404).send({ error: "Aluno não encontrado" });
    }

    if (!studentId || !classroomId) {
      return reply.status(400).send({ error: "Parâmetros inválidos" });
    }

    const studentClassroom = await prisma.studentClassroom.findFirst({
      where: {
        studentId,
        classroomId,
      },
    });

    return reply.status(200).send(studentClassroom);
  } catch (error) {
    console.error("Erro ao inserir aluno na turma:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}
