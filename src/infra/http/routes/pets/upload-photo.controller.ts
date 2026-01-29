import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { UploadPetPhotoUseCase } from '@/domain/adoption/application/use-cases/upload-pet-photo'
import { PrismaPetsRepository } from '@/infra/database/prisma/repositories/prisma-pets-repository'
import { PrismaPetPhotosRepository } from '@/infra/database/prisma/repositories/prisma-pet-photos-repository'

const uploadPetPhotoParamsSchema = z.object({
  petId: z.uuid(),
})

const uploadPetPhotoBodySchema = z.object({
  url: z.url(),
})

export async function uploadPhotoController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { petId } = uploadPetPhotoParamsSchema.parse(request.params)
  const { url } = uploadPetPhotoBodySchema.parse(request.body)
  const organizationId = request.user.sub

  const petPhotosRepository = new PrismaPetPhotosRepository()
  const petsRepository = new PrismaPetsRepository(petPhotosRepository)
  const useCase = new UploadPetPhotoUseCase(petsRepository)

  const result = await useCase.execute({
    petId,
    organizationId,
    photoUrl: url,
  })

  if (result.isLeft()) {
    throw result.value
  }

  const { photo } = result.value

  return reply.status(201).send({
    photo: {
      id: photo.id.toValue(),
      petId: photo.petId.toValue(),
      url: photo.url,
      createdAt: photo.createdAt,
    },
  })
}
