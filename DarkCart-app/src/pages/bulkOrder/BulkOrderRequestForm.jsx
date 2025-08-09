import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import SummaryApi, { baseURL } from '../../common/SummaryApi';
import { FaPlus, FaTrash, FaSearch, FaPaperPlane, FaBoxOpen } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const BulkOrderRequestForm = () => {
    const [products, setProducts] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showProductSearch, setShowProductSearch] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    
    const user = useSelector(state => state.user);

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
        setValue,
        watch,
        reset
    } = useForm({
        defaultValues: {
            name: user?.name || '',
            email: user?.email || '',
            phone: '',
            buyerType: '',
            products: [],
            address: ''
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'products'
    });

    // Fetch all products on component mount
    useEffect(() => {
        fetchProducts();
    }, []);

    // Set user details if available
    useEffect(() => {
        if (user) {
            setValue('name', user.name || '');
            setValue('email', user.email || '');
        }
    }, [user, setValue]);

    // Filter products based on search term
    useEffect(() => {
        if (searchTerm) {
            const filtered = products.filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.category?.some(cat => cat.name?.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    }, [searchTerm, products]);

    const fetchProducts = async () => {
        try {
            const response = await axios({
                method: 'POST',
                url: `${baseURL}/api/product/get`,
                withCredentials: true
            });

            console.log('Products response:', response);

            if (response.data.success) {
                setProducts(response.data.data);
                setFilteredProducts(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        }
    };

    const addProduct = (product) => {
        const isAlreadyAdded = fields.some(field => field.productId === product._id);
        
        if (isAlreadyAdded) {
            toast.error('Product already added');
            return;
        }

        append({
            productId: product._id,
            productName: product.name,
            productImage: product.image[0],
            productPrice: product.price,
            quantity: 1,
            size: ''
        });

        setShowProductSearch(false);
        setSearchTerm('');
        toast.success('Product added to bulk order');
    };

    const onSubmit = async (data) => {
        if (data.products.length === 0) {
            toast.error('Please add at least one product');
            return;
        }

        setIsLoading(true);

        try {
            // Transform products data for API
            const bulkOrderData = {
                name: data.name,
                phone: data.phone,
                email: data.email,
                buyerType: data.buyerType,
                address: data.address,
                products: data.products.map(item => ({
                    product: item.productId,
                    quantity: parseInt(item.quantity),
                    size: item.size || undefined
                }))
            };

            const response = await axios({
                ...SummaryApi.createBulkOrder,
                url: `${baseURL}${SummaryApi.createBulkOrder.url}`,
                data: bulkOrderData,
                withCredentials: true
            });

            if (response.data.success) {
                toast.success(response.data.message);
                reset();
                // Redirect to bulk orders page or show success message
                setTimeout(() => {
                    window.location.href = '/bulk-orders';
                }, 2000);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error submitting bulk order:', error);
            toast.error(error.response?.data?.message || 'Failed to submit bulk order request');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-100">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-black tracking-tight font-['Playfair_Display'] mb-2">Bulk Order Request</h2>
                <p className="text-gray-600 font-['Inter']">Submit your bulk order inquiry and our team will contact you personally to discuss pricing and arrangements.</p>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Contact Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-black mb-4 font-['Inter']">Contact Information</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-black mb-2 font-['Inter']">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                {...register('name', { required: 'Name is required' })}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 font-['Inter']"
                                placeholder="Enter your full name"
                            />
                            {errors.name && (
                                <p className="mt-2 text-sm text-red-600 font-['Inter']">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2 font-['Inter']">
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                {...register('phone', { 
                                    required: 'Phone number is required',
                                    pattern: {
                                        value: /^[6-9]\d{9}$/,
                                        message: 'Please enter a valid 10-digit phone number'
                                    }
                                })}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 font-['Inter']"
                                placeholder="Enter your phone number"
                            />
                            {errors.phone && (
                                <p className="mt-2 text-sm text-red-600 font-['Inter']">{errors.phone.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <label className="block text-sm font-medium text-black mb-2 font-['Inter']">
                                Email Address *
                            </label>
                            <input
                                type="email"
                                {...register('email', { 
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address'
                                    }
                                })}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 font-['Inter']"
                                placeholder="Enter your email address"
                            />
                            {errors.email && (
                                <p className="mt-2 text-sm text-red-600 font-['Inter']">{errors.email.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2 font-['Inter']">
                                Type of Buyer *
                            </label>
                            <select
                                {...register('buyerType', { required: 'Please select buyer type' })}
                                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 font-['Inter']"
                            >
                                <option value="">Select buyer type</option>
                                <option value="Shop">Shop Owner</option>
                                <option value="Solo">Individual Buyer</option>
                                <option value="Wholesale">Wholesale Business</option>
                            </select>
                            {errors.buyerType && (
                                <p className="mt-2 text-sm text-red-600 font-['Inter']">{errors.buyerType.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Address */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-black mb-4 font-['Inter']">Delivery Information</h3>
                    <div>
                        <label className="block text-sm font-medium text-black mb-2 font-['Inter']">
                            Address/Location *
                        </label>
                        <textarea
                            {...register('address', { required: 'Address is required' })}
                            rows={4}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-300 font-['Inter'] resize-none"
                            placeholder="Enter your complete delivery address including city, state, and pincode"
                        />
                        {errors.address && (
                            <p className="mt-2 text-sm text-red-600 font-['Inter']">{errors.address.message}</p>
                        )}
                    </div>
                </div>

                {/* Products Section */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-black font-['Inter']">Select Products</h3>
                        <button
                            type="button"
                            onClick={() => setShowProductSearch(true)}
                            className="flex items-center px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-300 font-['Inter'] font-medium shadow-md"
                        >
                            <FaPlus className="mr-2" />
                            Add Product
                        </button>
                    </div>

                    {/* Selected Products */}
                    {fields.length > 0 && (
                        <div className="space-y-4 mb-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <div className="flex items-center">
                                        <img 
                                            src={field.productImage} 
                                            alt={field.productName}
                                            className="w-16 h-16 object-cover rounded-lg border border-gray-100 mr-4"
                                        />
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="font-semibold text-black font-['Inter']">{field.productName}</p>
                                                <p className="text-sm text-gray-600 font-['Inter']">₹{field.productPrice}</p>
                                            </div>
                                            <div>
                                                <label className="block text-xs text-black mb-1 font-['Inter'] font-medium">Quantity *</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    {...register(`products.${index}.quantity`, { 
                                                        required: 'Quantity is required',
                                                        min: { value: 1, message: 'Minimum quantity is 1' }
                                                    })}
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-['Inter']"
                                                />
                                                {errors.products?.[index]?.quantity && (
                                                    <p className="mt-1 text-xs text-red-600 font-['Inter']">{errors.products[index].quantity.message}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-xs text-black mb-1 font-['Inter'] font-medium">Size (Optional)</label>
                                                <select
                                                    {...register(`products.${index}.size`)}
                                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-['Inter']"
                                                >
                                                    <option value="">Select size</option>
                                                    <option value="XS">XS</option>
                                                    <option value="S">S</option>
                                                    <option value="M">M</option>
                                                    <option value="L">L</option>
                                                    <option value="XL">XL</option>
                                                    <option value="XXL">XXL</option>
                                                </select>
                                            </div>
                                            <div className="flex items-end">
                                                <button
                                                    type="button"
                                                    onClick={() => remove(index)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-300"
                                                    title="Remove product"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {fields.length === 0 && (
                        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                            <FaBoxOpen className="mx-auto text-4xl text-gray-400 mb-4" />
                            <p className="text-gray-600 font-['Inter']">No products selected. Click "Add Product" to get started.</p>
                        </div>
                    )}
                </div>

                {/* Additional Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-black mb-4 font-['Inter']">Additional Information</h3>
                    <div>
                        <label className="block text-sm font-medium text-black mb-2 font-['Inter']">
                            Special Requirements or Notes
                        </label>
                        <textarea
                            {...register('notes')}
                            rows={4}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-['Inter'] resize-none"
                            placeholder="Any specific requirements, customizations, or delivery preferences..."
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                    <button
                        type="submit"
                        disabled={isLoading || fields.length === 0}
                        className="px-8 py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 font-['Inter'] shadow-lg disabled:shadow-none"
                    >
                        {isLoading ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting Request...
                            </div>
                        ) : (
                            <>
                                <FaPaperPlane className="inline mr-2" />
                                Submit Bulk Order Request
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Product Search Modal */}
            {showProductSearch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-black font-['Playfair_Display']">Select Products</h3>
                            <button
                                onClick={() => setShowProductSearch(false)}
                                className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-lg transition-colors duration-300"
                                title="Close"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="mb-6">
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-['Inter']"
                                />
                            </div>
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (
                                <div key={product._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow duration-300">
                                    <img 
                                        src={product.image[0]} 
                                        alt={product.name}
                                        className="w-full h-32 object-cover rounded-lg mb-3 border border-gray-100"
                                    />
                                    <h4 className="font-semibold text-black mb-2 font-['Inter'] text-sm">{product.name}</h4>
                                    <p className="text-black font-bold mb-3 font-['Inter']">₹{product.price}</p>
                                    <button
                                        onClick={() => addProduct(product)}
                                        className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-300 text-sm font-['Inter'] font-medium"
                                    >
                                        Add to Bulk Order
                                    </button>
                                </div>
                            ))}
                        </div>

                        {filteredProducts.length === 0 && (
                            <div className="text-center py-12">
                                <FaBoxOpen className="mx-auto text-4xl text-gray-400 mb-4" />
                                <p className="text-gray-600 font-['Inter']">No products found matching your search.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BulkOrderRequestForm;
