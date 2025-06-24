import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft } from 'react-icons/fa';

// الرابط الأساسي للسيرفر (للصور والملفات)
const API_ROOT_URL = 'http://127.0.0.1:8000';
// الرابط الخاص بطلبات الـ API
const API_BASE_URL = `${API_ROOT_URL}/api`;

const OrderDetailsPage = () => {
    const { id } = useParams();
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            try {
                const response = await axios.get(`${API_BASE_URL}/order/myOrderDetails/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                setOrderItems(response.data.data || []);
            } catch (err) {
                setError('Failed to fetch order details.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [id]);
    
    const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
    const itemVariants = { hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } };

    return (
        <div className="bg-black text-white min-h-screen pt-24">
            <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <Link to="/orders" className="text-sm text-orange-500 hover:underline inline-flex items-center gap-2">
                        <FaArrowLeft size={12} />
                        Back to My Orders
                    </Link>
                    <h1 className="text-4xl font-extrabold mt-2">Order Details <span className="text-orange-500">#{id}</span></h1>
                </motion.div>

                <div className="bg-neutral-900 border border-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">
                    {loading ? <p className="text-center p-8">Loading order details...</p>
                    : error ? <p className="p-8 text-center text-red-400">{error}</p>
                    : !orderItems || orderItems.length === 0 ? <p className="p-8 text-center text-gray-400">This order has no items or could not be found.</p>
                    : (
                        <div>
                            <h2 className="text-xl font-bold mb-4">Items in this order</h2>
                            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                                {orderItems.map(item => (
                                    <motion.div variants={itemVariants} key={item.order_item_id} className="flex items-center gap-4 bg-neutral-800/50 p-4 rounded-xl">
                                        <img 
                                            src={`${API_ROOT_URL}${item.food.image_url}`} 
                                            alt={item.food.name} 
                                            className="w-16 h-16 object-cover rounded-lg bg-neutral-700" 
                                        />
                                        <div className="flex-grow">
                                            <p className="font-bold text-lg text-white">{item.food.name}</p>
                                            <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-white">{item.price_after_discounts}</p>
                                            {item.price_after_discounts !== item.price && <p className="text-xs text-gray-500 line-through">{item.price}</p>}
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default OrderDetailsPage;