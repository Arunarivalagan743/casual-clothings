import mongoose from "mongoose";

const bulkOrderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    buyerType: {
        type: String,
        enum: ['Shop', 'Solo', 'Wholesale'],
        required: true
    },
    products: [{
        product: {
            type: mongoose.Schema.ObjectId,
            ref: 'product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        size: {
            type: String,
            required: false // Optional as bulk orders might not specify sizes initially
        }
    }],
    address: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['Requested', 'Approved', 'Rejected'],
        default: 'Requested'
    },
    adminNotes: {
        type: String,
        default: '',
        trim: true
    },
    rejectionReason: {
        type: String,
        default: '',
        trim: true
    },
    totalQuantity: {
        type: Number,
        default: 0
    },
    approvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Pre-save middleware to calculate total quantity
bulkOrderSchema.pre('save', function(next) {
    if (this.products && this.products.length > 0) {
        this.totalQuantity = this.products.reduce((total, item) => total + item.quantity, 0);
    }
    next();
});

// Index for better query performance
bulkOrderSchema.index({ user: 1, status: 1 });
bulkOrderSchema.index({ status: 1, submittedAt: -1 });

const BulkOrder = mongoose.model('bulkOrder', bulkOrderSchema);
export default BulkOrder;
