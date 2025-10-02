const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check for test@gmail.com
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@gmail.com' }
    });
    
    if (testUser) {
      console.log('❌ test@gmail.com EXISTS in database:', {
        id: testUser.id,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        email: testUser.email,
        createdAt: testUser.createdAt,
        isVerified: testUser.isVerified
      });
    } else {
      console.log('✅ test@gmail.com does NOT exist in database');
    }
    
    // Count total users
    const userCount = await prisma.user.count();
    console.log('📊 Total users in database:', userCount);
    
    // Show last 5 users created
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        isVerified: true
      }
    });
    
    console.log('📋 Last 5 users created:');
    recentUsers.forEach(user => {
      console.log(`  - ${user.email} (ID: ${user.id}, Created: ${user.createdAt})`);
    });
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();