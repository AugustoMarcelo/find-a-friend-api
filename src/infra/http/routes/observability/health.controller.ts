import { FastifyReply, FastifyRequest } from 'fastify'

export async function healthController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.status(200).send({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
}
