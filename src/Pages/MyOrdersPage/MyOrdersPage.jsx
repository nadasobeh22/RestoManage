import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCreditCard, FaReceipt, FaClock, FaCheckCircle, FaExclamationTriangle, FaBoxOpen } from 'react-icons/fa';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const StatusBadge = ({ status, type }) => {
    const statusConfig = {
        payment: {
            paid: { icon: <FaCheckCircle/>, text: 'Paid', className: 'bg-green-500/10 text-green-400' },
            pending: { icon: <FaClock/>, text: 'Pending', className: 'bg-yellow-500/10 text-yellow-400' },
            failed: { icon: <FaExclamationTriangle/>, text: 'Failed', className: 'bg-red-500/10 text-red-400' }
        },
        order: {
            processing: { icon: <FaClock/>, text: 'Processing', className: 'bg-blue-500/10 text-blue-400' },
            shipped: { icon: <FaBoxOpen/>, text: 'Shipped', className: 'bg-purple-500/10 text-purple-400' },
            delivered: { icon: <FaCheckCircle/>, text: 'Delivered', className: 'bg-green-500/10 text-green-400' },
            cancelled: { icon: <FaExclamationTriangle/>, text: 'Cancelled', className: 'bg-red-500/10 text-red-400' }
        }
    };
    
    const config = statusConfig[type]?.[status] || { icon: '?', text: status, className: 'bg-gray-500/10 text-gray-400' };

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${config.className}`}>
            {config.icon}
            {config.text}
        </span>
    );
};

const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryingPayment, setRetryingPayment] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`${API_BASE_URL}/order/myOrders`, { headers: { Authorization: `Bearer ${token}` } });
                setOrders(response.data.data || []);
            } catch (err) {
                setError('Failed to fetch your orders.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const handleRetryPayment = async (orderId) => {
        setRetryingPayment(orderId);
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Authentication error. Please log in again.");
            setRetryingPayment(null);
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/order/retry-payment/${orderId}`, null, { 
                headers: { Authorization: `Bearer ${token}` } 
            });

            if (response.data.status === 'success' && response.data.data.approve_url) {
                toast.success('Redirecting to payment...');
                window.location.href = response.data.data.approve_url;
            } else {
                toast.error(response.data.message || 'Failed to initiate payment.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not retry payment.');
        } finally {
            setRetryingPayment(null);
        }
    };

    const EmptyOrders = () => (
        <div className="text-center py-20">
            <FaReceipt className="mx-auto h-24 w-24 text-gray-700" />
            <h2 className="mt-6 text-3xl font-bold text-white">No Orders Yet</h2>
            <p className="text-gray-400 my-4">When you place an order, it will appear here.</p>
            <Link to="/menu" className="bg-orange-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-700 inline-block">Start Shopping</Link>
        </div>
    );

    return (
        <div className="bg-black text-white min-h-screen pt-24">
            <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold">My <span className="text-orange-500">Orders</span></h1>
                    <p className="mt-4 text-lg text-gray-400">Track your past and current orders here.</p>
                </motion.div>
                
                <div className="space-y-6">
                    {loading ? <p className="p-6 text-center">Loading orders...</p>
                    : error ? <p className="p-6 text-center text-red-400">{error}</p>
                    : orders.length === 0 ? <EmptyOrders />
                    : (
                        <AnimatePresence>
                            {orders.map(order => (
                                <motion.div 
                                    key={order.order_id} 
                                    layout
                                    initial={{ opacity: 0, y: 20 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0 }}
                                    className="bg-neutral-900 border border-gray-800 rounded-2xl p-6"
                                >
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                                        <div className="col-span-2 md:col-span-1">
                                            <p className="font-bold text-lg text-white">Order #{order.order_id}</p>
                                            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className="text-left">
                                             <p className="text-xs text-gray-500 mb-1">Status</p>
                                             <StatusBadge status={order.order_status} type="order" />
                                        </div>
                                        <div className="text-left">
                                             <p className="text-xs text-gray-500 mb-1">Payment</p>
                                             <StatusBadge status={order.payment_status} type="payment" />
                                        </div>
                                        <div className="text-left md:text-center">
                                            <p className="text-xs text-gray-500">Total</p>
                                            <p className="font-semibold text-white">{order.price_after_discounts}</p>
                                        </div>
                                        <div className="flex gap-2 justify-end col-span-2 md:col-span-1">
                                            <Link to={`/orders/${order.order_id}`} className="bg-neutral-700 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-neutral-600 transition-colors">Details</Link>
                                            {order.payment_status !== 'paid' && (
                                                <button 
                                                    onClick={() => handleRetryPayment(order.order_id)} 
                                                    disabled={retryingPayment === order.order_id}
                                                    className="bg-orange-600 text-white text-sm font-bold py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    <FaCreditCard /> 
                                                    {retryingPayment === order.order_id ? 'Wait...' : 'Pay'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyOrdersPage;