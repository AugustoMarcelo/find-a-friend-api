import { FastifyInstance } from 'fastify'
import { Encrypter } from '@/domain/adoption/application/cryptography/encrypter'

export class JwtEncrypter implements Encrypter {
  constructor(private app: FastifyInstance) {}

  async encrypt(payload: Record<string, unknown>): Promise<string> {
    return this.app.jwt.sign(payload)
  }
}
