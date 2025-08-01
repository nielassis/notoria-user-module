import { FastifyInstance } from "fastify";
import {
  changeStudentPassword,
  getAllStudentClassroom,
  getAllStudentsInClassroom,
  getClassroomById,
  studentLogin,
} from "../controllers/student.controller";
import { verifyJWT } from "../middlewares/verifyJWT";

export default async function studentRoutes(server: FastifyInstance) {
  server.post("/login", studentLogin);

  server.register(async (privateRoutes) => {
    privateRoutes.addHook("onRequest", verifyJWT);

    privateRoutes.put("/change-password", changeStudentPassword);

    privateRoutes.get("/classrooms", getAllStudentClassroom);

    privateRoutes.get("/mates/:classroomId", getAllStudentsInClassroom);

    privateRoutes.get("/classrooms/:classroomId", getClassroomById);
  });
}
