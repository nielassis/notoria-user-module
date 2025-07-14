import { FastifyInstance } from "fastify";
import {
  changeStudentPassword,
  getAllStudentClassroom,
  getAllStudentsInClassroom,
  studentLogin,
} from "../controllers/student.controller";
import { verifyJWT } from "../middlewares/verifyJWT";

export default async function studentRoutes(server: FastifyInstance) {
  server.post("/login", studentLogin);

  server.register(async (privateRoutes) => {
    server.addHook("onRequest", verifyJWT);

    server.put("/change-password", changeStudentPassword);

    server.get("/classrooms", getAllStudentClassroom);

    server.get("/classrooms/:classroomId", getAllStudentsInClassroom);
  });
}
