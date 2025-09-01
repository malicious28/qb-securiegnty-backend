// CORS Troubleshooting Guide
// Use this to test your CORS setup

console.log('=== CORS TROUBLESHOOTING GUIDE ===\n');

// 1. Check your environment variables
console.log('1. Environment Configuration:');
console.log('   FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('   PORT:', process.env.PORT);
console.log('   NODE_ENV:', process.env.NODE_ENV);

// 2. Test CORS from browser console
console.log('\n2. Test from Browser Console:');
console.log('   Open your frontend website and run this in console:');
console.log('   ```javascript');
console.log('   fetch("https://your-backend-domain.onrender.com/", {');
console.log('     method: "GET",');
console.log('     credentials: "include"');
console.log('   })');
console.log('   .then(r => r.json())');
console.log('   .then(data => console.log("SUCCESS:", data))');
console.log('   .catch(err => console.error("CORS ERROR:", err));');
console.log('   ```');

// 3. Common CORS issues and solutions
console.log('\n3. Common CORS Issues:');
console.log('   ❌ Issue: "Access to fetch blocked by CORS policy"');
console.log('   ✅ Solution: Make sure FRONTEND_URL in .env matches your deployed frontend');
console.log('');
console.log('   ❌ Issue: "Credentials include but Access-Control-Allow-Credentials not true"');
console.log('   ✅ Solution: Use credentials: "include" in fetch AND credentials: true in CORS');
console.log('');
console.log('   ❌ Issue: "Preflight request doesn\'t pass"');
console.log('   ✅ Solution: Make sure OPTIONS method is allowed (already fixed)');

// 4. Environment setup for different deployments
console.log('\n4. Environment Variables for Each Platform:');
console.log('   Render:');
console.log('   - FRONTEND_URL=https://your-app.netlify.app');
console.log('   - NODE_ENV=production');
console.log('');
console.log('   Railway (if switching back):');
console.log('   - FRONTEND_URL=https://your-app.netlify.app');
console.log('   - NODE_ENV=production');

// 5. Frontend fetch configuration
console.log('\n5. Frontend Fetch Configuration:');
console.log('   Always use this pattern in your frontend:');
console.log('   ```javascript');
console.log('   const API_BASE = "https://your-backend.onrender.com";');
console.log('   ');
console.log('   fetch(`${API_BASE}/api/auth/login`, {');
console.log('     method: "POST",');
console.log('     headers: {');
console.log('       "Content-Type": "application/json",');
console.log('     },');
console.log('     credentials: "include",');
console.log('     body: JSON.stringify({ email, password })');
console.log('   })');
console.log('   ```');

console.log('\n=== END TROUBLESHOOTING GUIDE ===');
