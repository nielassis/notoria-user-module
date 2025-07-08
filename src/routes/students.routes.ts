import { FastifyInstance } from "fastify";
import { studentLogin } from "../controllers/student.controller";

export async function studentRoutes(server: FastifyInstance) {
  server.post("/login", studentLogin);
}

export default studentRoutes;
