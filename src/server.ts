import fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./config/env";
import teacherRoutes from "./routes/teacher.routes";
import studentRoutes from "./routes/students.routes";
import classroomRoutes from "./routes/classrooms.routes";
import activitiesRoutes from "./routes/activites.routes";

const app = fastify();

app.register(cors, {
  origin: env.FRONT_END_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
});

app.get("/health", async () => {
  return { status: "ok" };
});

const port = Number(env.PORT);

async function main() {
  app.register(teacherRoutes, { prefix: "/teacher" });
  app.register(studentRoutes, { prefix: "/student" });
  app.register(classroomRoutes, { prefix: "/classroom" });
  app.register(activitiesRoutes, { prefix: "/activities" });

  try {
    await app.listen({ port });
    console.log(`Server running on http://localhost:${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

main();

export default app;
