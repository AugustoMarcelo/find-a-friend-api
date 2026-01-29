import { app } from '@/infra/http/app'
import { resetDatabase } from 'test/e2e/helpers/reset-database'

describe('Create Organization (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await resetDatabase()
  })

  it('should create an organization with valid data', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/organizations',
      payload: {
        ownerName: 'John Doe',
        email: 'john@example.com',
        cep: '01310-100',
        address: 'Av. Paulista, 1000',
        city: 'Sao Paulo',
        state: 'SP',
        whatsapp: '11999999999',
        password: '123456',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual({
      organization: expect.objectContaining({
        id: expect.any(String),
        email: 'john@example.com',
        city: 'Sao Paulo',
      }),
    })
  })

  it('should return 400 for invalid email format', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/organizations',
      payload: {
        ownerName: 'John Doe',
        email: 'invalid-email',
        cep: '01310-100',
        address: 'Av. Paulista, 1000',
        city: 'Sao Paulo',
        state: 'SP',
        whatsapp: '11999999999',
        password: '123456',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual(
      expect.objectContaining({
        message: 'Validation error',
      }),
    )
  })

  it('should return 400 for invalid CEP format', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/organizations',
      payload: {
        ownerName: 'John Doe',
        email: 'john@example.com',
        cep: '123',
        address: 'Av. Paulista, 1000',
        city: 'Sao Paulo',
        state: 'SP',
        whatsapp: '11999999999',
        password: '123456',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual(
      expect.objectContaining({
        message: 'Validation error',
      }),
    )
  })

  it('should return 400 for password less than 6 characters', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/organizations',
      payload: {
        ownerName: 'John Doe',
        email: 'john@example.com',
        cep: '01310-100',
        address: 'Av. Paulista, 1000',
        city: 'Sao Paulo',
        state: 'SP',
        whatsapp: '11999999999',
        password: '12345',
      },
    })

    expect(response.statusCode).toBe(400)
    expect(response.json()).toEqual(
      expect.objectContaining({
        message: 'Validation error',
      }),
    )
  })

  it('should return 409 for duplicate email', async () => {
    await app.inject({
      method: 'POST',
      url: '/organizations',
      payload: {
        ownerName: 'John Doe',
        email: 'john@example.com',
        cep: '01310-100',
        address: 'Av. Paulista, 1000',
        city: 'Sao Paulo',
        state: 'SP',
        whatsapp: '11999999999',
        password: '123456',
      },
    })

    const response = await app.inject({
      method: 'POST',
      url: '/organizations',
      payload: {
        ownerName: 'Jane Doe',
        email: 'john@example.com',
        cep: '01310-100',
        address: 'Rua Augusta, 500',
        city: 'Sao Paulo',
        state: 'SP',
        whatsapp: '11888888888',
        password: '654321',
      },
    })

    expect(response.statusCode).toBe(409)
    expect(response.json()).toEqual(
      expect.objectContaining({
        message: expect.any(String),
      }),
    )
  })
})
