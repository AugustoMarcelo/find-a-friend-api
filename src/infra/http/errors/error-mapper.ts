import { ZodError } from 'zod'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InvalidCredentialsError } from '@/core/errors/invalid-credentials-error'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { OrganizationAlreadyExistsError } from '@/domain/adoption/application/use-cases/errors/organization-already-exists-error'
import { HttpErrorResponse } from './http-error-response'

export class ErrorMapper {
  static toHttp(error: unknown): HttpErrorResponse | null {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of error.issues) {
        const field = issue.path.join('.')
        if (!fieldErrors[field]) {
          fieldErrors[field] = []
        }
        fieldErrors[field].push(issue.message)
      }

      return {
        statusCode: 400,
        body: {
          message: 'Validation error',
          issues: fieldErrors,
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

    if (ErrorMapper.isJwtError(error)) {
      return {
        statusCode: 401,
        body: { message: 'Unauthorized' },
      }
    }

    return null
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
