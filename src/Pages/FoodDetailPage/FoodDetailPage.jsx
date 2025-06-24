import React, { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../context/CartContext';
import { FaShoppingCart, FaPlus, FaMinus, FaStar, FaRegStar, FaPen, FaTimes, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://127.0.0.1:8000';

const ReviewModal = ({ foodId, onClose, onReviewSubmit }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please log in to submit a review.");
            navigate('/login');
            return;
        }
        if (rating === 0) {
            toast.error("Please select a star rating.");
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${API_BASE_URL}/api/review/addReviews`,
                { food_id: foodId, rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(response.data.message || 'Review added successfully!');
            onReviewSubmit();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Could not submit review.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-neutral-900 border border-gray-700 rounded-2xl p-8 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><FaTimes size={20} /></button>
                <h2 className="text-3xl font-bold text-white mb-6">Rate This Dish</h2>
                <form onSubmit={handleReviewSubmit} className="space-y-6">
                    <div>
                        <label className="block text-lg font-medium text-gray-300 mb-3">Your Rating</label>
                        <div className="flex items-center gap-2 text-3xl text-gray-400">
                            {[...Array(5)].map((_, index) => {
                                const ratingValue = index + 1;
                                return (
                                    <motion.div
                                        key={ratingValue}
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setRating(ratingValue)}
                                        onMouseEnter={() => setHoverRating(ratingValue)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        className="cursor-pointer"
                                    >
                                        <FaStar className="transition-colors" color={ratingValue <= (hoverRating || rating) ? "#ffc107" : "#4b5563"} />
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="comment" className="block text-lg font-medium text-gray-300 mb-2">Your Comment</label>
                        <textarea id="comment" rows="4" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Share your thoughts... (optional)" className="w-full rounded-lg bg-neutral-800 border-gray-700 p-4 text-white" />
                    </div>
                    <div className="text-right">
                        <button type="submit" disabled={isSubmitting} className="bg-orange-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-colors">
                            {isSubmitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const FoodDetailPage = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [food, setFood] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const isLoggedIn = !!localStorage.getItem('token');

    const fetchFoodDetails = useCallback(async () => {
        if (!food) setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/foods/details/${id}`);
            if (response.data.status === 'success' && response.data.data) {
                setFood(response.data.data);
            } else {
                throw new Error(response.data.message || "Food item not found.");
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load food details.');
        } finally {
            setLoading(false);
        }
    }, [id, food]);

    useEffect(() => {
        if (id) {
            fetchFoodDetails();
        }
    }, [id]);
    
    const prices = useMemo(() => {
        if (!food) return { original: 0, final: 0, hasDiscount: false };
        const originalPrice = parseFloat(String(food.price).replace(/[^0-9.]/g, ''));
        const finalPriceString = food.price_after_discounts || food.price;
        const finalPrice = parseFloat(String(finalPriceString).replace(/[^0-9.]/g, ''));
        return { original: originalPrice, final: finalPrice, hasDiscount: finalPrice < originalPrice };
    }, [food]);

    const handleAddToCart = () => {
        if (food) {
            addToCart(food.food_id, quantity);
        }
    };
    
    const renderStars = (rating) => {
        const fullStars = Math.round(rating);
        return [...Array(5)].map((_, i) => i < fullStars ? <FaStar key={i} /> : <FaRegStar key={i} />);
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">Loading delicious details...</div>;
    if (error) return <div className="min-h-screen bg-black flex items-center justify-center text-red-400 text-xl">{error}</div>;
    if (!food) return null;

    return (
        <>
            <div className="bg-black text-white min-h-screen">
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16 items-start">
                        
                        <motion.div 
                            initial={{ opacity: 0, x: -50 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            transition={{ duration: 0.5 }}
                            className="lg:sticky top-24"
                        >
                            <div className="w-full bg-neutral-900 border border-gray-800 rounded-2xl overflow-hidden aspect-square">
                                <img src={`${API_BASE_URL}${food.image_url}`} alt={food.food_name} className="w-full h-full object-cover" />
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 50 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mt-10 lg:mt-0"
                        >
                            <div className="mb-8">
                                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 text-white">{food.food_name}</h1>
                                <div className="flex items-center gap-4">
                                    <div className="flex text-yellow-400">{renderStars(food.average_rating)}</div>
                                    <span className="text-gray-400 text-sm">({parseFloat(food.average_rating).toFixed(1)} rating)</span>
                                </div>
                            </div>
                            
                            <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-6 mb-8">
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-gray-400 font-medium text-lg">Quantity</span>
                                    <div className="flex items-center gap-4 bg-neutral-800 border border-gray-700 rounded-lg">
                                        <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-2 text-xl hover:bg-neutral-700 rounded-l-lg transition-colors">-</button>
                                        <span className="font-bold text-xl w-10 text-center">{quantity}</span>
                                        <button onClick={() => setQuantity(q => q + 1)} className="px-4 py-2 text-xl hover:bg-neutral-700 rounded-r-lg transition-colors">+</button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-6">
                                    <span className="text-gray-400 font-medium text-lg">Price</span>
                                    {prices.hasDiscount ? (
                                        <div className="flex items-baseline gap-3">
                                            <p className="text-3xl font-bold text-orange-500">${prices.final.toFixed(2)}</p>
                                            <p className="text-xl text-gray-500 line-through">${prices.original.toFixed(2)}</p>
                                        </div>
                                    ) : (
                                        <p className="text-3xl font-bold text-orange-500">${prices.original.toFixed(2)}</p>
                                    )}
                                </div>
                                <button onClick={handleAddToCart} className="w-full bg-orange-600 text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-3 hover:bg-orange-700 transition-all transform hover:scale-105">
                                    <FaShoppingCart />
                                    <span>Add to Cart - ${(prices.final * quantity).toFixed(2)}</span>
                                </button>
                            </div>

                            <div>
                                <div className="border-b border-gray-800 flex space-x-6 mb-6">
                                    <button onClick={() => setActiveTab('description')} className={`py-3 font-semibold transition-colors ${activeTab === 'description' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-white'}`}>Description</button>
                                    <button onClick={() => setActiveTab('reviews')} className={`py-3 font-semibold transition-colors ${activeTab === 'reviews' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400 hover:text-white'}`}>Reviews</button>
                                </div>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeTab}
                                        initial={{ y: 10, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: -10, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="min-h-[100px]"
                                    >
                                        {activeTab === 'description' && (
                                            <p className="text-gray-300 leading-relaxed">{food.description}</p>
                                        )}
                                        {activeTab === 'reviews' && (
                                            <div>
                                                <p className="text-gray-400 mb-4">See what others are saying about this dish.</p>
                                                {isLoggedIn && (
                                                    <div className="mt-6">
                                                        <button onClick={() => setIsReviewModalOpen(true)} className="text-orange-500 font-semibold hover:underline flex items-center gap-2">
                                                            <FaPen /> Add Your Review
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                </main>
            </div>
            <AnimatePresence>
                {isReviewModalOpen && <ReviewModal foodId={id} onClose={() => setIsReviewModalOpen(false)} onReviewSubmit={fetchFoodDetails} />}
            </AnimatePresence>
        </>
    );
};

export default FoodDetailPage;