// Test Your Exact Frontend Pattern
async function testFrontendPattern() {
    console.log('🧪 Testing your exact frontend fetch pattern...');
    
    // Simulate your frontend environment
    const VITE_API_URL = 'http://localhost:5000';
    
    // Test 1: Health Check
    try {
        const response = await fetch(`${VITE_API_URL}/health`, {
            method: 'GET',
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Health Check Success:', data.status);
        }
    } catch (err) {
        console.log('❌ Health Check Failed:', err.message);
    }
    
    // Test 2: Your Exact Register Pattern
    try {
        const formData = {
            email: `test${Date.now()}@example.com`,
            password: 'TestPass123!',
            firstName: 'Test',
            lastName: 'User',
            country: 'TestCountry'
        };
        
        console.log('🔄 Testing register with your exact pattern...');
        const response = await fetch(`${VITE_API_URL}/api/auth/register`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Register Success:', data.message);
        } else {
            const data = await response.json();
            console.log('⚠️ Register Response:', response.status, data.error || 'Unknown error');
        }
        
    } catch (err) {
        if (err.message.includes('ERR_CONNECTION_REFUSED')) {
            console.log('❌ CONNECTION REFUSED - Server is down/sleeping');
        } else {
            console.log('❌ Network Error:', err.message);
        }
    }
    
    console.log('🏁 Test complete');
}

testFrontendPattern();
