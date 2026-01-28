import { faker } from '@faker-js/faker'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import {
  Organization,
  OrganizationProps,
} from '@/domain/adoption/enterprise/entities/organization'
import { Email } from '@/domain/adoption/enterprise/entities/value-objects/email'
import { Cep } from '@/domain/adoption/enterprise/entities/value-objects/cep'
import { Whatsapp } from '@/domain/adoption/enterprise/entities/value-objects/whatsapp'

export function makeOrganization(
  override: Partial<OrganizationProps> = {},
  id?: UniqueEntityId,
): Organization {
  return Organization.create(
    {
      ownerName: faker.person.fullName(),
      email: Email.create(faker.internet.email()),
      cep: Cep.create('01310100'),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      whatsapp: Whatsapp.create('11999999999'),
      passwordHash: faker.internet.password(),
      ...override,
    },
    id,
  )
}
