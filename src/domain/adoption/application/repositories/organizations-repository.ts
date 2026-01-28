import { Organization } from '../../enterprise/entities/organization'

export interface OrganizationsRepository {
  create(organization: Organization): Promise<void>
  findById(id: string): Promise<Organization | null>
  findByEmail(email: string): Promise<Organization | null>
  save(organization: Organization): Promise<void>
}
