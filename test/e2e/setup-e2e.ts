import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const schemaId = randomUUID().substring(0, 8)
const schemaName = `test_${schemaId}`

function generateDatabaseURL(schema: string): string {
  const baseUrl = process.env.DATABASE_URL

  if (!baseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const url = new URL(baseUrl)
  url.searchParams.set('schema', schema)

  return url.toString()
}

const databaseURL = generateDatabaseURL(schemaName)

// Override DATABASE_URL for this test run
process.env.DATABASE_URL = databaseURL
process.env.NODE_ENV = 'test'

const pool = new pg.Pool({ connectionString: databaseURL })
const adapter = new PrismaPg(pool)

export const prisma = new PrismaClient({
  adapter,
  log: ['error'],
})

beforeAll(async () => {
  // Create the test schema
  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)

  // Push Prisma schema to the test schema
  execSync('npx prisma db push', {
    env: {
      ...process.env,
      DATABASE_URL: databaseURL,
    },
  })
})

afterAll(async () => {
  // Drop the test schema
  await prisma.$executeRawUnsafe(
    `DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`,
  )
  await prisma.$disconnect()
  await pool.end()
})
