import { FastifyInstance } from "fastify";
import {
  createStudent,
  createTeacher,
  deleteStudent,
  getAllStudents,
  teacherLogin,
  teacherProfile,
  teacherUpdate,
  updateStudent,
} from "../controllers/teacher.controller";
import { verifyJWT } from "../middlewares/verifyJWT";

export async function teacherRoutes(server: FastifyInstance) {
  server.post("/create", createTeacher);

  server.post("/login", teacherLogin);

  /* A partir daqui, todas as rotas ter o o hook de verificao de JWT aplicado, 
  garantindo que apenas usuarios autenticados possam acessar as rotas protegidas.
  */
  server.register(async (privateRoutes) => {
    privateRoutes.addHook("onRequest", verifyJWT);

    privateRoutes.get("/profile", teacherProfile);

    privateRoutes.put("/profile", teacherUpdate);

    // ações do professor -> estudantes (C.R.U.D)

    privateRoutes.post("/student", createStudent);

    privateRoutes.get("/student", getAllStudents);

    privateRoutes.put("/student/:studentId", updateStudent);

    privateRoutes.delete("/student/:studentId", deleteStudent);
  });
}

export default teacherRoutes;
