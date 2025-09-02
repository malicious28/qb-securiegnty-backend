// Backend Health Check Tool
require('dotenv').config();

console.log('🔍 Backend Diagnostic Tool');
console.log('========================');

// Test 1: Environment Variables
console.log('\n1. Environment Check:');
console.log('   PORT:', process.env.PORT || '5000 (default)');
console.log('   FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('   DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('   JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');

// Test 2: Try to import main modules
console.log('\n2. Module Import Test:');
try {
  const app = require('./index');
  console.log('   ✅ index.js imported successfully');
} catch (err) {
  console.log('   ❌ index.js import failed:', err.message);
}

// Test 3: Test Prisma connection
console.log('\n3. Database Connection Test:');
async function testDatabase() {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    console.log('   📡 Testing database connection...');
    await prisma.$connect();
    console.log('   ✅ Database connected successfully');
    await prisma.$disconnect();
  } catch (err) {
    console.log('   ❌ Database connection failed:', err.message);
  }
}

// Test 4: Check port availability
const net = require('net');
function testPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(true));
      server.close();
    });
    server.on('error', () => resolve(false));
  });
}

async function runDiagnostics() {
  await testDatabase();
  
  console.log('\n4. Port Availability Test:');
  const portAvailable = await testPort(5000);
  console.log('   Port 5000:', portAvailable ? '✅ Available' : '❌ In use');
  
  console.log('\n========================');
  console.log('🏁 Diagnostic Complete');
}

runDiagnostics().catch(err => {
  console.error('❌ Diagnostic failed:', err);
});
