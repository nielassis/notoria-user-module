import { FastifyInstance } from "fastify";
import { verifyJWT } from "../middlewares/verifyJWT";
import {
  listConversations,
  listMessages,
  sendMessage,
} from "../controllers/chat.controller";

export default async function chatRoutes(server: FastifyInstance) {
  server.register(async (privateRoutes) => {
    privateRoutes.addHook("onRequest", verifyJWT);

    privateRoutes.post("/", sendMessage);

    privateRoutes.get("/conversations", listConversations);

    privateRoutes.get("/conversations/:id/messages", listMessages);
  });
}
