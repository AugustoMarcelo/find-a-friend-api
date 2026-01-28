export class OrganizationAlreadyExistsError extends Error {
  constructor() {
    super('Organization with this email already exists')
  }
}
