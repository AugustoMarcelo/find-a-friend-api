import { app } from '@/infra/http/app'
import { resetDatabase } from 'test/e2e/helpers/reset-database'
import { createAndAuthenticateOrganization } from 'test/e2e/helpers/create-and-authenticate-organization'

describe('Get Pet Details (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await resetDatabase()
  })

  it('should return pet details', async () => {
    const { accessToken } = await createAndAuthenticateOrganization(app)

    const createResponse = await app.inject({
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

    const { pet } = createResponse.json()

    const response = await app.inject({
      method: 'GET',
      url: `/pets/${pet.id}`,
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().pet).toEqual(
      expect.objectContaining({
        id: pet.id,
        name: 'Buddy',
        about: 'A friendly dog',
        age: 'ADULT',
        size: 'MEDIUM',
        energyLevel: 'MEDIUM',
        independenceLevel: 'MEDIUM',
        environment: 'MEDIUM_SPACE',
      }),
    )
  })

  it('should include photos in the response', async () => {
    const { accessToken } = await createAndAuthenticateOrganization(app)

    const createResponse = await app.inject({
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
        photos: [
          'https://example.com/photo1.jpg',
          'https://example.com/photo2.jpg',
        ],
      },
    })

    const { pet } = createResponse.json()

    const response = await app.inject({
      method: 'GET',
      url: `/pets/${pet.id}`,
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().pet.photos).toHaveLength(2)
  })

  it('should include adoption requirements in the response', async () => {
    const { accessToken } = await createAndAuthenticateOrganization(app)

    const createResponse = await app.inject({
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
        adoptionRequirements: ['Large yard required', 'Active owner preferred'],
      },
    })

    const { pet } = createResponse.json()

    const response = await app.inject({
      method: 'GET',
      url: `/pets/${pet.id}`,
    })

    expect(response.statusCode).toBe(200)
    expect(response.json().pet.adoptionRequirements).toHaveLength(2)
    expect(response.json().pet.adoptionRequirements).toContain(
      'Large yard required',
    )
  })

  it('should return 404 for non-existent pet', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pets/00000000-0000-0000-0000-000000000000',
    })

    expect(response.statusCode).toBe(404)
  })

  it('should return 400 for invalid UUID', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/pets/invalid-uuid',
    })

    expect(response.statusCode).toBe(400)
  })
})
