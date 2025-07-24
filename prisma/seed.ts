import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const teacher = await prisma.teacher.create({
    data: {
      name: "Daniel Assis",
      email: "daniel@prof.edu.br",
      password: "18082006Dd!",
      phone: "+5511999999999",
      discipline: "Programação",
      educationalInstitution: "Escola Estadual Central",
      experience: "10 anos lecionando em escolas públicas",
    },
  });

  const classroomA = await prisma.classroom.create({
    data: {
      name: "Introdução à JavaScript para Back-End",
      teacherId: teacher.id,
    },
  });

  const classroomB = await prisma.classroom.create({
    data: {
      name: "Introdução à Front-End",
      teacherId: teacher.id,
    },
  });

  const student1 = await prisma.student.create({
    data: {
      name: "Ana Souza",
      email: "ana.souza@example.com",
      password: "senha123",
      teacherId: teacher.id,
    },
  });

  const student2 = await prisma.student.create({
    data: {
      name: "Carlos Lima",
      email: "carlos.lima@example.com",
      password: "senha456",
      teacherId: teacher.id,
    },
  });

  const student3 = await prisma.student.create({
    data: {
      name: "Beatriz Rocha",
      email: "beatriz.rocha@example.com",
      password: "senha789",
      teacherId: teacher.id,
    },
  });

  await prisma.studentClassroom.createMany({
    data: [
      {
        studentId: student1.id,
        classroomId: classroomA.id,
        score: 8.5,
      },
      {
        studentId: student2.id,
        classroomId: classroomA.id,
        score: 7.2,
      },
      {
        studentId: student3.id,
        classroomId: classroomA.id,
        score: 9.0,
      },
      {
        studentId: student2.id,
        classroomId: classroomB.id,
        score: 8.5,
      },
      {
        studentId: student1.id,
        classroomId: classroomB.id,
        score: 7.2,
      },
      {
        studentId: student3.id,
        classroomId: classroomB.id,
        score: 9.0,
      },
    ],
  });

  console.log("🌱 Seed concluído com sucesso!");
}

main()
  .catch((e) => {
    console.error("❌ Erro ao rodar o seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
