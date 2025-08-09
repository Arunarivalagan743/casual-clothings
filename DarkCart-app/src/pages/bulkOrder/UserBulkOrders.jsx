import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import SummaryApi, { baseURL } from '../../common/SummaryApi';
import { FaEye, FaPlus, FaFilter, FaBoxOpen } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

const UserBulkOrders = () => {
    const [bulkOrders, setBulkOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchBulkOrders();
    }, [pagination.page]);

    const fetchBulkOrders = async () => {
        setIsLoading(true);
        try {
            const response = await axios({
                ...SummaryApi.getUserBulkOrders,
                url: `${baseURL}${SummaryApi.getUserBulkOrders.url}?page=${pagination.page}&limit=${pagination.limit}`,
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

    const getStatusBadge = (status) => {
        const statusStyles = {
            'Requested': 'bg-yellow-50 text-yellow-800 border border-yellow-200',
            'Approved': 'bg-green-50 text-green-800 border border-green-200',
            'Rejected': 'bg-red-50 text-red-800 border border-red-200'
        };

        return (
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyles[status]} font-['Inter']`}>
                {status}
            </span>
        );
    };

    const getBuyerTypeBadge = (buyerType) => {
        const typeStyles = {
            'Shop': 'bg-blue-50 text-blue-800 border border-blue-200',
            'Solo': 'bg-purple-50 text-purple-800 border border-purple-200',
            'Wholesale': 'bg-orange-50 text-orange-800 border border-orange-200'
        };

        return (
            <span className={`px-3 py-1 text-xs font-medium rounded-full ${typeStyles[buyerType]} font-['Inter']`}>
                {buyerType}
            </span>
        );
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-black tracking-tight font-['Playfair_Display'] mb-2">My Bulk Orders</h1>
                    <p className="text-gray-600 font-['Inter']">Track your bulk order requests and their status</p>
                </div>
                <Link 
                    to="/bulk-order/new"
                    className="flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-300 font-['Inter'] font-medium shadow-md"
                >
                    <FaPlus className="mr-2" />
                    New Bulk Order
                </Link>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
                        <p className="mt-4 text-gray-600 font-['Inter']">Loading bulk orders...</p>
                    </div>
                ) : bulkOrders.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-gray-400 mb-6">
                            <FaBoxOpen className="mx-auto text-6xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-black mb-2 font-['Inter']">No bulk orders found</h3>
                        <p className="text-gray-600 mb-6 font-['Inter']">You haven't submitted any bulk order requests yet.</p>
                        <Link 
                            to="/bulk-order/new"
                            className="inline-flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-300 font-['Inter'] font-medium"
                        >
                            <FaPlus className="mr-2" />
                            Create Your First Bulk Order
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider font-['Inter']">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider font-['Inter']">
                                            Products
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider font-['Inter']">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider font-['Inter']">
                                            Buyer Type
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider font-['Inter']">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider font-['Inter']">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-black uppercase tracking-wider font-['Inter']">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bulkOrders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50 transition-colors duration-300">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-black font-['Inter']">
                                                    #{order._id.slice(-8)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex -space-x-2">
                                                    {order.products.slice(0, 3).map((item, index) => (
                                                        <img
                                                            key={index}
                                                            src={item.product.image[0]}
                                                            alt={item.product.name}
                                                            className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-sm"
                                                        />
                                                    ))}
                                                    {order.products.length > 3 && (
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600 shadow-sm">
                                                            +{order.products.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1 font-['Inter']">
                                                    {order.products.length} item{order.products.length > 1 ? 's' : ''}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-black font-semibold font-['Inter']">
                                                    {order.totalQuantity}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getBuyerTypeBadge(order.buyerType)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(order.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-['Inter']">
                                                {format(new Date(order.submittedAt), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => viewOrderDetails(order._id)}
                                                    className="text-black hover:text-gray-700 flex items-center bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors duration-300 font-['Inter']"
                                                >
                                                    <FaEye className="mr-1" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-gray-200">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                        disabled={pagination.page === 1}
                                        className="relative inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 font-['Inter']"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                        disabled={pagination.page === pagination.pages}
                                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-200 text-sm font-medium rounded-lg text-black bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 font-['Inter']"
                                    >
                                        Next
                                    </button>
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 font-['Inter']">
                                            Showing <span className="font-semibold text-black">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                                            <span className="font-semibold text-black">
                                                {Math.min(pagination.page * pagination.limit, pagination.total)}
                                            </span> of{' '}
                                            <span className="font-semibold text-black">{pagination.total}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                                            <button
                                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                                disabled={pagination.page === 1}
                                                className="relative inline-flex items-center px-4 py-2 rounded-l-lg border border-gray-200 bg-white text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 font-['Inter']"
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                                disabled={pagination.page === pagination.pages}
                                                className="relative inline-flex items-center px-4 py-2 rounded-r-lg border border-gray-200 bg-white text-sm font-medium text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300 font-['Inter']"
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
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold text-black font-['Playfair_Display']">
                                    Bulk Order Details
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors duration-300"
                                    title="Close"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 mb-8">
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h4 className="font-semibold text-black mb-4 font-['Inter']">Order Information</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 font-['Inter']">Order ID:</span>
                                            <span className="font-semibold text-black font-['Inter']">#{selectedOrder._id.slice(-8)}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 font-['Inter']">Status:</span>
                                            {getStatusBadge(selectedOrder.status)}
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 font-['Inter']">Buyer Type:</span>
                                            {getBuyerTypeBadge(selectedOrder.buyerType)}
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 font-['Inter']">Total Quantity:</span>
                                            <span className="font-semibold text-black font-['Inter']">{selectedOrder.totalQuantity}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 font-['Inter']">Submitted:</span>
                                            <span className="font-semibold text-black font-['Inter']">{format(new Date(selectedOrder.submittedAt), 'MMM dd, yyyy hh:mm a')}</span>
                                        </div>
                                        {selectedOrder.approvedAt && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600 font-['Inter']">Approved:</span>
                                                <span className="font-semibold text-green-600 font-['Inter']">{format(new Date(selectedOrder.approvedAt), 'MMM dd, yyyy hh:mm a')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h4 className="font-semibold text-black mb-4 font-['Inter']">Contact Information</h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 font-['Inter']">Name:</span>
                                            <span className="font-semibold text-black font-['Inter']">{selectedOrder.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 font-['Inter']">Email:</span>
                                            <span className="font-semibold text-black font-['Inter']">{selectedOrder.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 font-['Inter']">Phone:</span>
                                            <span className="font-semibold text-black font-['Inter']">{selectedOrder.phone}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-600 font-['Inter'] mb-1">Address:</span>
                                            <span className="font-semibold text-black font-['Inter'] text-right">{selectedOrder.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Products */}
                            <div className="mb-8">
                                <h4 className="font-semibold text-black mb-6 font-['Inter'] text-lg">Products Ordered</h4>
                                <div className="space-y-4">
                                    {selectedOrder.products.map((item, index) => (
                                        <div key={index} className="flex items-center bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                                            <img 
                                                src={item.product.image[0]} 
                                                alt={item.product.name}
                                                className="w-16 h-16 object-cover rounded-lg mr-4 border border-gray-100"
                                            />
                                            <div className="flex-1">
                                                <h5 className="font-semibold text-black font-['Inter']">{item.product.name}</h5>
                                                <p className="text-sm text-gray-600 font-['Inter']">₹{item.product.price}</p>
                                                <div className="flex items-center gap-4 mt-2">
                                                    <span className="text-sm text-gray-600 font-['Inter']">Qty: <span className="font-semibold text-black">{item.quantity}</span></span>
                                                    {item.size && (
                                                        <span className="text-sm text-gray-600 font-['Inter']">Size: <span className="font-semibold text-black">{item.size}</span></span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-black font-['Inter']">₹{(item.product.price * item.quantity).toLocaleString()}</p>
                                                <p className="text-xs text-gray-500 font-['Inter']">Subtotal</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Admin Notes */}
                            {selectedOrder.adminNotes && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-black mb-3 font-['Inter']">Admin Notes</h4>
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-800 font-['Inter']">{selectedOrder.adminNotes}</p>
                                    </div>
                                </div>
                            )}

                            {/* Rejection Reason */}
                            {selectedOrder.status === 'Rejected' && selectedOrder.rejectionReason && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-black mb-3 font-['Inter']">Rejection Reason</h4>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm text-red-800 font-['Inter']">{selectedOrder.rejectionReason}</p>
                                    </div>
                                </div>
                            )}

                            {/* Modal Footer */}
                            <div className="flex justify-end pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors duration-300 font-['Inter'] font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal */}
            {showModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold text-black font-['Playfair_Display']">
                                    Bulk Order Details
                                </h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors duration-300"
                                    title="Close"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Rejection Reason */}
                            {selectedOrder.status === 'Rejected' && selectedOrder.rejectionReason && (
                                <div className="mb-6">
                                    <h4 className="font-semibold text-black mb-3 font-['Inter']">Rejection Reason</h4>
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                        <p className="text-sm text-red-800 font-['Inter']">{selectedOrder.rejectionReason}</p>
                                    </div>
                                </div>
                            )}

                            {/* Status Message */}
                            {selectedOrder.status === 'Approved' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                                    <h4 className="font-semibold text-green-900 mb-2 font-['Inter']">✅ Order Approved</h4>
                                    <p className="text-sm text-green-800 font-['Inter']">
                                        Great! Your bulk order has been approved. Our team will contact you soon at {selectedOrder.phone} or {selectedOrder.email} to discuss the details and next steps.
                                    </p>
                                </div>
                            )}

                            {selectedOrder.status === 'Requested' && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                    <h4 className="font-semibold text-yellow-900 mb-2 font-['Inter']">⏳ Under Review</h4>
                                    <p className="text-sm text-yellow-800 font-['Inter']">
                                        Your bulk order request is currently under review. We'll update you soon with the status.
                                    </p>
                                </div>
                            )}

                            {/* Modal Footer */}
                            <div className="flex justify-end pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 bg-gray-100 text-black rounded-lg hover:bg-gray-200 transition-colors duration-300 font-['Inter'] font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserBulkOrders;
