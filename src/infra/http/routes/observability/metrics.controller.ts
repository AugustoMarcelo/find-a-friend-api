import { FastifyReply, FastifyRequest } from 'fastify'
import { register } from '@/infra/metrics/prometheus'

export async function metricsController(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  const metrics = await register.metrics()

  return reply
    .status(200)
    .header('Content-Type', register.contentType)
    .send(metrics)
}
