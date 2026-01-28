import { InMemoryOrganizationsRepository } from 'test/repositories/in-memory-organizations-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { CreateOrganizationUseCase } from './create-organization'
import { OrganizationAlreadyExistsError } from './errors/organization-already-exists-error'

let organizationsRepository: InMemoryOrganizationsRepository
let hasher: FakeHasher
let sut: CreateOrganizationUseCase

describe('Create Organization', () => {
  beforeEach(() => {
    organizationsRepository = new InMemoryOrganizationsRepository()
    hasher = new FakeHasher()
    sut = new CreateOrganizationUseCase(organizationsRepository, hasher)
  })

  it('should create an organization', async () => {
    const result = await sut.execute({
      ownerName: 'John Doe',
      email: 'john@example.com',
      cep: '01310100',
      address: 'Rua do Meio, 123',
      city: 'Sao Paulo',
      state: 'SP',
      whatsapp: '11999999999',
      password: '123456',
    })

    expect(result.isRight()).toBe(true)
    expect(organizationsRepository.items).toHaveLength(1)
    expect(organizationsRepository.items[0].email.getValue()).toBe(
      'john@example.com',
    )
  })

  it('should not create organization with duplicate email', async () => {
    await sut.execute({
      ownerName: 'John Doe',
      email: 'john@example.com',
      cep: '01310100',
      address: 'Rua do Meio, 123',
      city: 'Sao Paulo',
      state: 'SP',
      whatsapp: '11999999999',
      password: '123456',
    })

    const result = await sut.execute({
      ownerName: 'Jane Doe',
      email: 'john@example.com',
      cep: '01310100',
      address: 'Rua do Meio, 456',
      city: 'Sao Paulo',
      state: 'SP',
      whatsapp: '11888888888',
      password: '654321',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(OrganizationAlreadyExistsError)
  })

  it('should hash the password', async () => {
    await sut.execute({
      ownerName: 'John Doe',
      email: 'john@example.com',
      cep: '01310100',
      address: 'Rua do Meio, 123',
      city: 'Sao Paulo',
      state: 'SP',
      whatsapp: '11999999999',
      password: '123456',
    })

    expect(organizationsRepository.items[0].passwordHash).toBe('123456-hashed')
  })
})
