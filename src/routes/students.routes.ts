import { FastifyInstance } from "fastify";
import { studentLogin } from "../controllers/student.controller";

export default async function studentRoutes(server: FastifyInstance) {
  server.post("/login", studentLogin);
}
