import { prisma } from '../setup-e2e'

export async function resetDatabase() {
  await prisma.$executeRaw`TRUNCATE TABLE photos, pets, organizations CASCADE`
}
