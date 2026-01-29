import { FastifyInstance } from 'fastify'

interface AuthResponse {
  accessToken: string
  organization: {
    id: string
    email: string
    city: string
  }
}

export async function createAndAuthenticateOrganization(
  app: FastifyInstance,
  overrides: Partial<{
    ownerName: string
    email: string
    password: string
    city: string
  }> = {},
): Promise<AuthResponse> {
  const email = overrides.email ?? 'org@example.com'
  const password = overrides.password ?? '123456'
  const city = overrides.city ?? 'Sao Paulo'

  const createResponse = await app.inject({
    method: 'POST',
    url: '/organizations',
    payload: {
      ownerName: overrides.ownerName ?? 'John Doe',
      email,
      cep: '01310-100',
      address: 'Av. Paulista, 1000',
      city,
      state: 'SP',
      whatsapp: '11999999999',
      password,
    },
  })

  const { organization } = createResponse.json()

  const authResponse = await app.inject({
    method: 'POST',
    url: '/sessions',
    payload: {
      email,
      password,
    },
  })

  const { accessToken } = authResponse.json()

  return {
    accessToken,
    organization: {
      id: organization.id,
      email: organization.email,
      city: organization.city,
    },
  }
}
