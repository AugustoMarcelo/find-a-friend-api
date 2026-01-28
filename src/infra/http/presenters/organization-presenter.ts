import { Organization } from '@/domain/adoption/enterprise/entities/organization'

export class OrganizationPresenter {
  static toHTTP(organization: Organization) {
    return {
      id: organization.id.toValue(),
      ownerName: organization.ownerName,
      email: organization.email.getValue(),
      cep: organization.cep.getFormatted(),
      address: organization.address,
      city: organization.city,
      state: organization.state,
      whatsapp: organization.whatsapp.getFormatted(),
      createdAt: organization.createdAt,
    }
  }
}
