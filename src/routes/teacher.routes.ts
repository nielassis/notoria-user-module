import { FastifyInstance } from "fastify";
import { createTeacher, teacherLogin } from "../controllers/teacher.controller";

export async function teacherRoutes(server: FastifyInstance) {
  server.post("/create", createTeacher);

  server.post("/login", teacherLogin);
}

export default teacherRoutes;
