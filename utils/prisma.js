// Shared Prisma instance to avoid multiple connections
const { PrismaClient } = require('@prisma/client');

let prisma;

// Singleton pattern for Prisma Client
function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['error'], // Only log errors, not queries
      errorFormat: 'minimal'
    });
  }
  return prisma;
}

module.exports = { getPrismaClient };
