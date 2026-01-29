import { app } from '@/infra/http/app'
import { resetDatabase } from 'test/e2e/helpers/reset-database'

describe('Authenticate Organization (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await resetDatabase()
  })

  it('should authenticate with valid credentials', async () => {
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
      url: '/sessions',
      payload: {
        email: 'john@example.com',
        password: '123456',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      accessToken: expect.any(String),
    })
  })

  it('should set refresh token cookie', async () => {
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
      url: '/sessions',
      payload: {
        email: 'john@example.com',
        password: '123456',
      },
    })

    const cookies = response.cookies
    const refreshTokenCookie = cookies.find(
      (cookie) => cookie.name === 'refreshToken',
    )

    expect(refreshTokenCookie).toBeDefined()
    expect(refreshTokenCookie?.httpOnly).toBe(true)
  })

  it('should return 401 for wrong email', async () => {
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
      url: '/sessions',
      payload: {
        email: 'wrong@example.com',
        password: '123456',
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('should return 401 for wrong password', async () => {
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
      url: '/sessions',
      payload: {
        email: 'john@example.com',
        password: 'wrongpassword',
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('should return 400 for missing email', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/sessions',
      payload: {
        password: '123456',
      },
    })

    expect(response.statusCode).toBe(400)
  })
})
