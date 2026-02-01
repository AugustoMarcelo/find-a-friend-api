import { describe, it, expect } from 'vitest'
import { ZodError } from 'zod'
import { ErrorMapper } from './error-mapper'
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error'
import { InvalidCredentialsError } from '@/core/errors/invalid-credentials-error'
import { NotAllowedError } from '@/core/errors/not-allowed-error'
import { OrganizationAlreadyExistsError } from '@/domain/adoption/application/use-cases/errors/organization-already-exists-error'

describe('ErrorMapper', () => {
  it('should map ZodError to 400', () => {
    const error = new ZodError([])
    const result = ErrorMapper.toHttp(error)

    expect(result?.statusCode).toBe(400)
    expect(result?.body.message).toBe('Validation error')
  })

  it('should include field errors in ZodError response', () => {
    const error = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        path: ['email'],
        message: 'Required',
      },
      {
        code: 'too_small',
        minimum: 6,
        origin: 'string',
        inclusive: true,
        path: ['password'],
        message: 'String must contain at least 6 character(s)',
      },
    ])
    const result = ErrorMapper.toHttp(error)

    expect(result?.statusCode).toBe(400)
    expect(result?.body.issues).toEqual({
      email: ['Required'],
      password: ['String must contain at least 6 character(s)'],
    })
  })

  it('should map ResourceNotFoundError to 404', () => {
    const error = new ResourceNotFoundError('Pet not found')
    const result = ErrorMapper.toHttp(error)

    expect(result?.statusCode).toBe(404)
    expect(result?.body.message).toBe('Pet not found')
  })

  it('should map ResourceNotFoundError with default message to 404', () => {
    const error = new ResourceNotFoundError()
    const result = ErrorMapper.toHttp(error)

    expect(result?.statusCode).toBe(404)
    expect(result?.body.message).toBe('Resource not found')
  })

  it('should map InvalidCredentialsError to 401', () => {
    const error = new InvalidCredentialsError()
    const result = ErrorMapper.toHttp(error)

    expect(result?.statusCode).toBe(401)
    expect(result?.body.message).toBe('Invalid credentials')
  })

  it('should map NotAllowedError to 403', () => {
    const error = new NotAllowedError()
    const result = ErrorMapper.toHttp(error)

    expect(result?.statusCode).toBe(403)
    expect(result?.body.message).toBe('Not allowed')
  })

  it('should map NotAllowedError with custom message to 403', () => {
    const error = new NotAllowedError('You cannot do this')
    const result = ErrorMapper.toHttp(error)

    expect(result?.statusCode).toBe(403)
    expect(result?.body.message).toBe('You cannot do this')
  })

  it('should map OrganizationAlreadyExistsError to 409', () => {
    const error = new OrganizationAlreadyExistsError()
    const result = ErrorMapper.toHttp(error)

    expect(result?.statusCode).toBe(409)
    expect(result?.body.message).toBe(
      'Organization with this email already exists',
    )
  })

  it('should map JWT no authorization error to 401', () => {
    const error = { code: 'FST_JWT_NO_AUTHORIZATION_IN_COOKIE' }
    const result = ErrorMapper.toHttp(error)

    expect(result?.statusCode).toBe(401)
    expect(result?.body.message).toBe('Unauthorized')
  })

  it('should map JWT invalid token error to 401', () => {
    const error = { code: 'FST_JWT_AUTHORIZATION_TOKEN_INVALID' }
    const result = ErrorMapper.toHttp(error)

    expect(result?.statusCode).toBe(401)
    expect(result?.body.message).toBe('Unauthorized')
  })

  it('should return null for unknown errors', () => {
    const error = new Error('Unknown error')
    const result = ErrorMapper.toHttp(error)

    expect(result).toBeNull()
  })

  it('should return null for non-error objects', () => {
    const result = ErrorMapper.toHttp({ random: 'object' })

    expect(result).toBeNull()
  })
})
