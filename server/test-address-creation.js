import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:8080';

async function testAddressCreation() {
    try {
        console.log('🧪 Testing Address Creation...\n');

        // First, let's try to login to get a token
        console.log('Step 1: Attempting to login...');
        const loginResponse = await axios.post(`${BASE_URL}/api/user/login`, {
            email: 'gowthamvetriii@gmail.com', // Use existing user email
            password: 'testpassword123' // You may need to update this with the actual password
        });

        if (!loginResponse.data.success) {
            console.log('❌ Login failed. Creating test user first...');
            
            // Create a test user
            const registerResponse = await axios.post(`${BASE_URL}/api/user/register`, {
                name: 'Test User',
                email: 'test@example.com',
                password: 'testpassword123'
            });
            
            if (!registerResponse.data.success) {
                console.log('❌ User registration failed:', registerResponse.data.message);
                return;
            }
            
            console.log('✅ Test user created successfully');
            
            // Try login again
            const loginResponse2 = await axios.post(`${BASE_URL}/api/user/login`, {
                email: 'test@example.com',
                password: 'testpassword123'
            });
            
            if (!loginResponse2.data.success) {
                console.log('❌ Login failed after registration:', loginResponse2.data.message);
                return;
            }
            
            console.log('✅ Login successful after registration');
        } else {
            console.log('✅ Login successful');
        }

        // Get the token from the login response
        const token = loginResponse.data.token || loginResponse.data.data?.token;
        
        if (!token) {
            console.log('❌ No token received from login');
            return;
        }

        console.log('📝 Token received:', token.substring(0, 20) + '...');

        console.log('\nStep 2: Creating address...');
        
        // Test address data
        const addressData = {
            address_line: '123 Test Street, Test Area',
            city: 'Mumbai',
            state: 'Maharashtra', 
            pincode: '400001',
            country: 'India',
            mobile: 9876543210,
            addIframe: ''
        };

        console.log('📦 Address data:', addressData);

        // Create address with authentication
        const addressResponse = await axios.post(`${BASE_URL}/api/address/create`, addressData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (addressResponse.data.success) {
            console.log('✅ Address created successfully!');
            console.log('📄 Response:', addressResponse.data);
        } else {
            console.log('❌ Address creation failed:', addressResponse.data.message);
            console.log('📄 Full response:', addressResponse.data);
        }

    } catch (error) {
        console.log('❌ Error occurred:');
        console.log('Message:', error.message);
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Status Text:', error.response.statusText);
            console.log('Response Data:', error.response.data);
            console.log('Response Headers:', error.response.headers);
        }
        
        if (error.config) {
            console.log('Request URL:', error.config.url);
            console.log('Request Method:', error.config.method);
            console.log('Request Data:', error.config.data);
        }
    }
}

// Run the test
testAddressCreation();
