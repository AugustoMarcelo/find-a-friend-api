import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { execSync } from 'node:child_process'
import { writeFileSync, unlinkSync } from 'node:fs'
import { join } from 'node:path'
import pg from 'pg'

const SCHEMA_FILE = join(process.cwd(), '.test-schema')

export default async function globalSetup() {
  const schemaId = randomUUID().substring(0, 8)
  const schemaName = `test_${schemaId}`

  const baseUrl = process.env.DATABASE_URL
  if (!baseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  const url = new URL(baseUrl)
  url.searchParams.set('schema', schemaName)
  const databaseURL = url.toString()

  // Write schema info to file for test processes to read
  writeFileSync(SCHEMA_FILE, JSON.stringify({ schemaName, databaseURL }))

  // Create admin pool without schema
  const adminPool = new pg.Pool({
    connectionString: baseUrl.split('?')[0],
  })

  // Create the test schema
  await adminPool.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`)
  await adminPool.end()

  // Push Prisma schema to the test schema
  execSync('npx prisma db push', {
    env: {
      ...process.env,
      DATABASE_URL: databaseURL,
    },
    stdio: 'inherit',
  })

  // Return teardown function
  return async () => {
    const cleanupPool = new pg.Pool({
      connectionString: baseUrl.split('?')[0],
    })
    await cleanupPool.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`)
    await cleanupPool.end()

    // Clean up schema file
    try {
      unlinkSync(SCHEMA_FILE)
    } catch {
      // Ignore if file doesn't exist
    }
  }
}
