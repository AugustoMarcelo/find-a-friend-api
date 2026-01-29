import { FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import { DeletePetPhotoUseCase } from '@/domain/adoption/application/use-cases/delete-pet-photo'
import { PrismaPetsRepository } from '@/infra/database/prisma/repositories/prisma-pets-repository'
import { PrismaPetPhotosRepository } from '@/infra/database/prisma/repositories/prisma-pet-photos-repository'
import { NotAllowedError } from '@/core/errors/not-allowed-error'

const deletePetPhotoParamsSchema = z.object({
  petId: z.string().uuid(),
  photoId: z.string().uuid(),
})

export async function deletePhotoController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { petId, photoId } = deletePetPhotoParamsSchema.parse(request.params)
  const organizationId = request.user.sub

  const petPhotosRepository = new PrismaPetPhotosRepository()
  const petsRepository = new PrismaPetsRepository(petPhotosRepository)
  const useCase = new DeletePetPhotoUseCase(petsRepository)

  const result = await useCase.execute({
    petId,
    photoId,
    organizationId,
  })

  if (result.isLeft()) {
    const error = result.value

    if (error instanceof NotAllowedError) {
      return reply.status(403).send({ message: error.message })
    }

    throw error
  }

  return reply.status(204).send()
}
