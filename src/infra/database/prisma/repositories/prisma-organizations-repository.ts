import { prisma } from '../prisma-client'
import { OrganizationsRepository } from '@/domain/adoption/application/repositories/organizations-repository'
import { Organization } from '@/domain/adoption/enterprise/entities/organization'
import { PrismaOrganizationMapper } from '../mappers/prisma-organization-mapper'

export class PrismaOrganizationsRepository implements OrganizationsRepository {
  async create(organization: Organization): Promise<void> {
    const data = PrismaOrganizationMapper.toPrisma(organization)
    await prisma.organization.create({ data })
  }

  async findById(id: string): Promise<Organization | null> {
    const organization = await prisma.organization.findUnique({
      where: { id },
    })

    if (!organization) {
      return null
    }

    return PrismaOrganizationMapper.toDomain(organization)
  }

  async findByEmail(email: string): Promise<Organization | null> {
    const organization = await prisma.organization.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!organization) {
      return null
    }

    return PrismaOrganizationMapper.toDomain(organization)
  }

  async save(organization: Organization): Promise<void> {
    const data = PrismaOrganizationMapper.toPrisma(organization)
    await prisma.organization.update({
      where: { id: data.id },
      data,
    })
  }
}
