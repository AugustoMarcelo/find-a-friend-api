import { Either, left, right } from '@/core/either'
import { InvalidCredentialsError } from '@/core/errors/invalid-credentials-error'
import { Organization } from '../../enterprise/entities/organization'
import { OrganizationsRepository } from '../repositories/organizations-repository'
import { Hasher } from '../cryptography/hasher'

interface AuthenticateOrganizationRequest {
  email: string
  password: string
}

type AuthenticateOrganizationResponse = Either<
  InvalidCredentialsError,
  { organization: Organization }
>

export class AuthenticateOrganizationUseCase {
  constructor(
    private organizationsRepository: OrganizationsRepository,
    private hasher: Hasher,
  ) {}

  async execute(
    request: AuthenticateOrganizationRequest,
  ): Promise<AuthenticateOrganizationResponse> {
    const organization = await this.organizationsRepository.findByEmail(
      request.email,
    )

    if (!organization) {
      return left(new InvalidCredentialsError())
    }

    const isPasswordValid = await this.hasher.compare(
      request.password,
      organization.passwordHash,
    )

    if (!isPasswordValid) {
      return left(new InvalidCredentialsError())
    }

    return right({ organization })
  }
}
