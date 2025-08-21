import axios from 'axios';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const BASE_URL = 'http://localhost:8080';

async function testAddressAPI() {
    try {
        console.log('🧪 Testing Address API Endpoint...\n');

        // Create a test JWT token for existing user
        const testUserId = '6850f9eb925b7c9f5f767a7b'; // Existing user ID from database
        const accessTokenSecret = process.env.SECRET_KEY_ACCESS_TOKEN;
        
        if (!accessTokenSecret) {
            console.log('❌ ACCESS_TOKEN_SECRET not found in environment');
            return;
        }

        // Create a valid JWT token
        const token = jwt.sign(
            { id: testUserId }, 
            accessTokenSecret, 
            { expiresIn: '1h' }
        );

        console.log('✅ Created test JWT token');

        // Test address data
        const addressData = {
            address_line: 'API Test Street, Test Area',
            city: 'Chennai',
            state: 'Tamil Nadu', 
            pincode: '600001',
            country: 'India',
            mobile: 9876543210,
            addIframe: ''
        };

        console.log('📦 Testing API with address data:', addressData);

        // Test the address creation API
        const response = await axios.post(`${BASE_URL}/api/address/create`, addressData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            console.log('✅ Address API works correctly!');
            console.log('📄 API Response:', {
                message: response.data.message,
                success: response.data.success,
                addressId: response.data.address._id
            });

            // Test getting the address
            const getResponse = await axios.get(`${BASE_URL}/api/address/get`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (getResponse.data.success) {
                console.log('✅ Address retrieval API works correctly!');
                console.log('📄 Retrieved addresses count:', getResponse.data.addresses.length);
            } else {
                console.log('❌ Address retrieval failed:', getResponse.data.message);
            }

        } else {
            console.log('❌ Address creation failed:', response.data.message);
        }

    } catch (error) {
        console.log('❌ API Error occurred:');
        console.log('Message:', error.message);
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Response Data:', error.response.data);
        }
    }
}

// Run the test
testAddressAPI();
