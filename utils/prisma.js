// Shared Prisma instance to avoid multiple connections
const { PrismaClient } = require('@prisma/client');

let prisma;

// Singleton pattern for Prisma Client with retry logic for Neon
function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ['error'], // Only log errors, not queries
      errorFormat: 'minimal',
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });

    // Handle connection errors gracefully
    prisma.$on('error', (e) => {
      console.error('🚨 Prisma connection error:', e);
      if (e.message?.includes("Can't reach database server")) {
        console.log('💡 TIP: Neon database may be IDLE. Check your Neon dashboard and wake it up.');
      }
    });
  }
  return prisma;
}

// Helper function to test connection with retry
async function testConnection(retries = 3, delay = 2000) {
  const client = getPrismaClient();
  
  for (let i = 0; i < retries; i++) {
    try {
      await client.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.log(`⚠️ Database connection attempt ${i + 1}/${retries} failed:`, error.message);
      
      if (i < retries - 1) {
        console.log(`🔄 Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 1.5; // Exponential backoff
      }
    }
  }
  
  console.error('❌ Database connection failed after all retries');
  return false;
}

module.exports = { getPrismaClient, testConnection };
