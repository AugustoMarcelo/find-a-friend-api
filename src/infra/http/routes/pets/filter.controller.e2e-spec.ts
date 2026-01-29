import { app } from '@/infra/http/app'
import { resetDatabase } from 'test/e2e/helpers/reset-database'
import { createAndAuthenticateOrganization } from 'test/e2e/helpers/create-and-authenticate-organization'

describe('Filter Pets (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await resetDatabase()
  })

  it('should filter pets by age', async () => {
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
        about: 'An adult dog',
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
        about: 'A puppy',
        age: 'PUPPY',
        size: 'SMALL',
        energyLevel: 'HIGH',
        independenceLevel: 'LOW',
        environment: 'LARGE_SPACE',
      },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/pets/filter',
      query: {
        city: 'Sao Paulo',
        age: 'PUPPY',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().pets).toHaveLength(1)
    expect(response.json().pets[0].name).toBe('Max')
  })

  it('should filter pets by size', async () => {
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
        about: 'A medium dog',
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
        name: 'Tiny',
        about: 'A tiny dog',
        age: 'ADULT',
        size: 'TINY',
        energyLevel: 'LOW',
        independenceLevel: 'LOW',
        environment: 'SMALL_SPACE',
      },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/pets/filter',
      query: {
        city: 'Sao Paulo',
        size: 'TINY',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().pets).toHaveLength(1)
    expect(response.json().pets[0].name).toBe('Tiny')
  })

  it('should filter pets by energy level', async () => {
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
        name: 'Calm',
        about: 'A calm dog',
        age: 'SENIOR',
        size: 'LARGE',
        energyLevel: 'LOW',
        independenceLevel: 'HIGH',
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
        name: 'Energetic',
        about: 'A high energy dog',
        age: 'ADULT',
        size: 'MEDIUM',
        energyLevel: 'HIGH',
        independenceLevel: 'LOW',
        environment: 'LARGE_SPACE',
      },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/pets/filter',
      query: {
        city: 'Sao Paulo',
        energyLevel: 'HIGH',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().pets).toHaveLength(1)
    expect(response.json().pets[0].name).toBe('Energetic')
  })

  it('should filter pets by multiple criteria', async () => {
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
        name: 'Perfect Match',
        about: 'Perfect for apartments',
        age: 'ADULT',
        size: 'SMALL',
        energyLevel: 'LOW',
        independenceLevel: 'HIGH',
        environment: 'SMALL_SPACE',
      },
    })

    await app.inject({
      method: 'POST',
      url: '/pets',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        name: 'Active Dog',
        about: 'Needs a big yard',
        age: 'ADULT',
        size: 'LARGE',
        energyLevel: 'HIGH',
        independenceLevel: 'LOW',
        environment: 'LARGE_SPACE',
      },
    })

    const response = await app.inject({
      method: 'GET',
      url: '/pets/filter',
      query: {
        city: 'Sao Paulo',
        age: 'ADULT',
        size: 'SMALL',
        energyLevel: 'LOW',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().pets).toHaveLength(1)
    expect(response.json().pets[0].name).toBe('Perfect Match')
  })

  it('should return 400 for missing city', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pets/filter',
      query: {
        age: 'ADULT',
      },
    })

    expect(response.statusCode).toBe(400)
  })

  it('should return empty array when no pets match filters', async () => {
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

    const response = await app.inject({
      method: 'GET',
      url: '/pets/filter',
      query: {
        city: 'Sao Paulo',
        age: 'SENIOR',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().pets).toHaveLength(0)
  })
})
