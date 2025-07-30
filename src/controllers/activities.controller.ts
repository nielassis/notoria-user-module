import { FastifyReply, FastifyRequest } from "fastify";
import { ClassroomIdParams } from "../interfaces/classroom.interfaces";
import { z } from "zod";
import {
  createActivitySchema,
  updateActivitySchema,
} from "../objects/activity.schema";
import prisma from "../lib/prisma";
import { AcitivityIdParams } from "../interfaces/activity.interface";
import { StudentIdParams } from "../interfaces/student.interfaces";

// ações professor -> atividades
export async function createActivity(
  request: FastifyRequest<{
    Params: ClassroomIdParams;
    Body: z.infer<typeof createActivitySchema>;
  }>,
  reply: FastifyReply
) {
  const { id } = request.user;
  const { classroomId } = request.params;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  const parsed = createActivitySchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({
      error: "Dados inválidos",
      details: parsed.error.flatten(),
    });
  }

  const { title, description, type, dueDate, fileUrl } = parsed.data;

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

    const activity = await prisma.activity.create({
      data: {
        title,
        description,
        type,
        fileUrl,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        classroomId,
        teacherId: id,
      },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        dueDate: true,
        fileUrl: true,
      },
    });

    const students = await prisma.student.findMany({
      where: {
        classrooms: {
          some: {
            classroomId: classroomId,
          },
        },
      },
      select: { id: true },
    });

    if (students.length === 0) {
      console.warn(`Nenhum aluno encontrado para a turma ${classroomId}`);
    }

    await prisma.activitySubmission.createMany({
      data: students.map((student) => ({
        studentId: student.id,
        activityId: activity.id,
        status: "PENDING",
      })),
    });

    return reply.status(201).send({ success: true, activity });
  } catch (error) {
    console.error("Erro ao criar atividade:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function getActivitiesByClassroom(
  request: FastifyRequest<{ Params: ClassroomIdParams }>,
  reply: FastifyReply
) {
  const { classroomId } = request.params;
  const teacherId = request.user.id;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const classroom = await prisma.classroom.findFirst({
      where: {
        id: classroomId,
        teacherId,
      },
    });

    if (!classroom) {
      return reply.status(404).send({ error: "Turma não encontrada" });
    }

    const activities = await prisma.activity.findMany({
      where: { classroomId },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        dueDate: true,
      },
      orderBy: { dueDate: "asc" },
    });

    return reply.send({ success: true, activities });
  } catch (error) {
    console.error("Erro ao buscar atividades:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function updateActivity(
  request: FastifyRequest<{
    Params: { activityId: string };
    Body: z.infer<typeof updateActivitySchema>;
  }>,
  reply: FastifyReply
) {
  const teacherId = request.user.id;
  const { activityId } = request.params;
  const parsed = updateActivitySchema.safeParse(request.body);

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  if (!parsed.success) {
    return reply.status(400).send({
      error: "Dados inválidos",
      details: parsed.error.flatten(),
    });
  }

  try {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity || activity.teacherId !== teacherId) {
      return reply.status(404).send({ error: "Atividade não encontrada" });
    }

    const updated = await prisma.activity.update({
      where: { id: activityId },
      data: {
        ...parsed.data,
        dueDate: parsed.data.dueDate
          ? new Date(parsed.data.dueDate)
          : undefined,
      },
    });

    return reply.send({ success: true, activity: updated });
  } catch (error) {
    console.error("Erro ao atualizar atividade:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function deleteActivity(
  request: FastifyRequest<{ Params: AcitivityIdParams }>,
  reply: FastifyReply
) {
  const { activityId } = request.params;
  const teacherId = request.user.id;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
    });

    if (!activity || activity.teacherId !== teacherId) {
      return reply
        .status(404)
        .send({ error: "Atividade não encontrada ou acesso negado" });
    }

    await prisma.activity.delete({
      where: { id: activityId },
    });

    return reply.send({ success: true });
  } catch (error) {
    console.error("Erro ao deletar atividade:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

// ações do professor -> submissões

export async function gradeSubmission(
  request: FastifyRequest<{
    Params: { submissionId: string };
    Body: { grade: number };
  }>,
  reply: FastifyReply
) {
  const { submissionId } = request.params;
  const { grade } = request.body;
  const teacherId = request.user.id;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const submission = await prisma.activitySubmission.findUnique({
      where: { id: submissionId },
      include: {
        activity: true,
      },
    });

    if (!submission || submission.activity.teacherId !== teacherId) {
      return reply
        .status(403)
        .send({ error: "Acesso negado ou submissão não encontrada." });
    }

    const updated = await prisma.activitySubmission.update({
      where: { id: submissionId },
      data: { grade },
    });

    return reply.send(updated);
  } catch (error) {
    console.error("Erro ao lançar nota:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function listAllSubmissionsByTeacher(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const teacherId = request.user.id;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const activities = await prisma.activity.findMany({
      where: { teacherId },
      select: { id: true },
    });

    const activityIds = activities.map((a) => a.id);

    if (activityIds.length === 0) {
      return reply.send({ graded: [], pending: [] });
    }

    const submissions = await prisma.activitySubmission.findMany({
      where: {
        activityId: {
          in: activityIds,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        activity: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    const completed = submissions.filter((s) => s.status === "COMPLETED");
    const pending = submissions.filter((s) => s.status === "PENDING");

    return reply.send({ completed, pending });
  } catch (error) {
    console.error("Erro ao buscar todas as submissões do professor:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function listSubmissionsByActivity(
  request: FastifyRequest<{ Params: AcitivityIdParams }>,
  reply: FastifyReply
) {
  const { activityId } = request.params;
  const teacherId = request.user.id;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const activity = await prisma.activity.findFirst({
      where: {
        id: activityId,
        teacherId,
      },
    });

    if (!activity) {
      return reply
        .status(404)
        .send({ error: "Atividade não encontrada ou acesso negado." });
    }

    const submissions = await prisma.activitySubmission.findMany({
      where: { activityId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    const graded = submissions.filter((s) => s.grade !== null);
    const pending = submissions.filter((s) => s.grade === null);

    return reply.send({ graded, pending });
  } catch (error) {
    console.error("Erro ao buscar submissões:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function getSubmissionById(
  request: FastifyRequest<{ Params: { submissionId: string } }>,
  reply: FastifyReply
) {
  const { submissionId } = request.params;
  const { id } = request.user;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const submission = await prisma.activitySubmission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        submittedAt: true,
        fileUrl: true,
        content: true,
        grade: true,
        status: true,
        student: {
          select: {
            id: true,
            name: true,
          },
        },
        activity: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!submission) {
      return reply.status(404).send({ error: "Submissão não encontrada" });
    }

    return reply.send(submission);
  } catch (error) {
    console.error("Erro ao buscar submissão:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function getStudentsSubmissionInClassroom(
  request: FastifyRequest<{ Params: StudentIdParams & ClassroomIdParams }>,
  reply: FastifyReply
) {
  const { classroomId, studentId } = request.params;
  const teacherId = request.user.id;

  if (request.user.role !== "teacher") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const activity = await prisma.activitySubmission.findMany({
      where: {
        activity: {
          classroomId,
          teacherId,
        },
        studentId,
      },
    });

    if (!activity) {
      return reply.status(404).send({ error: "Submissão nao encontrada" });
    }

    return reply.send(activity);
  } catch (error) {
    console.error("Erro ao buscar submissão:", error);
    return reply.status(500).send({
      error: {
        message: "Erro interno do servidor",
      },
    });
  }
}

// ações do aluno -> atividades

export async function getStudentActivitiesByClassroom(
  request: FastifyRequest<{ Params: ClassroomIdParams }>,
  reply: FastifyReply
) {
  const studentId = request.user.id;
  const { classroomId } = request.params;

  if (request.user.role !== "student") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const activities = await prisma.activity.findMany({
      where: { classroomId },
      include: {
        submissions: {
          where: { studentId },
          select: { status: true, grade: true, submittedAt: true },
        },
      },
    });

    const result = activities.map((activity) => ({
      ...activity,
      submission: activity.submissions[0] ?? null,
    }));

    return reply.send(result);
  } catch (error) {
    console.error("Erro ao buscar atividades:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function getAllStudentActivities(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const studentId = request.user.id;

  if (request.user.role !== "student") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const submissions = await prisma.activitySubmission.findMany({
      where: { studentId },
      include: {
        activity: true,
      },
    });

    return reply.send(submissions);
  } catch (error) {
    console.error("Erro ao buscar atividades do aluno:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function deleteStudentActivity(
  request: FastifyRequest<{ Params: AcitivityIdParams }>,
  reply: FastifyReply
) {
  const studentId = request.user.id;
  const { activityId } = request.params;

  if (request.user.role !== "student") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    await prisma.activitySubmission.deleteMany({
      where: { studentId, activityId },
    });

    return reply.send({ success: true });
  } catch (error) {
    console.error("Erro ao deletar submissão:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

enum SubmissionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
}

export async function submitActivity(
  request: FastifyRequest<{
    Params: { activityId: string };
    Body: {
      fileUrl?: string;
      content?: string;
      status?: SubmissionStatus;
    };
  }>,
  reply: FastifyReply
) {
  const studentId = request.user.id;
  const { activityId } = request.params;
  const { fileUrl, content, status } = request.body;

  if (!fileUrl && !content) {
    return reply
      .status(400)
      .send({ error: "É necessário enviar um arquivo ou conteúdo." });
  }

  try {
    const updateData: any = {
      fileUrl,
      content,
    };

    updateData.status = "COMPLETED";
    updateData.submittedAt = new Date();

    const submission = await prisma.activitySubmission.updateMany({
      where: {
        studentId,
        activityId,
      },
      data: updateData,
    });

    if (submission.count === 0) {
      return reply.status(404).send({
        error: "Submissão não encontrada para esse aluno e atividade.",
      });
    }

    return reply.send({ success: true });
  } catch (error) {
    console.error("Erro ao enviar atividade:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}

export async function getAllClassroomStudentAcivities(
  request: FastifyRequest<{ Params: ClassroomIdParams }>,
  reply: FastifyReply
) {
  const { classroomId } = request.params;

  const user = request.user;
  if (!user || user.role !== "student") {
    return reply.status(403).send({ error: "Acesso negado" });
  }

  try {
    const activities = await prisma.activitySubmission.findMany({
      where: {
        studentId: user.id,
        activity: {
          classroomId,
        },
      },
      select: {
        id: true,
        studentId: true,
        activityId: true,
        submittedAt: true,
        fileUrl: true,
        content: true,
        grade: true,
        status: true,

        activity: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            type: true,
          },
        },
      },
    });

    return reply.send(activities);
  } catch (error) {
    console.error("Erro ao buscar atividades do aluno:", error);
    return reply.status(500).send({ error: "Erro interno do servidor" });
  }
}
