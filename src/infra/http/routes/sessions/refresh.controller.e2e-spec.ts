import { app } from '@/infra/http/app'
import { resetDatabase } from 'test/e2e/helpers/reset-database'

describe('Refresh Token (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await resetDatabase()
  })

  it('should refresh token with valid refresh cookie', async () => {
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

    const authResponse = await app.inject({
      method: 'POST',
      url: '/sessions',
      payload: {
        email: 'john@example.com',
        password: '123456',
      },
    })

    const cookies = authResponse.cookies
    const refreshTokenCookie = cookies.find(
      (cookie) => cookie.name === 'refreshToken',
    )

    const response = await app.inject({
      method: 'PATCH',
      url: '/token/refresh',
      cookies: {
        refreshToken: refreshTokenCookie!.value,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      accessToken: expect.any(String),
    })
  })

  it('should set new refresh token cookie on refresh', async () => {
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

    const authResponse = await app.inject({
      method: 'POST',
      url: '/sessions',
      payload: {
        email: 'john@example.com',
        password: '123456',
      },
    })

    const cookies = authResponse.cookies
    const refreshTokenCookie = cookies.find(
      (cookie) => cookie.name === 'refreshToken',
    )

    const response = await app.inject({
      method: 'PATCH',
      url: '/token/refresh',
      cookies: {
        refreshToken: refreshTokenCookie!.value,
      },
    })

    const newCookies = response.cookies
    const newRefreshToken = newCookies.find(
      (cookie) => cookie.name === 'refreshToken',
    )

    expect(newRefreshToken).toBeDefined()
    expect(newRefreshToken?.httpOnly).toBe(true)
  })

  it('should return 401 without refresh cookie', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/token/refresh',
    })

    expect(response.statusCode).toBe(401)
  })

  it('should return 401 with invalid refresh token', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/token/refresh',
      cookies: {
        refreshToken: 'invalid-token',
      },
    })

    expect(response.statusCode).toBe(401)
  })
})
