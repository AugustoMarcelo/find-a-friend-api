import { hash, compare } from 'bcryptjs'
import { Hasher } from '@/domain/adoption/application/cryptography/hasher'

export class BcryptHasher implements Hasher {
  private HASH_SALT_LENGTH = 8

  async hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGTH)
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash)
  }
}
