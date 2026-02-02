import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Read schema info from file written by global-setup
const SCHEMA_FILE = join(process.cwd(), '.test-schema')
const { schemaName, databaseURL } = JSON.parse(
  readFileSync(SCHEMA_FILE, 'utf-8'),
)

// Set environment variables BEFORE any other imports
process.env.DATABASE_URL = databaseURL
process.env.TEST_SCHEMA = schemaName
process.env.NODE_ENV = 'test'

// Now dynamically import prisma after env is set
const { prisma } = await import('@/infra/database/prisma/prisma-client')

export { prisma, schemaName }

afterAll(async () => {
  try {
    await (prisma as { $disconnect: () => Promise<void> }).$disconnect()
  } catch {
    // Ignore disconnect errors
  }
}, 60000)
