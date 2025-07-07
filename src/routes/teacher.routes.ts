import { FastifyInstance } from "fastify";
import {
  createTeacher,
  teacherLogin,
  teacherProfile,
  teacherUpdate,
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
  });
}

export default teacherRoutes;
