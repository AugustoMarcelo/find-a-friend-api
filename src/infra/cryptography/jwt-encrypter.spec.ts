import Fastify from 'fastify'
import fastifyJwt from '@fastify/jwt'
import { JwtEncrypter } from './jwt-encrypter'

describe('JwtEncrypter', () => {
  it('should encrypt a payload into a JWT token', async () => {
    const app = Fastify()
    await app.register(fastifyJwt, { secret: 'test-secret' })

    const encrypter = new JwtEncrypter(app)
    const payload = { sub: 'user-123', name: 'John Doe' }

    const token = await encrypter.encrypt(payload)

    expect(token).toEqual(expect.any(String))
    expect(token.split('.')).toHaveLength(3)

    const decoded = app.jwt.decode(token) as Record<string, unknown>
    expect(decoded.sub).toBe('user-123')
    expect(decoded.name).toBe('John Doe')

    await app.close()
  })

  it('should encrypt different payloads into different tokens', async () => {
    const app = Fastify()
    await app.register(fastifyJwt, { secret: 'test-secret' })

    const encrypter = new JwtEncrypter(app)

    const token1 = await encrypter.encrypt({ sub: 'user-1' })
    const token2 = await encrypter.encrypt({ sub: 'user-2' })

    expect(token1).not.toBe(token2)

    await app.close()
  })

  it('should handle empty payload', async () => {
    const app = Fastify()
    await app.register(fastifyJwt, { secret: 'test-secret' })

    const encrypter = new JwtEncrypter(app)

    const token = await encrypter.encrypt({})

    expect(token).toEqual(expect.any(String))
    expect(token.split('.')).toHaveLength(3)

    await app.close()
  })
})
