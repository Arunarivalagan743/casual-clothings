import { Router } from 'express';
import auth from '../middleware/auth.js';
import { admin } from '../middleware/Admin.js';
import {
    createBulkOrder,
    getUserBulkOrders,
    getBulkOrderDetails,
    getAllBulkOrders,
    updateBulkOrderStatus,
    deleteBulkOrder,
    getBulkOrderAnalytics
} from '../controllers/bulkOrder.controller.js';

const bulkOrderRouter = Router();

// User routes
bulkOrderRouter.post('/create', auth, createBulkOrder);
bulkOrderRouter.get('/my-orders', auth, getUserBulkOrders);
bulkOrderRouter.get('/details/:orderId', auth, getBulkOrderDetails);

// Admin routes
bulkOrderRouter.get('/admin/all', auth, admin, getAllBulkOrders);
bulkOrderRouter.put('/admin/update-status/:orderId', auth, admin, updateBulkOrderStatus);
bulkOrderRouter.delete('/admin/delete/:orderId', auth, admin, deleteBulkOrder);
bulkOrderRouter.get('/admin/analytics', auth, admin, getBulkOrderAnalytics);

export default bulkOrderRouter;
