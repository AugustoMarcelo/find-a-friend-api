import { app } from '@/infra/http/app'
import { resetDatabase } from 'test/e2e/helpers/reset-database'
import { createAndAuthenticateOrganization } from 'test/e2e/helpers/create-and-authenticate-organization'

describe('Delete Pet Photo (E2E)', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    await resetDatabase()
  })

  it('should delete photo from own pet', async () => {
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
        photos: ['https://example.com/photo.jpg'],
      },
    })

    const { pet } = createResponse.json()
    const photoId = pet.photos[0].id

    const response = await app.inject({
      method: 'DELETE',
      url: `/pets/${pet.id}/photos/${photoId}`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })

    expect(response.statusCode).toBe(204)

    const detailsResponse = await app.inject({
      method: 'GET',
      url: `/pets/${pet.id}`,
    })

    expect(detailsResponse.json().pet.photos).toHaveLength(0)
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
        photos: ['https://example.com/photo.jpg'],
      },
    })

    const { pet } = createResponse.json()
    const photoId = pet.photos[0].id

    const response = await app.inject({
      method: 'DELETE',
      url: `/pets/${pet.id}/photos/${photoId}`,
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
        photos: ['https://example.com/photo.jpg'],
      },
    })

    const { pet } = createResponse.json()
    const photoId = pet.photos[0].id

    const response = await app.inject({
      method: 'DELETE',
      url: `/pets/${pet.id}/photos/${photoId}`,
      headers: {
        authorization: `Bearer ${org2Token}`,
      },
    })

    expect(response.statusCode).toBe(403)
  })

  it('should return 404 for non-existent pet', async () => {
    const { accessToken } = await createAndAuthenticateOrganization(app)

    const response = await app.inject({
      method: 'DELETE',
      url: '/pets/a1b2c3d4-e5f6-7890-abcd-ef1234567890/photos/b2c3d4e5-f6a7-8901-bcde-f12345678901',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })

    expect(response.statusCode).toBe(404)
  })

  it('should return 404 for non-existent photo', async () => {
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
      method: 'DELETE',
      url: `/pets/${pet.id}/photos/00000000-0000-0000-0000-000000000000`,
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })

    expect(response.statusCode).toBe(404)
  })
})
