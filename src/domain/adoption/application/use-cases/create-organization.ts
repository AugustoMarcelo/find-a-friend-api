import { Either, left, right } from '@/core/either'
import { Organization } from '../../enterprise/entities/organization'
import { OrganizationsRepository } from '../repositories/organizations-repository'
import { Hasher } from '../cryptography/hasher'
import { Email } from '../../enterprise/entities/value-objects/email'
import { Cep } from '../../enterprise/entities/value-objects/cep'
import { Whatsapp } from '../../enterprise/entities/value-objects/whatsapp'
import { OrganizationAlreadyExistsError } from './errors/organization-already-exists-error'

interface CreateOrganizationRequest {
  ownerName: string
  email: string
  cep: string
  address: string
  city: string
  state: string
  whatsapp: string
  password: string
}

type CreateOrganizationResponse = Either<
  OrganizationAlreadyExistsError,
  { organization: Organization }
>

export class CreateOrganizationUseCase {
  constructor(
    private organizationsRepository: OrganizationsRepository,
    private hasher: Hasher,
  ) {}

  async execute(
    request: CreateOrganizationRequest,
  ): Promise<CreateOrganizationResponse> {
    const existingOrg = await this.organizationsRepository.findByEmail(
      request.email,
    )

    if (existingOrg) {
      return left(new OrganizationAlreadyExistsError())
    }

    const passwordHash = await this.hasher.hash(request.password)

    const organization = Organization.create({
      ownerName: request.ownerName,
      email: Email.create(request.email),
      cep: Cep.create(request.cep),
      address: request.address,
      city: request.city,
      state: request.state,
      whatsapp: Whatsapp.create(request.whatsapp),
      passwordHash,
    })

    await this.organizationsRepository.create(organization)

    return right({ organization })
  }
}
