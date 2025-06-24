import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { FaTrash, FaShoppingBag, FaTicketAlt, FaCcVisa, FaCcMastercard, FaPaypal } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = 'http://127.0.0.1:8000';

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
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 md:mx-4 rounded-full transition-colors duration-500 ${index + 1 < currentStep ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const Cart = () => {
    const { cartItems, loading, updateItemQuantity, removeFromCart, cartTotalPrice, cartSubtotal, applyDiscountCode } = useCart();
    const [couponCode, setCouponCode] = useState('');

    const handleApplyCoupon = (e) => {
        e.preventDefault();
        if (!couponCode.trim()) return;
        applyDiscountCode(couponCode);
        setCouponCode('');
    };

    const parsePrice = (priceString) => {
        if (typeof priceString !== 'string') return 0;
        return parseFloat(priceString.replace(/[^0-9.]/g, ''));
    };

    const finalPrice = parsePrice(cartTotalPrice);
    const discountAmount = cartSubtotal - finalPrice;

    const EmptyCart = () => (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-20">
            <FaShoppingBag className="mx-auto h-24 w-24 text-gray-700" />
            <h2 className="mt-6 text-3xl font-bold text-white">Your Cart is Empty</h2>
            <p className="text-gray-400 my-4">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/menu" className="bg-orange-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-700 inline-block transition transform hover:scale-105">Browse Menu</Link>
        </motion.div>
    );
    
    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white text-2xl">Loading Your Cart...</div>;

    return (
        <div className="bg-black text-white min-h-screen pt-24">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Shopping <span className="text-orange-500">Cart</span></h1>
                </motion.div>
                <CheckoutStepper currentStep={1} />
                
                {cartItems.length === 0 ? <EmptyCart /> : (
                    <div className="flex flex-col lg:flex-row lg:gap-10">
                        <div className="lg:w-2/3">
                            <div className="bg-neutral-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-lg">
                                <h2 className="text-2xl font-bold mb-6">Your Items ({cartItems.length})</h2>
                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {cartItems.map(item => (
                                            <motion.div
                                                key={item.cart_item_id}
                                                layout
                                                initial={{ opacity: 0, x: -50 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                                                className="grid grid-cols-[auto,1fr,auto] items-center gap-4 bg-neutral-800/50 p-4 rounded-xl"
                                            >
                                                <img src={`${API_BASE_URL}${item.food_image}`} alt={item.food_name} className="w-20 h-20 object-cover rounded-lg"/>
                                                <div className="flex-grow">
                                                    <h3 className="font-bold text-lg text-white">{item.food_name}</h3>
                                                    <p className="text-orange-500 font-semibold">{item.food_price}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <div className="flex items-center gap-2 bg-neutral-900 border border-gray-700 rounded-lg">
                                                        <button onClick={() => updateItemQuantity(item.cart_item_id, item.quantity - 1)} className="px-3 py-1 text-lg hover:bg-neutral-700 rounded-l-lg transition-colors">-</button>
                                                        <span className="font-bold text-lg w-8 text-center">{item.quantity}</span>
                                                        <button onClick={() => updateItemQuantity(item.cart_item_id, item.quantity + 1)} className="px-3 py-1 text-lg hover:bg-neutral-700 rounded-r-lg transition-colors">+</button>
                                                    </div>
                                                    <button onClick={() => removeFromCart(item.cart_item_id)} className="text-xs text-gray-500 hover:text-red-500 transition-colors">
                                                        Remove
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/3 mt-10 lg:mt-0">
                            <div className="bg-neutral-900/50 border border-gray-800 rounded-2xl p-6 backdrop-blur-lg lg:sticky top-24">
                                <h2 className="text-2xl font-bold border-b border-gray-700 pb-4 mb-6">Order Summary</h2>
                                
                                <form onSubmit={handleApplyCoupon} className="space-y-2 mb-6">
                                    <label htmlFor="coupon" className="text-sm font-medium text-gray-400 flex items-center gap-2"><FaTicketAlt /> Have a discount code?</label>
                                    <div className="flex gap-2">
                                        <input type="text" id="coupon" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="COUPONCODE" className="w-full rounded-lg bg-neutral-800 border-gray-700 p-3 text-white placeholder:text-gray-500" />
                                        <button type="submit" className="bg-orange-600 text-white font-bold px-5 rounded-lg hover:bg-orange-700 transition-colors">Apply</button>
                                    </div>
                                </form>
                                
                                <dl className="space-y-3 border-t border-gray-800 pt-6">
                                    <div className="flex justify-between text-gray-300">
                                        <dt>Subtotal</dt>
                                        <dd>${cartSubtotal.toFixed(2)}</dd>
                                    </div>
                                    {discountAmount > 0.01 && (
                                        <div className="flex justify-between text-green-400">
                                            <dt>Discount Applied</dt>
                                            <dd>-${discountAmount.toFixed(2)}</dd>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-gray-300">
                                        <dt>Shipping & Taxes</dt>
                                        <dd className="text-sm">Calculated later</dd>
                                    </div>
                                </dl>

                                <div className="border-t border-gray-700 mt-4 pt-4">
                                    <div className="flex justify-between font-bold text-white text-xl">
                                        <dt>Total</dt>
                                        <dd>{cartTotalPrice}</dd>
                                    </div>
                                </div>

                                <Link to="/checkout" className="block text-center w-full mt-8 bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold py-3 rounded-xl hover:opacity-90 transition transform hover:scale-105">
                                    Proceed to Checkout
                                </Link>

                                <div className="text-center mt-6">
                                    <p className="text-xs text-gray-500 mb-2">We accept:</p>
                                    <div className="flex justify-center items-center gap-4 text-gray-400 text-3xl">
                                        <FaCcVisa /><FaCcMastercard /><FaPaypal />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Cart;