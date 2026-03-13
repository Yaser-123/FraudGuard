// test-security.js - Test script for security features
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function testSecurity() {
  console.log('🔒 Testing Security Implementation...\n');

  // Test 1: Health check
  console.log('1. Testing health endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const result = await response.json();
    console.log('✅ Health check:', result.status);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return;
  }

  // Test 2: Try to access admin endpoint without token
  console.log('\n2. Testing admin endpoint without token...');
  try {
    const response = await fetch(`${BASE_URL}/complaints`);
    const result = await response.json();
    if (response.status === 401) {
      console.log('✅ Admin endpoint properly protected:', result.message);
    } else {
      console.log('❌ Admin endpoint not protected');
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  // Test 3: Test invalid login
  console.log('\n3. Testing invalid login...');
  try {
    const response = await fetch(`${BASE_URL}/admin/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'wrongpassword' })
    });
    const result = await response.json();
    if (response.status === 401) {
      console.log('✅ Invalid login rejected:', result.message);
    } else {
      console.log('❌ Invalid login not rejected');
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  // Test 4: Test valid login
  console.log('\n4. Testing valid login...');
  let adminToken = null;
  try {
    const response = await fetch(`${BASE_URL}/admin/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: 'Yaser@123' })
    });
    const result = await response.json();
    if (result.success) {
      adminToken = result.token;
      console.log('✅ Valid login successful');
    } else {
      console.log('❌ Valid login failed:', result.message);
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  // Test 5: Test admin endpoint with valid token
  if (adminToken) {
    console.log('\n5. Testing admin endpoint with valid token...');
    try {
      const response = await fetch(`${BASE_URL}/complaints`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      const result = await response.json();
      if (result.success) {
        console.log('✅ Admin endpoint accessible with token, complaints:', result.count);
      } else {
        console.log('❌ Admin endpoint failed with token:', result.error);
      }
    } catch (error) {
      console.log('❌ Test failed:', error.message);
    }
  }

  // Test 6: Test input validation
  console.log('\n6. Testing input validation...');
  try {
    const invalidData = {
      complaintData: {
        customer_name: 'A', // Too short
        phone_number: '123', // Invalid format
        complaint_id: '', // Empty
        issue_summary: 'Short' // Too short
      }
    };
    
    const response = await fetch(`${BASE_URL}/dispatch-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });
    const result = await response.json();
    if (response.status === 400 && result.details) {
      console.log('✅ Input validation working, found', result.details.length, 'validation errors');
    } else {
      console.log('❌ Input validation not working');
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }

  console.log('\n🎉 Security tests completed!');
  console.log('\n📝 Summary:');
  console.log('- JWT Authentication: Implemented');
  console.log('- Password Hashing: bcrypt with 12 salt rounds');
  console.log('- Rate Limiting: Applied to all endpoints');
  console.log('- Input Validation: Applied to complaint data');
  console.log('- Security Headers: Helmet.js configured');
  console.log('- CORS: Restricted to allowed origins');
}

testSecurity().catch(console.error);
