import { OrganizationsRepository } from '@/domain/adoption/application/repositories/organizations-repository'
import { Organization } from '@/domain/adoption/enterprise/entities/organization'

export class InMemoryOrganizationsRepository implements OrganizationsRepository {
  public items: Organization[] = []

  async create(organization: Organization): Promise<void> {
    this.items.push(organization)
  }

  async findById(id: string): Promise<Organization | null> {
    return this.items.find((item) => item.id.toValue() === id) ?? null
  }

  async findByEmail(email: string): Promise<Organization | null> {
    return (
      this.items.find(
        (item) => item.email.getValue() === email.toLowerCase(),
      ) ?? null
    )
  }

  async save(organization: Organization): Promise<void> {
    const index = this.items.findIndex((item) =>
      item.id.equals(organization.id),
    )
    if (index >= 0) {
      this.items[index] = organization
    }
  }
}
