import fastify from "fastify";
import { env } from "./config/env";
import teacherRoutes from "./routes/teacher.routes";
import studentRoutes from "./routes/students.routes";

const app = fastify();

app.get("/health", async () => {
  return { status: "ok" };
});

const port = Number(env.PORT);

async function main() {
  app.register(teacherRoutes, { prefix: "/teacher" });
  app.register(studentRoutes, { prefix: "/student" });

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
