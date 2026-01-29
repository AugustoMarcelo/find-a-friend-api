import { app } from '@/infra/http/app'
import { resetDatabase } from 'test/e2e/helpers/reset-database'
import { createAndAuthenticateOrganization } from 'test/e2e/helpers/create-and-authenticate-organization'

describe('List Pets by City (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await resetDatabase()
  })

  it('should list pets by city', async () => {
    const { accessToken } = await createAndAuthenticateOrganization(app, {
      city: 'Sao Paulo',
    })

    await app.inject({
      method: 'POST',
      url: '/pets',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: 'Buddy',
        about: 'A friendly dog',
        age: 'ADULT',
        size: 'MEDIUM',
        energyLevel: 'MEDIUM',
        independenceLevel: 'MEDIUM',
        environment: 'MEDIUM_SPACE',
      },
    })

    await app.inject({
      method: 'POST',
      url: '/pets',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: 'Max',
        about: 'A playful dog',
        age: 'PUPPY',
        size: 'SMALL',
        energyLevel: 'HIGH',
        independenceLevel: 'LOW',
        environment: 'LARGE_SPACE',
      },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/pets',
      query: {
        city: 'Sao Paulo',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().pets).toHaveLength(2)
  })

  it('should return empty array when no pets in city', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pets',
      query: {
        city: 'Curitiba',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().pets).toHaveLength(0)
  })

  it('should return 400 for missing city query', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pets',
    })

    expect(response.statusCode).toBe(400)
  })

  it('should only return pets from the specified city', async () => {
    const { accessToken: spToken } = await createAndAuthenticateOrganization(
      app,
      {
        city: 'Sao Paulo',
        email: 'sp@example.com',
      },
    )

    const { accessToken: rjToken } = await createAndAuthenticateOrganization(
      app,
      {
        city: 'Rio de Janeiro',
        email: 'rj@example.com',
      },
    )

    await app.inject({
      method: 'POST',
      url: '/pets',
      headers: {
        authorization: `Bearer ${spToken}`,
      },
      payload: {
        name: 'Buddy',
        about: 'A friendly dog',
        age: 'ADULT',
        size: 'MEDIUM',
        energyLevel: 'MEDIUM',
        independenceLevel: 'MEDIUM',
        environment: 'MEDIUM_SPACE',
      },
    })

    await app.inject({
      method: 'POST',
      url: '/pets',
      headers: {
        authorization: `Bearer ${rjToken}`,
      },
      payload: {
        name: 'Max',
        about: 'A playful dog',
        age: 'PUPPY',
        size: 'SMALL',
        energyLevel: 'HIGH',
        independenceLevel: 'LOW',
        environment: 'LARGE_SPACE',
      },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/pets',
      query: {
        city: 'Sao Paulo',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().pets).toHaveLength(1)
    expect(response.json().pets[0].name).toBe('Buddy')
  })
})
