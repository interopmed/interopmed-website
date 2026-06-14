import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

type PrismaClientInstance = InstanceType<typeof PrismaClient>
type PrismaClientOptions = ConstructorParameters<typeof PrismaClient>[0]

const globalForPrisma = global as unknown as { prisma?: PrismaClientInstance }

function normalizePostgresSslMode(connectionString: string) {
  return connectionString.replace(
    /([?&]sslmode=)(prefer|require|verify-ca)(?=&|$)/i,
    '$1verify-full'
  )
}

const connectionString = normalizePostgresSslMode(process.env.DATABASE_URL || '')

const prismaClientOptions: PrismaClientOptions = {
  adapter: new PrismaPg({ connectionString }),
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
}

function hasCurrentPrismaDelegates(client: PrismaClientInstance | undefined) {
  return Boolean(client && 'userPost' in client && 'userPostComment' in client && 'interopMindThread' in client && 'interopMindMessage' in client)
}

const existingPrisma = globalForPrisma.prisma

export const prisma: PrismaClientInstance = hasCurrentPrismaDelegates(existingPrisma)
  ? existingPrisma as PrismaClientInstance
  : new PrismaClient(prismaClientOptions)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
