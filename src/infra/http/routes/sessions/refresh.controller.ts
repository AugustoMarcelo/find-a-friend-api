import { FastifyRequest, FastifyReply } from 'fastify'
import { env } from '@/infra/env'

export async function refreshController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const refreshToken = request.cookies.refreshToken

  if (!refreshToken) {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  try {
    const decoded = request.server.jwt.verify<{ sub: string }>(refreshToken)
    request.user = { sub: decoded.sub }
  } catch {
    return reply.status(401).send({ message: 'Unauthorized' })
  }

  const accessToken = await reply.jwtSign(
    {},
    {
      sign: {
        sub: request.user.sub,
        expiresIn: env.JWT_EXPIRES_IN,
      },
    },
  )

  const newRefreshToken = await reply.jwtSign(
    {},
    {
      sign: {
        sub: request.user.sub,
        expiresIn: env.JWT_REFRESH_EXPIRES_IN,
      },
    },
  )

  return reply
    .setCookie('refreshToken', newRefreshToken, {
      path: '/',
      secure: true,
      sameSite: true,
      httpOnly: true,
    })
    .status(200)
    .send({
      accessToken,
    })
}
