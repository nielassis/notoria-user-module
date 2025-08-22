import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../lib/prisma";
import { Role } from "@prisma/client";

export async function sendMessage(
  request: FastifyRequest<{
    Body: { studentId: string; content: string };
  }>,
  reply: FastifyReply
) {
  const { id: userId, role: rawRole } = request.user;
  const { studentId, content } = request.body;

  const role =
    rawRole.toUpperCase() === "TEACHER" ? Role.TEACHER : Role.STUDENT;

  try {
    let conversation;

    if (role === Role.TEACHER) {
      conversation = await prisma.conversation.findFirst({
        where: { studentId, teacherId: userId },
      });
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { studentId, teacherId: userId },
        });
      }
    } else if (role === Role.STUDENT) {
      const student = await prisma.student.findUnique({
        where: { id: userId },
      });
      if (!student)
        return reply.status(404).send({ error: "Aluno não encontrado" });

      conversation = await prisma.conversation.findFirst({
        where: { studentId: userId, teacherId: student.teacherId },
      });
      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { studentId: userId, teacherId: student.teacherId },
        });
      }
    } else {
      return reply.status(403).send({ error: "Acesso negado" });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        senderRole: role,
        conversationId: conversation.id,
      },
    });

    return reply.status(201).send(message);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro ao enviar mensagem" });
  }
}

export async function listConversations(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { id: userId, role: rawRole } = request.user;
  const role =
    rawRole.toUpperCase() === "TEACHER" ? Role.TEACHER : Role.STUDENT;

  try {
    let conversations;

    if (role === Role.TEACHER) {
      conversations = await prisma.conversation.findMany({
        where: { teacherId: userId },
        include: {
          student: { select: { id: true, name: true, email: true } },
          messages: true,
        },
      });
    } else {
      conversations = await prisma.conversation.findMany({
        where: { studentId: userId },
        include: {
          teacher: { select: { id: true, name: true, email: true } },
          messages: true,
        },
      });
    }

    return reply.status(200).send(conversations);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro ao listar conversas" });
  }
}

export async function listMessages(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id: userId, role: rawRole } = request.user;
  const role =
    rawRole.toUpperCase() === "TEACHER" ? Role.TEACHER : Role.STUDENT;
  const { id: conversationId } = request.params;

  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { messages: true },
    });

    if (!conversation)
      return reply.status(404).send({ error: "Conversa não encontrada" });

    if (
      (role === Role.TEACHER && conversation.teacherId !== userId) ||
      (role === Role.STUDENT && conversation.studentId !== userId)
    ) {
      return reply.status(403).send({ error: "Acesso negado" });
    }

    return reply.status(200).send(conversation.messages);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: "Erro ao listar mensagens" });
  }
}
