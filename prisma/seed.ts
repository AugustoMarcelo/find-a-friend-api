import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { hash } from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  const passwordHash = await hash('123456', 6)

  // Organization 1 - São Paulo
  const org1 = await prisma.organization.upsert({
    where: { email: 'contato@patinhasfelizes.com.br' },
    update: {},
    create: {
      id: 'seed-org-1',
      ownerName: 'Maria Silva',
      email: 'contato@patinhasfelizes.com.br',
      cep: '01310-100',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      whatsapp: '11999999999',
      passwordHash,
    },
  })

  // Organization 2 - Rio de Janeiro
  const org2 = await prisma.organization.upsert({
    where: { email: 'contato@amigospets.com.br' },
    update: {},
    create: {
      id: 'seed-org-2',
      ownerName: 'João Santos',
      email: 'contato@amigospets.com.br',
      cep: '22041-080',
      address: 'Rua Visconde de Pirajá, 500',
      city: 'Rio de Janeiro',
      state: 'RJ',
      whatsapp: '21988888888',
      passwordHash,
    },
  })

  // Pets for Organization 1 (São Paulo)
  await prisma.pet.upsert({
    where: { id: 'seed-pet-1' },
    update: {},
    create: {
      id: 'seed-pet-1',
      organizationId: org1.id,
      name: 'Rex',
      about:
        'Rex é um cachorro muito brincalhão e carinhoso. Adora correr no parque e brincar com bolas. É muito sociável com outros cães e ótimo com crianças.',
      age: 'ADULT',
      size: 'LARGE',
      energyLevel: 'HIGH',
      independenceLevel: 'LOW',
      environment: 'LARGE_SPACE',
      photos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
          },
        ],
      },
      adoptionRequirements: [
        'Precisa de espaço amplo para correr',
        'Necessita de passeios diários',
        'Ideal para famílias ativas',
      ],
      city: 'São Paulo',
    },
  })

  await prisma.pet.upsert({
    where: { id: 'seed-pet-2' },
    update: {},
    create: {
      id: 'seed-pet-2',
      organizationId: org1.id,
      name: 'Luna',
      about:
        'Luna é uma gatinha muito dócil e tranquila. Adora ficar no colo e receber carinho. Perfeita para apartamentos.',
      age: 'PUPPY',
      size: 'SMALL',
      energyLevel: 'LOW',
      independenceLevel: 'HIGH',
      environment: 'SMALL_SPACE',
      photos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
          },
        ],
      },
      adoptionRequirements: [
        'Ambiente calmo e tranquilo',
        'Pode ficar sozinha durante o dia',
      ],
      city: 'São Paulo',
    },
  })

  await prisma.pet.upsert({
    where: { id: 'seed-pet-3' },
    update: {},
    create: {
      id: 'seed-pet-3',
      organizationId: org1.id,
      name: 'Thor',
      about:
        'Thor é um cãozinho idoso muito sábio e calmo. Já passou da fase agitada e agora só quer um cantinho confortável para descansar.',
      age: 'SENIOR',
      size: 'MEDIUM',
      energyLevel: 'LOW',
      independenceLevel: 'MEDIUM',
      environment: 'MEDIUM_SPACE',
      photos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800',
          },
        ],
      },
      adoptionRequirements: [
        'Ambiente tranquilo',
        'Ideal para pessoas mais calmas',
        'Precisa de acompanhamento veterinário regular',
      ],
      city: 'São Paulo',
    },
  })

  // Pets for Organization 2 (Rio de Janeiro)
  await prisma.pet.upsert({
    where: { id: 'seed-pet-4' },
    update: {},
    create: {
      id: 'seed-pet-4',
      organizationId: org2.id,
      name: 'Mel',
      about:
        'Mel é uma cachorrinha muito alegre e cheia de energia. Adora brincar e fazer novas amizades. Perfeita para quem tem tempo para dedicar.',
      age: 'PUPPY',
      size: 'MEDIUM',
      energyLevel: 'HIGH',
      independenceLevel: 'LOW',
      environment: 'MEDIUM_SPACE',
      photos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=800',
          },
        ],
      },
      adoptionRequirements: [
        'Precisa de atenção constante',
        'Necessita de adestramento básico',
        'Ideal para famílias com crianças',
      ],
      city: 'Rio de Janeiro',
    },
  })

  await prisma.pet.upsert({
    where: { id: 'seed-pet-5' },
    update: {},
    create: {
      id: 'seed-pet-5',
      organizationId: org2.id,
      name: 'Simba',
      about:
        'Simba é um gato muito independente e curioso. Gosta de explorar e tem personalidade forte, mas também adora momentos de carinho.',
      age: 'ADULT',
      size: 'SMALL',
      energyLevel: 'MEDIUM',
      independenceLevel: 'HIGH',
      environment: 'SMALL_SPACE',
      photos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
          },
        ],
      },
      adoptionRequirements: [
        'Telas nas janelas obrigatório',
        'Pode conviver com outros gatos',
      ],
      city: 'Rio de Janeiro',
    },
  })

  await prisma.pet.upsert({
    where: { id: 'seed-pet-6' },
    update: {},
    create: {
      id: 'seed-pet-6',
      organizationId: org2.id,
      name: 'Bob',
      about:
        'Bob é um cachorro muito leal e protetor. Ótimo companheiro para longas caminhadas. Já está vacinado e castrado.',
      age: 'ADULT',
      size: 'LARGE',
      energyLevel: 'MEDIUM',
      independenceLevel: 'MEDIUM',
      environment: 'LARGE_SPACE',
      photos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800',
          },
        ],
      },
      adoptionRequirements: [
        'Casa com quintal',
        'Não indicado para apartamentos',
        'Precisa de socialização com outros cães',
      ],
      city: 'Rio de Janeiro',
    },
  })

  console.log('Seeding completed!')
  console.log(`Created ${2} organizations and ${6} pets`)
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
