import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AddressModel from './models/address.model.js';
import UserModel from './models/users.model.js';
import connectDB from './config/connectdb.js';

dotenv.config();

async function testAddressEndpoint() {
    try {
        console.log('🧪 Testing Address Creation Directly...\n');

        // Connect to database
        await connectDB();
        console.log('✅ Connected to database');

        // Check if we can find a user
        const existingUser = await UserModel.findOne({}).select('_id name email');
        
        if (!existingUser) {
            console.log('❌ No users found in database');
            return;
        }

        console.log('✅ Found user:', existingUser.name, '-', existingUser.email);

        // Test address data
        const addressData = {
            address_line: '123 Test Street, Test Area',
            city: 'Mumbai',
            state: 'Maharashtra', 
            pincode: '400001',
            country: 'India',
            mobile: 9876543210,
            userId: existingUser._id,
            addIframe: ''
        };

        console.log('\n📦 Testing address creation with data:', addressData);

        // Try to create address directly in database
        const newAddress = new AddressModel(addressData);
        const savedAddress = await newAddress.save();
        
        console.log('✅ Address created successfully in database!');
        console.log('📄 Address ID:', savedAddress._id);

        // Test updating user with address
        const updatedUser = await UserModel.findByIdAndUpdate(existingUser._id, {
            $push: { 
                address_details: savedAddress._id 
            }
        }, { new: true });

        if (updatedUser) {
            console.log('✅ User updated with address reference');
        } else {
            console.log('❌ Failed to update user with address reference');
        }

        // Verify the address can be retrieved
        const retrievedAddress = await AddressModel.findById(savedAddress._id);
        if (retrievedAddress) {
            console.log('✅ Address can be retrieved successfully');
            console.log('📄 Retrieved address:', {
                _id: retrievedAddress._id,
                address_line: retrievedAddress.address_line,
                city: retrievedAddress.city,
                state: retrievedAddress.state,
                country: retrievedAddress.country
            });
        } else {
            console.log('❌ Failed to retrieve address');
        }

        // Clean up - delete the test address
        await AddressModel.findByIdAndDelete(savedAddress._id);
        await UserModel.findByIdAndUpdate(existingUser._id, {
            $pull: { 
                address_details: savedAddress._id 
            }
        });
        console.log('🧹 Cleaned up test address');

        console.log('\n✅ Address endpoint database operations are working correctly!');

    } catch (error) {
        console.log('❌ Error occurred:');
        console.log('Message:', error.message);
        console.log('Stack:', error.stack);
        
        if (error.errors) {
            console.log('Validation errors:', error.errors);
        }
    } finally {
        process.exit(0);
    }
}

// Run the test
testAddressEndpoint();
