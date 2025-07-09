import { FastifyReply, FastifyRequest } from "fastify";
import { createClassroomSchema } from "../objects/classroom.schema";
import prisma from "../lib/prisma";
import { ClassroomIdParams } from "../interfaces/classroom.interfaces";

export async function createClassroom(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.user;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  const parsedBody = createClassroomSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return reply.status(400).send({
      error: "Dados inválidos",
      details: parsedBody.error.flatten(),
    });
  }

  const { name } = parsedBody.data;
  const teacherId = id;

  try {
    const classroom = await prisma.classroom.create({
      data: {
        name,
        teacherId,
      },
    });

    return reply.status(201).send(classroom);
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function getAllClassrooms(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id } = request.user;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const classrooms = await prisma.classroom.findMany({
      where: {
        teacherId: id,
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            students: true,
          },
        },
      },
    });

    return reply.status(200).send(classrooms);
  } catch (error) {
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

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const classroom = await prisma.classroom.findUnique({
      where: {
        id: classroomId,
        teacherId: id,
      },
    });

    return reply.status(200).send(classroom);
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function updateClassroom(
  request: FastifyRequest<{
    Params: ClassroomIdParams;
  }>,
  reply: FastifyReply
) {
  const { classroomId } = request.params;
  const { id } = request.user;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  const parsedBody = createClassroomSchema.safeParse(request.body);

  if (!parsedBody.success) {
    return reply.status(400).send({
      error: "Dados inválidos",
      details: parsedBody.error.flatten(),
    });
  }

  const { name } = parsedBody.data;

  try {
    const classroom = await prisma.classroom.update({
      where: {
        id: classroomId,
        teacherId: id,
      },
      data: {
        name,
      },
    });

    return reply.status(200).send(classroom);
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function deleteClassroom(
  request: FastifyRequest<{
    Params: ClassroomIdParams;
  }>,
  reply: FastifyReply
) {
  const { classroomId } = request.params;
  const { id } = request.user;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const classroom = await prisma.classroom.delete({
      where: {
        id: classroomId,
        teacherId: id,
      },
    });

    return reply.status(200).send(classroom);
  } catch (error) {
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}
