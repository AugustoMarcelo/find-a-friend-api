import { ZodError } from 'zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InvalidCredentialsError } from '@/core/errors/invalid-credentials-error'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { OrganizationAlreadyExistsError } from '@/domain/adoption/application/use-cases/errors/organization-already-exists-error'
import { HttpErrorResponse } from './http-error-response'

export class ErrorMapper {
  static toHttp(error: unknown): HttpErrorResponse | null {
    if (error instanceof ZodError) {
      return {
        statusCode: 400,
        body: {
          message: 'Validation error',
          issues: error.issues,
        },
      }
    }

    if (error instanceof ResourceNotFoundError) {
      return {
        statusCode: 404,
        body: { message: error.message },
      }
    }

    if (error instanceof InvalidCredentialsError) {
      return {
        statusCode: 401,
        body: { message: error.message },
      }
    }

    if (error instanceof NotAllowedError) {
      return {
        statusCode: 403,
        body: { message: error.message },
      }
    }

    if (error instanceof OrganizationAlreadyExistsError) {
      return {
        statusCode: 409,
        body: { message: error.message },
      }
    }

    if (ErrorMapper.isFastifyValidationError(error)) {
      return {
        statusCode: 400,
        body: {
          message: 'Validation error',
          issues: (error as { validation: unknown[] }).validation,
        },
      }
    }

    if (ErrorMapper.isJwtError(error)) {
      return {
        statusCode: 401,
        body: { message: 'Unauthorized' },
      }
    }

    return null
  }

  private static isFastifyValidationError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'FST_ERR_VALIDATION' &&
      'validation' in error
    )
  }

  private static isJwtError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null || !('code' in error)) {
      return false
    }
    const code = (error as { code: string }).code
    return (
      code === 'FST_JWT_NO_AUTHORIZATION_IN_COOKIE' ||
      code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID'
    )
  }
}
