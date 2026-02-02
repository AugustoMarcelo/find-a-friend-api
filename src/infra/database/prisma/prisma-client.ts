import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

let _pool: pg.Pool | null = null
let _prisma: PrismaClient | null = null
let _initialized = false

function initialize() {
  if (_initialized) return

  const databaseUrl = process.env.DATABASE_URL
  const testSchema = process.env.TEST_SCHEMA
  const nodeEnv = process.env.NODE_ENV

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  _pool = new pg.Pool({ connectionString: databaseUrl })

  // Use PrismaPg's schema option for test schema
  const adapterOptions = testSchema ? { schema: testSchema } : undefined
  const adapter = new PrismaPg(_pool, adapterOptions)

  _prisma = new PrismaClient({
    adapter,
    log: nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

  _initialized = true
}

// Create proxy handlers that initialize on first access
const poolHandler: ProxyHandler<pg.Pool> = {
  get(_target, prop, receiver) {
    initialize()
    return Reflect.get(_pool!, prop, receiver)
  },
}

const prismaHandler: ProxyHandler<PrismaClient> = {
  get(_target, prop, receiver) {
    initialize()
    return Reflect.get(_prisma!, prop, receiver)
  },
}

export const pool: pg.Pool = new Proxy({} as pg.Pool, poolHandler)
export const prisma: PrismaClient = new Proxy({} as PrismaClient, prismaHandler)
