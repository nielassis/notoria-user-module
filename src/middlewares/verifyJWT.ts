import { FastifyRequest, FastifyReply } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

const SECRET = env.SECRET;

export async function verifyJWT(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Token ausente ou inválido" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, SECRET) as {
      sub: string;
      email?: string;
      name?: string;
    };

    request.user = {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
    };
  } catch (err) {
    return reply.status(401).send({ error: "Token inválido ou expirado" });
  }
}
