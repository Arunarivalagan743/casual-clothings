import BulkOrder from '../models/bulkOrder.model.js';
import Product from '../models/product.model.js';
import User from '../models/users.model.js';
import sendEmail from '../config/sendEmail.js';

// Create a new bulk order request
export const createBulkOrder = async (req, res) => {
    try {
        const { name, phone, email, buyerType, products, address } = req.body;
        const userId = req.userId;

        // Validate required fields
        if (!name || !phone || !email || !buyerType || !products || !address) {
            return res.status(400).json({
                message: "All fields are required",
                error: true,
                success: false
            });
        }

        // Validate products array
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                message: "At least one product must be selected",
                error: true,
                success: false
            });
        }

        // Validate each product
        for (const item of products) {
            if (!item.product || !item.quantity || item.quantity < 1) {
                return res.status(400).json({
                    message: "Each product must have valid product ID and quantity",
                    error: true,
                    success: false
                });
            }

            // Check if product exists
            const productExists = await Product.findById(item.product);
            if (!productExists) {
                return res.status(400).json({
                    message: `Product with ID ${item.product} not found`,
                    error: true,
                    success: false
                });
            }
        }

        // Create bulk order
        const bulkOrder = new BulkOrder({
            user: userId,
            name,
            phone,
            email,
            buyerType,
            products,
            address,
            status: 'Requested'
        });

        const savedOrder = await bulkOrder.save();

        // Populate product details for response
        await savedOrder.populate('products.product', 'name image price');

        res.status(201).json({
            message: "Bulk order request submitted successfully. Our team will contact you soon.",
            data: savedOrder,
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error creating bulk order:', error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Get user's bulk orders
export const getUserBulkOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log('Getting bulk orders for user:', userId);

        const bulkOrders = await BulkOrder.find({ user: userId })
            .populate('products.product', 'name image price category')
            .populate('approvedBy', 'name email')
            .sort({ submittedAt: -1 })
            .skip(skip)
            .limit(limit);

        console.log('Found bulk orders:', bulkOrders.length);

        const total = await BulkOrder.countDocuments({ user: userId });

        res.status(200).json({
            message: "Bulk orders retrieved successfully",
            data: {
                orders: bulkOrders,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error getting user bulk orders:', error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Get single bulk order details
export const getBulkOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.userId;

        const bulkOrder = await BulkOrder.findOne({ _id: orderId, user: userId })
            .populate('products.product', 'name image price category description')
            .populate('user', 'name email')
            .populate('approvedBy', 'name email');

        if (!bulkOrder) {
            return res.status(404).json({
                message: "Bulk order not found",
                error: true,
                success: false
            });
        }

        res.status(200).json({
            message: "Bulk order details retrieved successfully",
            data: bulkOrder,
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error getting bulk order details:', error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Admin: Get all bulk orders
export const getAllBulkOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status;
        const skip = (page - 1) * limit;

        // Build filter
        const filter = {};
        if (status && ['Requested', 'Approved', 'Rejected'].includes(status)) {
            filter.status = status;
        }

        const bulkOrders = await BulkOrder.find(filter)
            .populate('user', 'name email mobile')
            .populate('products.product', 'name image price category')
            .populate('approvedBy', 'name email')
            .sort({ submittedAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await BulkOrder.countDocuments(filter);

        // Get status counts for dashboard
        const statusCounts = await BulkOrder.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const counts = {
            Requested: 0,
            Approved: 0,
            Rejected: 0
        };

        statusCounts.forEach(item => {
            counts[item._id] = item.count;
        });

        res.status(200).json({
            message: "Bulk orders retrieved successfully",
            data: {
                orders: bulkOrders,
                statusCounts: counts,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error getting all bulk orders:', error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Admin: Update bulk order status
export const updateBulkOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status, adminNotes, rejectionReason } = req.body;
        const adminId = req.userId;

        // Validate status
        if (!['Requested', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({
                message: "Invalid status. Must be 'Requested', 'Approved', or 'Rejected'",
                error: true,
                success: false
            });
        }

        const updateData = { status };

        // Add admin notes if provided
        if (adminNotes) {
            updateData.adminNotes = adminNotes;
        }

        // Add rejection reason if status is rejected
        if (status === 'Rejected' && rejectionReason) {
            updateData.rejectionReason = rejectionReason;
        }

        // Add approval details if status is approved
        if (status === 'Approved') {
            updateData.approvedBy = adminId;
            updateData.approvedAt = new Date();
        }

        const bulkOrder = await BulkOrder.findByIdAndUpdate(
            orderId,
            updateData,
            { new: true }
        ).populate('user', 'name email')
         .populate('products.product', 'name image price');

        if (!bulkOrder) {
            return res.status(404).json({
                message: "Bulk order not found",
                error: true,
                success: false
            });
        }

        // Send notification email to user
        try {
            const emailSubject = `Bulk Order ${status} - ${bulkOrder._id}`;
            let emailBody = `
                <h2>Bulk Order Update</h2>
                <p>Hello ${bulkOrder.name},</p>
                <p>Your bulk order request has been <strong>${status.toLowerCase()}</strong>.</p>
                <p><strong>Order ID:</strong> ${bulkOrder._id}</p>
                <p><strong>Status:</strong> ${status}</p>
            `;

            if (status === 'Approved') {
                emailBody += `
                    <p>Great news! Your bulk order has been approved. Our team will contact you soon to discuss the details and next steps.</p>
                    ${adminNotes ? `<p><strong>Notes:</strong> ${adminNotes}</p>` : ''}
                `;
            } else if (status === 'Rejected') {
                emailBody += `
                    <p>We regret to inform you that your bulk order request has been declined.</p>
                    ${rejectionReason ? `<p><strong>Reason:</strong> ${rejectionReason}</p>` : ''}
                `;
            }

            emailBody += `
                <p>Thank you for your interest in our products.</p>
                <p>Best regards,<br>Casual Clothings Team</p>
            `;

            await sendEmail({
                sendTo: bulkOrder.email,
                subject: emailSubject,
                html: emailBody
            });
        } catch (emailError) {
            console.error('Error sending notification email:', emailError);
            // Continue execution even if email fails
        }

        res.status(200).json({
            message: `Bulk order ${status.toLowerCase()} successfully`,
            data: bulkOrder,
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error updating bulk order status:', error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Admin: Delete bulk order
export const deleteBulkOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const bulkOrder = await BulkOrder.findByIdAndDelete(orderId);

        if (!bulkOrder) {
            return res.status(404).json({
                message: "Bulk order not found",
                error: true,
                success: false
            });
        }

        res.status(200).json({
            message: "Bulk order deleted successfully",
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error deleting bulk order:', error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};

// Get bulk order analytics for admin dashboard
export const getBulkOrderAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        // Status counts
        const statusCounts = await BulkOrder.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Recent orders (last 30 days)
        const recentOrders = await BulkOrder.countDocuments({
            submittedAt: { $gte: thirtyDaysAgo }
        });

        // Total quantity requested
        const totalQuantity = await BulkOrder.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalQuantity' }
                }
            }
        ]);

        // Popular buyer types
        const buyerTypes = await BulkOrder.aggregate([
            {
                $group: {
                    _id: '$buyerType',
                    count: { $sum: 1 }
                }
            }
        ]);

        const counts = {
            Requested: 0,
            Approved: 0,
            Rejected: 0
        };

        statusCounts.forEach(item => {
            counts[item._id] = item.count;
        });

        res.status(200).json({
            message: "Analytics retrieved successfully",
            data: {
                statusCounts: counts,
                recentOrders,
                totalQuantity: totalQuantity[0]?.total || 0,
                buyerTypes,
                totalOrders: Object.values(counts).reduce((a, b) => a + b, 0)
            },
            error: false,
            success: true
        });

    } catch (error) {
        console.error('Error getting bulk order analytics:', error);
        res.status(500).json({
            message: error.message || "Internal server error",
            error: true,
            success: false
        });
    }
};
