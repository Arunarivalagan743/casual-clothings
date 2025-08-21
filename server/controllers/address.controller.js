import AddressModel from "../models/address.model.js";
import UserModel from "../models/users.model.js";

export const addAddressController = async (req, res) => {
    try {
        const userId = req.userId; // Assuming user ID is stored in req.user
        
        console.log('=== ADD ADDRESS DEBUG START ===');
        console.log('User ID:', userId);
        console.log('Request body:', req.body);
        
        // Validate request body
        const { address_line, city, state, pincode, country, mobile, addIframe } = req.body;

        // Basic validation
        if (!address_line || !city || !state || !pincode || !country) {
            console.log('Validation failed: Missing required fields');
            return res.status(400).json({ 
                message: "Missing required fields: address_line, city, state, pincode, country", 
                error: true,
                success: false 
            });
        }

        if (!userId) {
            console.log('Validation failed: No user ID');
            return res.status(401).json({ 
                message: "User not authenticated", 
                error: true,
                success: false 
            });
        }
        
        // Create a new address
        const addressData = {
            address_line,
            city,
            state,
            pincode,
            country,
            mobile: mobile || null,
            userId: userId, // Associate the address with the user
            addIframe: addIframe || "",  
        };
        
        console.log('Address data to save:', addressData);
        
        const newAddress = new AddressModel(addressData);
        const savedAddress = await newAddress.save();
        
        console.log('Address saved successfully:', savedAddress._id);
        
        const addAddressId = await UserModel.findByIdAndUpdate(userId,{
            $push: { 
                address_details: savedAddress._id 
            }
        });
        
        console.log('User updated with address ID:', addAddressId ? 'Success' : 'Failed');
        console.log('=== ADD ADDRESS DEBUG END ===');

        return res.status(201).json({
            message: "Address added successfully",
            success: true,
            address: savedAddress,
            data: savedAddress,
        });

    } catch (error) {
        console.log('=== ADD ADDRESS ERROR START ===');
        console.log('Error message:', error.message);
        console.log('Error stack:', error.stack);
        console.log('Error details:', error);
        console.log('=== ADD ADDRESS ERROR END ===');
        
        res.status(500).json({ 
            message: "Error adding address", 
            error: true,
            success: false,
            details: error.message 
        });
    }
};

export const getAddressController = async (req, res) => {
    try {
        const userId = req.userId; // Assuming user ID is stored in req.user
        // Fetch all addresses for the user
        const addresses = await AddressModel.find({ userId: userId }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Addresses fetched successfully",
            success: true,
            addresses: addresses,
            data: addresses,
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching addresses", error:true,success:false });
    }
};

export const editAddressController = async (req, res) => {
    try {
        const userId = req.userId; // Assuming user ID is stored in req.user
        const { _id, address_line, city, state, pincode, country, mobile } = req.body;

        // Find the address by ID and update it
        const updatedAddress = await AddressModel.updateOne(
            { _id , userId: userId },
            { address_line, city, state, pincode, country, mobile }, 
        );

        return res.status(200).json({
            message: "Address updated successfully",
            success: true,
            error: false,
            data: updatedAddress,
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating address", error:true,success:false });
    }
}


export const deleteAddressController = async (req, res) => {
    try {
        const userId = req.userId; // Assuming user ID is stored in req.user
        const { _id } = req.body;

        // Find the address by ID and delete it
        const disabledAddress = await AddressModel.updateOne({ _id: _id, userId: userId },{
            status : false
        });

        return res.status(200).json({
            message: "Address deleted successfully",
            error: false,
            success: true,
            data: disabledAddress,
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting address", error:true,success:false });
    }
};

