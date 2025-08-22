import { FastifyInstance } from "fastify";
import {
  createClassroom,
  deleteClassroom,
  getAllClassrooms,
  getClassroomById,
  updateClassroom,
} from "../controllers/classroom.controller";
import { verifyJWT } from "../middlewares/verifyJWT";
import {
  getStudentByIdInClassroom,
  getStudentsInClassroom,
  insertStudentInClassroom,
  removeStudentFromClassroom,
} from "../controllers/classes.controller";

export default async function classroomRoutes(server: FastifyInstance) {
  server.register(async (privateRoutes) => {
    privateRoutes.addHook("onRequest", verifyJWT);

    privateRoutes.post("/", createClassroom);

    privateRoutes.get("/", getAllClassrooms);

    privateRoutes.get("/:classroomId", getClassroomById);

    privateRoutes.put("/:classroomId", updateClassroom);

    privateRoutes.delete("/:classroomId", deleteClassroom);

    // ações professor e ambiente sala de aula -> estudantes

    privateRoutes.post(
      "/classes/:classroomId/:studentId",
      insertStudentInClassroom
    );

    privateRoutes.delete(
      "/classes/:classroomId/:studentId",
      removeStudentFromClassroom
    );

    privateRoutes.get("/classes/:classroomId", getStudentsInClassroom);

    privateRoutes.get(
      "/classes/:classroomId/:studentId",
      getStudentByIdInClassroom
    );
  });
}
