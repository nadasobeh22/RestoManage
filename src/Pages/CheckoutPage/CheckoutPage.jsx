import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaUser, FaMapMarkerAlt, FaGlobe, FaCity, FaEnvelope, FaPhone, FaChevronDown } from 'react-icons/fa';

const API_ROOT_URL = 'http://127.0.0.1:8000';
const API_BASE_URL = `${API_ROOT_URL}/api`;

const CheckoutStepper = ({ currentStep }) => {
    const steps = ['Shopping Cart', 'Shipping Details', 'Payment'];
    return (
        <div className="w-full max-w-2xl mx-auto mb-12 md:mb-16">
            <div className="flex items-center">
                {steps.map((step, index) => (
                    <React.Fragment key={step}>
                        <div className="flex flex-col items-center text-center px-1 transition-all duration-300">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300 ${index + 1 <= currentStep ? 'bg-orange-500 border-orange-500 text-white' : 'bg-neutral-800 border-gray-700 text-gray-500'}`}>
                                {index + 1}
                            </div>
                            <p className={`mt-2 text-xs md:text-sm font-semibold transition-colors duration-300 ${index + 1 <= currentStep ? 'text-white' : 'text-gray-500'}`}>{step}</p>
                        </div>
                        {index < steps.length - 1 && (<div className={`flex-1 h-1 mx-2 md:mx-4 rounded-full transition-colors duration-500 ${index + 1 < currentStep ? 'bg-orange-500' : 'bg-gray-700'}`}></div>)}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const CheckoutPage = () => {
    const { cartItems, cartTotalPrice } = useCart();
    const [formData, setFormData] = useState({ address: '', country: '', town: '', zipCode: '', phone_number: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSummaryOpen, setIsSummaryOpen] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please log in to place an order.");
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/order/create`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 'success' && response.data.data.approve_url) {
                toast.success('Order created! Redirecting to payment...');
                window.location.href = response.data.data.approve_url;
            } else {
                toast.error(response.data.message || 'Failed to create order.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred while creating your order.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-black text-white min-h-screen pt-24">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Checkout</h1>
                </motion.div>
                <CheckoutStepper currentStep={2} />

                <div className="bg-neutral-900/50 border border-gray-800 rounded-2xl backdrop-blur-lg mb-8">
                    <button onClick={() => setIsSummaryOpen(!isSummaryOpen)} className="w-full flex justify-between items-center p-6">
                        <div className='flex items-center gap-4'>
                           <FaShoppingCart className="text-orange-500" size={20}/>
                           <span className="font-semibold text-lg">Order Summary</span>
                        </div>
                        <div className='flex items-center gap-4'>
                            <span className="font-bold text-lg">{cartTotalPrice}</span>
                            <FaChevronDown className={`transition-transform ${isSummaryOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </button>
                    <AnimatePresence>
                        {isSummaryOpen && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="border-t border-gray-800 p-6 space-y-3">
                                    {cartItems.map(item => (
                                        <div key={item.cart_item_id} className="flex justify-between text-sm text-gray-300">
                                            <div className="flex items-center gap-3">
                                               <img src={`${API_ROOT_URL}${item.food_image}`} alt={item.food_name} className="w-10 h-10 object-cover rounded-md"/>
                                               <span>{item.food_name} <span className="text-gray-500">x{item.quantity}</span></span>
                                            </div>
                                            <span>{item.food_price}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <form onSubmit={handleSubmit} className="bg-neutral-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-lg">
                    <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                    <div className="space-y-4">
                         <div className="relative"><FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" name="address" placeholder="Address" onChange={handleChange} required className="w-full rounded-lg bg-neutral-800 border-gray-700 p-3 pl-10" /></div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="relative"><FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" name="country" placeholder="Country" onChange={handleChange} required className="w-full rounded-lg bg-neutral-800 border-gray-700 p-3 pl-10" /></div>
                            <div className="relative"><FaCity className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" name="town" placeholder="Town/City" onChange={handleChange} required className="w-full rounded-lg bg-neutral-800 border-gray-700 p-3 pl-10" /></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="relative"><FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" name="zipCode" placeholder="ZIP Code" onChange={handleChange} required className="w-full rounded-lg bg-neutral-800 border-gray-700 p-3 pl-10" /></div>
                           <div className="relative"><FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input type="tel" name="phone_number" placeholder="Phone Number" onChange={handleChange} required className="w-full rounded-lg bg-neutral-800 border-gray-700 p-3 pl-10" /></div>
                        </div>
                    </div>
                    <button type="submit" disabled={isSubmitting || cartItems.length === 0} className="w-full mt-8 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition transform hover:scale-105 disabled:opacity-50 disabled:scale-100">
                        {isSubmitting ? 'Processing...' : 'Confirm & Proceed to Payment'}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default CheckoutPage;