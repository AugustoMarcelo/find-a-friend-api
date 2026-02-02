import { prisma, schemaName } from '../setup-e2e'

export async function resetDatabase() {
  // Use explicit schema name since PrismaPg's schema option doesn't affect raw queries
  await (
    prisma as { $executeRawUnsafe: (query: string) => Promise<number> }
  ).$executeRawUnsafe(
    `TRUNCATE TABLE "${schemaName}".photos, "${schemaName}".pets, "${schemaName}".organizations CASCADE`,
  )
}
