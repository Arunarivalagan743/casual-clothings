import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import SummaryApi, { baseURL } from '../../common/SummaryApi';
import { FaEye, FaCheck, FaTimes, FaTrash, FaFilter, FaDownload, FaBoxOpen, FaClipboardList } from 'react-icons/fa';
import { format } from 'date-fns';

const AdminBulkOrders = () => {
    const [bulkOrders, setBulkOrders] = useState([]);
    const [analytics, setAnalytics] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionType, setActionType] = useState('');
    const [adminNotes, setAdminNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [filter, setFilter] = useState('all');
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    useEffect(() => {
        fetchBulkOrders();
        fetchAnalytics();
    }, [pagination.page, filter]);

    const fetchBulkOrders = async () => {
        setIsLoading(true);
        try {
            let url = `${baseURL}${SummaryApi.getAllBulkOrders.url}?page=${pagination.page}&limit=${pagination.limit}`;
            if (filter !== 'all') {
                url += `&status=${filter}`;
            }

            const response = await axios({
                ...SummaryApi.getAllBulkOrders,
                url,
                withCredentials: true
            });

            if (response.data.success) {
                setBulkOrders(response.data.data.orders);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.data.pagination.total,
                    pages: response.data.data.pagination.pages
                }));
            }
        } catch (error) {
            console.error('Error fetching bulk orders:', error);
            toast.error('Failed to load bulk orders');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const response = await axios({
                ...SummaryApi.getBulkOrderAnalytics,
                url: `${baseURL}${SummaryApi.getBulkOrderAnalytics.url}`,
                withCredentials: true
            });

            if (response.data.success) {
                setAnalytics(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };

    const viewOrderDetails = async (orderId) => {
        try {
            const response = await axios({
                ...SummaryApi.getBulkOrderDetails,
                url: `${baseURL}${SummaryApi.getBulkOrderDetails.url}/${orderId}`,
                withCredentials: true
            });

            if (response.data.success) {
                setSelectedOrder(response.data.data);
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Failed to load order details');
        }
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        setSelectedOrder({ _id: orderId });
        setActionType(newStatus);
        setAdminNotes('');
        setRejectionReason('');
        setShowActionModal(true);
    };

    const confirmStatusUpdate = async () => {
        try {
            const updateData = { 
                status: actionType,
                adminNotes: adminNotes.trim() || undefined,
                rejectionReason: actionType === 'Rejected' ? rejectionReason.trim() : undefined
            };

            const response = await axios({
                ...SummaryApi.updateBulkOrderStatus,
                url: `${baseURL}${SummaryApi.updateBulkOrderStatus.url}/${selectedOrder._id}`,
                data: updateData,
                withCredentials: true
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setShowActionModal(false);
                fetchBulkOrders();
                fetchAnalytics();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDelete = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this bulk order?')) {
            return;
        }

        try {
            const response = await axios({
                ...SummaryApi.deleteBulkOrder,
                url: `${baseURL}${SummaryApi.deleteBulkOrder.url}/${orderId}`,
                withCredentials: true
            });

            if (response.data.success) {
                toast.success('Bulk order deleted successfully');
                fetchBulkOrders();
                fetchAnalytics();
            }
        } catch (error) {
            console.error('Error deleting order:', error);
            toast.error('Failed to delete bulk order');
        }
    };

    const getStatusBadge = (status) => {
        const statusStyles = {
            'Requested': 'bg-yellow-100 text-yellow-800',
            'Approved': 'bg-green-100 text-green-800',
            'Rejected': 'bg-red-100 text-red-800'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
                {status}
            </span>
        );
    };

    const getBuyerTypeBadge = (buyerType) => {
        const typeStyles = {
            'Shop': 'bg-blue-100 text-blue-800',
            'Solo': 'bg-purple-100 text-purple-800',
            'Wholesale': 'bg-orange-100 text-orange-800'
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeStyles[buyerType]}`}>
                {buyerType}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight font-['Playfair_Display'] mb-2 leading-tight">Bulk Order Management</h1>
                <p className="text-sm sm:text-base text-gray-600 font-['Inter']">Manage and process bulk order requests from customers</p>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center">
                        <div className="p-2 sm:p-3 bg-gray-100 rounded-lg flex-shrink-0">
                            <FaClipboardList className="text-black text-lg sm:text-xl" />
                        </div>
                        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                            <h3 className="text-lg sm:text-2xl font-bold text-black font-['Inter'] leading-tight">{analytics.totalOrders || 0}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 font-['Inter'] truncate">Total Orders</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center">
                        <div className="p-2 sm:p-3 bg-yellow-50 rounded-lg border border-yellow-200 flex-shrink-0">
                            <FaFilter className="text-yellow-600 text-lg sm:text-xl" />
                        </div>
                        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                            <h3 className="text-lg sm:text-2xl font-bold text-black font-['Inter'] leading-tight">{analytics.statusCounts?.Requested || 0}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 font-['Inter'] truncate">Pending Review</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center">
                        <div className="p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200 flex-shrink-0">
                            <FaCheck className="text-green-600 text-lg sm:text-xl" />
                        </div>
                        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                            <h3 className="text-lg sm:text-2xl font-bold text-black font-['Inter'] leading-tight">{analytics.statusCounts?.Approved || 0}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 font-['Inter'] truncate">Approved</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex items-center">
                        <div className="p-2 sm:p-3 bg-red-50 rounded-lg border border-red-200 flex-shrink-0">
                            <FaTimes className="text-red-600 text-lg sm:text-xl" />
                        </div>
                        <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                            <h3 className="text-lg sm:text-2xl font-bold text-black font-['Inter'] leading-tight">{analytics.statusCounts?.Rejected || 0}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 font-['Inter'] truncate">Rejected</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center">
                        <FaFilter className="text-gray-400 mr-2" />
                        <span className="text-xs sm:text-sm font-semibold text-black font-['Inter'] whitespace-nowrap">Filter by status:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['all', 'Requested', 'Approved', 'Rejected'].map(status => (
                            <button
                                key={status}
                                onClick={() => {
                                    setFilter(status);
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg font-medium transition-all duration-300 font-['Inter'] whitespace-nowrap ${
                                    filter === status 
                                        ? 'bg-black text-white shadow-md' 
                                        : 'bg-gray-100 text-black hover:bg-gray-200'
                                }`}
                            >
                                {status === 'all' ? 'All' : status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading bulk orders...</p>
                    </div>
                ) : bulkOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <FaFilter className="mx-auto text-4xl" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bulk orders found</h3>
                        <p className="text-gray-600">No bulk orders match the current filter.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Products
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Buyer Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bulkOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{order.name}</div>
                                                    <div className="text-sm text-gray-500">#{order._id.slice(-8)}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{order.phone}</div>
                                                <div className="text-sm text-gray-500">{order.email}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="flex -space-x-2 mr-3">
                                                        {order.products.slice(0, 3).map((item, index) => (
                                                            <img
                                                                key={index}
                                                                src={item.product.image[0]}
                                                                alt={item.product.name}
                                                                className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                                            />
                                                        ))}
                                                        {order.products.length > 3 && (
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600">
                                                                +{order.products.length - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {order.products.length} item{order.products.length > 1 ? 's' : ''}
                                                        </div>
                                                        <div className="text-sm text-gray-500">Qty: {order.totalQuantity}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getBuyerTypeBadge(order.buyerType)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {format(new Date(order.submittedAt), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => viewOrderDetails(order._id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View Details"
                                                    >
                                                        <FaEye />
                                                    </button>
                                                    {order.status === 'Requested' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(order._id, 'Approved')}
                                                                className="text-green-600 hover:text-green-900"
                                                                title="Approve"
                                                            >
                                                                <FaCheck />
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(order._id, 'Rejected')}
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Reject"
                                                            >
                                                                <FaTimes />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(order._id)}
                                                        className="text-red-600 hover:text-red-900"
                                                        title="Delete"
                                                    >
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page === pagination.pages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                                            <span className="font-medium">
                                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                                            </span> of{' '}
                                            <span className="font-medium">{pagination.total}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                            <button
                                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                                disabled={pagination.page === 1}
                                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                                disabled={pagination.page === pagination.pages}
                                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Order Details Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Bulk Order Details - #{selectedOrder._id.slice(-8)}
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Customer Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Name:</strong> {selectedOrder.name}</div>
                                        <div><strong>Email:</strong> {selectedOrder.email}</div>
                                        <div><strong>Phone:</strong> {selectedOrder.phone}</div>
                                        <div><strong>Buyer Type:</strong> {getBuyerTypeBadge(selectedOrder.buyerType)}</div>
                                        <div><strong>Address:</strong> {selectedOrder.address}</div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-3">Order Information</h4>
                                    <div className="space-y-2 text-sm">
                                        <div><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</div>
                                        <div><strong>Total Quantity:</strong> {selectedOrder.totalQuantity}</div>
                                        <div><strong>Submitted:</strong> {format(new Date(selectedOrder.submittedAt), 'MMM dd, yyyy hh:mm a')}</div>
                                        {selectedOrder.approvedAt && (
                                            <div><strong>Approved:</strong> {format(new Date(selectedOrder.approvedAt), 'MMM dd, yyyy hh:mm a')}</div>
                                        )}
                                        {selectedOrder.approvedBy && (
                                            <div><strong>Approved By:</strong> {selectedOrder.approvedBy.name}</div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Products */}
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-900 mb-3">Products ({selectedOrder.products.length})</h4>
                                <div className="space-y-3">
                                    {selectedOrder.products.map((item, index) => (
                                        <div key={index} className="flex items-center bg-gray-50 p-3 rounded-lg">
                                            <img 
                                                src={item.product.image[0]} 
                                                alt={item.product.name}
                                                className="w-16 h-16 object-cover rounded-md mr-4"
                                            />
                                            <div className="flex-1">
                                                <h5 className="font-medium">{item.product.name}</h5>
                                                <p className="text-sm text-gray-600">₹{item.product.price}</p>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-sm text-gray-600">Quantity: {item.quantity}</span>
                                                    {item.size && (
                                                        <span className="text-sm text-gray-600">Size: {item.size}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-medium">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Admin Notes */}
                            {selectedOrder.adminNotes && (
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-900 mb-3">Admin Notes</h4>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                        <p className="text-sm text-blue-800">{selectedOrder.adminNotes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {selectedOrder.status === 'Rejected' && selectedOrder.rejectionReason && (
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-900 mb-3">Rejection Reason</h4>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-sm text-red-800">{selectedOrder.rejectionReason}</p>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {selectedOrder.status === 'Requested' && (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            handleStatusUpdate(selectedOrder._id, 'Approved');
                                        }}
                                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                    >
                                        <FaCheck className="mr-2" />
                                        Approve Order
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowModal(false);
                                            handleStatusUpdate(selectedOrder._id, 'Rejected');
                                        }}
                                        className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                    >
                                        <FaTimes className="mr-2" />
                                        Reject Order
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Modal */}
            {showActionModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {actionType === 'Approved' ? 'Approve' : 'Reject'} Bulk Order
                            </h3>
                            
                            <div className="space-y-4">
                                {actionType === 'Approved' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Admin Notes (Optional)
                                        </label>
                                        <textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Add any notes for the customer..."
                                        />
                                    </div>
                                )}

                                {actionType === 'Rejected' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rejection Reason
                                        </label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Please provide a reason for rejection..."
                                            required
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={confirmStatusUpdate}
                                    disabled={actionType === 'Rejected' && !rejectionReason.trim()}
                                    className={`flex-1 py-2 px-4 rounded-md font-medium ${
                                        actionType === 'Approved' 
                                            ? 'bg-green-600 hover:bg-green-700 text-white'
                                            : 'bg-red-600 hover:bg-red-700 text-white'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {actionType === 'Approved' ? 'Approve' : 'Reject'}
                                </button>
                                <button
                                    onClick={() => setShowActionModal(false)}
                                    className="flex-1 py-2 px-4 border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBulkOrders;
