import fastify from "fastify";
import cors from "@fastify/cors";
import { env } from "./config/env";
import teacherRoutes from "./routes/teacher.routes";
import studentRoutes from "./routes/students.routes";
import classroomRoutes from "./routes/classrooms.routes";
import activitiesRoutes from "./routes/activites.routes";
import chatRoutes from "./routes/chat.routes";

const app = fastify();

app.register(cors, {
  origin: env.FRONT_END_URL,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
});

app.get("/health", async () => {
  return { status: "ok" };
});

app.register(teacherRoutes, { prefix: "/teacher" });
app.register(studentRoutes, { prefix: "/student" });
app.register(classroomRoutes, { prefix: "/classroom" });
app.register(activitiesRoutes, { prefix: "/activities" });
app.register(chatRoutes, { prefix: "/chat" });

if (!process.env.VERCEL) {
  const port = Number(env.PORT) || 3000;
  app
    .listen({ port, host: "0.0.0.0" })
    .then(() => {
      console.log(`Server running on http://localhost:${port}`);
    })
    .catch((err) => {
      app.log.error(err);
      process.exit(1);
    });
}

export default app;
