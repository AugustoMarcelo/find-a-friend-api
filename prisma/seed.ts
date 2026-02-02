import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { hash } from 'bcryptjs'
import { faker } from '@faker-js/faker'

// Set seed for reproducible data
faker.seed(42)

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const STATES = ['SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'PE', 'CE', 'GO']
const AGES = ['PUPPY', 'ADULT', 'SENIOR'] as const
const SIZES = ['SMALL', 'MEDIUM', 'LARGE'] as const
const ENERGY_LEVELS = ['LOW', 'MEDIUM', 'HIGH'] as const
const INDEPENDENCE_LEVELS = ['LOW', 'MEDIUM', 'HIGH'] as const
const ENVIRONMENTS = ['SMALL_SPACE', 'MEDIUM_SPACE', 'LARGE_SPACE'] as const

const PET_IMAGES = [
  'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800',
  'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=800',
  'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=800',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800',
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=800',
]

function generateCep(): string {
  return faker.string.numeric({ length: 8 })
}

function generateWhatsapp(): string {
  const ddd = faker.helpers.arrayElement([
    '11',
    '21',
    '31',
    '41',
    '51',
    '61',
    '71',
    '81',
    '85',
    '62',
  ])
  return `${ddd}${faker.string.numeric({ length: 9 })}`
}

function generateAdoptionRequirements(
  size: (typeof SIZES)[number],
  energyLevel: (typeof ENERGY_LEVELS)[number],
  environment: (typeof ENVIRONMENTS)[number],
): string[] {
  const requirements: string[] = []

  if (size === 'LARGE' || environment === 'LARGE_SPACE') {
    requirements.push(faker.helpers.arrayElement([
      'Casa com quintal',
      'Precisa de espaço amplo para correr',
      'Não indicado para apartamentos pequenos',
    ]))
  }

  if (energyLevel === 'HIGH') {
    requirements.push(faker.helpers.arrayElement([
      'Necessita de passeios diários',
      'Ideal para famílias ativas',
      'Precisa de exercícios regulares',
    ]))
  }

  if (energyLevel === 'LOW') {
    requirements.push(faker.helpers.arrayElement([
      'Ambiente calmo e tranquilo',
      'Ideal para pessoas mais calmas',
      'Pode ficar sozinho durante o dia',
    ]))
  }

  requirements.push(faker.helpers.arrayElement([
    'Precisa de acompanhamento veterinário regular',
    'Necessita de adestramento básico',
    'Telas nas janelas obrigatório',
    'Pode conviver com outros animais',
  ]))

  return requirements
}

function generatePetAbout(
  name: string,
  age: (typeof AGES)[number],
  energyLevel: (typeof ENERGY_LEVELS)[number],
): string {
  const personality = faker.helpers.arrayElement([
    'muito brincalhão e carinhoso',
    'muito dócil e tranquilo',
    'muito leal e protetor',
    'independente e curioso',
    'alegre e cheio de energia',
    'calmo e amoroso',
  ])

  const hobby = faker.helpers.arrayElement([
    'Adora correr no parque',
    'Adora ficar no colo',
    'Gosta de explorar novos lugares',
    'Adora brincar com bolas',
    'Gosta de fazer novas amizades',
    'Adora momentos de carinho',
  ])

  let ageDescription = ''
  if (age === 'PUPPY') {
    ageDescription = 'Ainda é filhote e tem muito para aprender.'
  } else if (age === 'SENIOR') {
    ageDescription = 'Já passou da fase agitada e agora só quer um cantinho confortável.'
  }

  let energyDescription = ''
  if (energyLevel === 'HIGH') {
    energyDescription = 'É muito sociável e ótimo com crianças.'
  } else if (energyLevel === 'LOW') {
    energyDescription = 'Perfeito para quem busca companhia tranquila.'
  }

  return `${name} é ${personality}. ${hobby}. ${ageDescription} ${energyDescription}`.trim()
}

async function main() {
  console.log('Seeding database...')

  const passwordHash = await hash('123456', 6)

  const organizations = []
  const numOrganizations = 3

  for (let i = 0; i < numOrganizations; i++) {
    const state = faker.helpers.arrayElement(STATES)
    const city = faker.location.city()

    const orgId = faker.string.uuid()
    const orgEmail = faker.internet.email().toLowerCase()

    const org = await prisma.organization.upsert({
      where: { email: orgEmail },
      update: {},
      create: {
        id: orgId,
        ownerName: faker.person.fullName(),
        email: orgEmail,
        cep: generateCep(),
        address: `${faker.location.street()}, ${faker.number.int({ min: 1, max: 2000 })}`,
        city,
        state,
        whatsapp: generateWhatsapp(),
        passwordHash,
      },
    })

    organizations.push({ org, city })
  }

  let petCount = 0
  const petsPerOrg = 3

  for (const { org, city } of organizations) {
    for (let j = 0; j < petsPerOrg; j++) {
      petCount++
      const name = faker.person.firstName()
      const age = faker.helpers.arrayElement(AGES)
      const size = faker.helpers.arrayElement(SIZES)
      const energyLevel = faker.helpers.arrayElement(ENERGY_LEVELS)
      const independenceLevel = faker.helpers.arrayElement(INDEPENDENCE_LEVELS)
      const environment = faker.helpers.arrayElement(ENVIRONMENTS)

      const petId = faker.string.uuid()

      await prisma.pet.upsert({
        where: { id: petId },
        update: {},
        create: {
          id: petId,
          organizationId: org.id,
          name,
          about: generatePetAbout(name, age, energyLevel),
          age,
          size,
          energyLevel,
          independenceLevel,
          environment,
          photos: {
            create: [
              {
                url: faker.helpers.arrayElement(PET_IMAGES),
              },
            ],
          },
          adoptionRequirements: generateAdoptionRequirements(
            size,
            energyLevel,
            environment,
          ),
          city,
        },
      })
    }
  }

  console.log('Seeding completed!')
  console.log(`Created ${numOrganizations} organizations and ${petCount} pets`)
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
