// Test Health Check Endpoint
async function testHealthCheck() {
    try {
        console.log('🏥 Testing health check endpoint...');
        
        const response = await fetch('http://localhost:5000/health');
        const data = await response.json();
        
        console.log('✅ Health Check Response:');
        console.log(JSON.stringify(data, null, 2));
        
        if (data.status === 'healthy') {
            console.log('🎉 Server is healthy and ready!');
        }
    } catch (error) {
        console.error('❌ Health check failed:', error.message);
    }
}

testHealthCheck();
