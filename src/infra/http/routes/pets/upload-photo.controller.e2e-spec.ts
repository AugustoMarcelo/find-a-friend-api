import { app } from '@/infra/http/app'
import { resetDatabase } from 'test/e2e/helpers/reset-database'
import { createAndAuthenticateOrganization } from 'test/e2e/helpers/create-and-authenticate-organization'

describe('Upload Pet Photo (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await resetDatabase()
  })

  it('should upload photo to own pet', async () => {
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
      method: 'POST',
      url: `/pets/${pet.id}/photos`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        url: 'https://example.com/new-photo.jpg',
      },
    })

    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual({
      photo: expect.objectContaining({
        id: expect.any(String),
        petId: pet.id,
        url: 'https://example.com/new-photo.jpg',
      }),
    })
  })

  it('should return 401 without token', async () => {
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
      method: 'POST',
      url: `/pets/${pet.id}/photos`,
      payload: {
        url: 'https://example.com/new-photo.jpg',
      },
    })

    expect(response.statusCode).toBe(401)
  })

  it('should return 403 for other organization pet', async () => {
    const { accessToken: org1Token } = await createAndAuthenticateOrganization(
      app,
      {
        email: 'org1@example.com',
      },
    )

    const { accessToken: org2Token } = await createAndAuthenticateOrganization(
      app,
      {
        email: 'org2@example.com',
      },
    )

    const createResponse = await app.inject({
      method: 'POST',
      url: '/pets',
      headers: {
        authorization: `Bearer ${org1Token}`,
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
      method: 'POST',
      url: `/pets/${pet.id}/photos`,
      headers: {
        authorization: `Bearer ${org2Token}`,
      },
      payload: {
        url: 'https://example.com/new-photo.jpg',
      },
    })

    expect(response.statusCode).toBe(403)
  })

  it('should return 404 for non-existent pet', async () => {
    const { accessToken } = await createAndAuthenticateOrganization(app)

    const response = await app.inject({
      method: 'POST',
      url: '/pets/00000000-0000-0000-0000-000000000000/photos',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        url: 'https://example.com/new-photo.jpg',
      },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should return 400 for invalid URL', async () => {
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
      method: 'POST',
      url: `/pets/${pet.id}/photos`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
      payload: {
        url: 'invalid-url',
      },
    })

    expect(response.statusCode).toBe(400)
  })
})
