import { BcryptHasher } from './bcrypt-hasher'

let sut: BcryptHasher

describe('BcryptHasher', () => {
  beforeEach(() => {
    sut = new BcryptHasher()
  })

  it('should hash a password', async () => {
    const hash = await sut.hash('password123')

    expect(hash).toBeDefined()
    expect(hash).not.toBe('password123')
    expect(hash.length).toBeGreaterThan(0)
  })

  it('should return true when comparing correct password', async () => {
    const password = 'password123'
    const hash = await sut.hash(password)

    const result = await sut.compare(password, hash)

    expect(result).toBe(true)
  })

  it('should return false when comparing incorrect password', async () => {
    const hash = await sut.hash('password123')

    const result = await sut.compare('wrong-password', hash)

    expect(result).toBe(false)
  })

  it('should generate different hashes for the same input', async () => {
    const password = 'password123'

    const hash1 = await sut.hash(password)
    const hash2 = await sut.hash(password)

    expect(hash1).not.toBe(hash2)
  })
})
