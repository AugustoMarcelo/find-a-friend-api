import { InMemoryOrganizationsRepository } from 'test/repositories/in-memory-organizations-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { makeOrganization } from 'test/factories/make-organization'
import { AuthenticateOrganizationUseCase } from './authenticate-organization'
import { InvalidCredentialsError } from '@/core/errors/invalid-credentials-error'

let organizationsRepository: InMemoryOrganizationsRepository
let hasher: FakeHasher
let sut: AuthenticateOrganizationUseCase

describe('Authenticate Organization', () => {
  beforeEach(() => {
    organizationsRepository = new InMemoryOrganizationsRepository()
    hasher = new FakeHasher()
    sut = new AuthenticateOrganizationUseCase(organizationsRepository, hasher)
  })

  it('should authenticate an organization', async () => {
    const organization = makeOrganization({
      passwordHash: '123456-hashed',
    })

    await organizationsRepository.create(organization)

    const result = await sut.execute({
      email: organization.email.getValue(),
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.organization.id.equals(organization.id)).toBe(true)
    }
  })

  it('should not authenticate with wrong email', async () => {
    const result = await sut.execute({
      email: 'nonexistent@example.com',
      password: '123456',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })

  it('should not authenticate with wrong password', async () => {
    const organization = makeOrganization({
      passwordHash: '123456-hashed',
    })

    await organizationsRepository.create(organization)

    const result = await sut.execute({
      email: organization.email.getValue(),
      password: 'wrongpassword',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidCredentialsError)
  })
})
