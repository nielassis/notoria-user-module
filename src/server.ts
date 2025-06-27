import fastify from "fastify";

const app = fastify();

app.listen({ port: 3000 }, () => {
  console.log("Server listening on port 3000");
});

export default app;
