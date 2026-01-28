import { Organization as PrismaOrganization } from '@prisma/client'
import { Organization } from '@/domain/adoption/enterprise/entities/organization'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { Email } from '@/domain/adoption/enterprise/entities/value-objects/email'
import { Cep } from '@/domain/adoption/enterprise/entities/value-objects/cep'
import { Whatsapp } from '@/domain/adoption/enterprise/entities/value-objects/whatsapp'

export class PrismaOrganizationMapper {
  static toDomain(raw: PrismaOrganization): Organization {
    return Organization.create(
      {
        ownerName: raw.ownerName,
        email: Email.create(raw.email),
        cep: Cep.create(raw.cep),
        address: raw.address,
        city: raw.city,
        state: raw.state,
        whatsapp: Whatsapp.create(raw.whatsapp),
        passwordHash: raw.passwordHash,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  static toPrisma(organization: Organization) {
    return {
      id: organization.id.toValue(),
      ownerName: organization.ownerName,
      email: organization.email.getValue(),
      cep: organization.cep.getValue(),
      address: organization.address,
      city: organization.city,
      state: organization.state,
      whatsapp: organization.whatsapp.getValue(),
      passwordHash: organization.passwordHash,
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt,
    }
  }
}
