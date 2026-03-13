// test-modal.js - Quick test for the modal functionality
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001/api';

async function testModalWithData() {
  console.log('🧪 Testing Modal with Sample Data...\n');

  // Test complaint data with all fields
  const testComplaintData = {
    complaintData: {
      customer_name: 'John Smith',
      phone_number: '+1-555-123-4567',
      complaint_id: 'TEST-MODAL-001',
      issue_summary: 'This is a comprehensive test complaint to verify that the modal displays all information beautifully. It includes multiple lines of text to test the formatting and presentation of longer content in the modal interface.',
      fraud_message: '[OCR EXTRACTED FROM: test-screenshot.jpg]\n\nThis is a sample fraud message extracted from an image using OCR technology. It contains multiple lines and formatting to test how the modal displays OCR extracted content.',
      screenshot_url: 'https://example.com/test-screenshot.jpg'
    }
  };

  try {
    console.log('Sending test complaint data...');
    const response = await fetch(`${BASE_URL}/dispatch-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testComplaintData)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Test complaint created successfully!');
      console.log('📋 Database ID:', result.dbId);
      console.log('\n🎯 Now you can:');
      console.log('1. Login to admin dashboard: http://localhost:5174/?admin=true');
      console.log('2. Use password: Yaser@123');
      console.log('3. Click "👁️ View" button to see the beautiful modal!');
    } else {
      console.log('❌ Failed to create test complaint:', result.error);
      if (result.details) {
        console.log('Validation errors:', result.details);
      }
    }
  } catch (error) {
    console.log('❌ Error creating test data:', error.message);
  }
}

testModalWithData();
