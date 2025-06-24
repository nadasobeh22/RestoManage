import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaStar, FaTags } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://127.0.0.1:8000';

const FoodCard = ({ food, onAddToCart, onQuickRate }) => {
    const isLoggedIn = !!localStorage.getItem('token');
    const [hoverRating, setHoverRating] = useState(0);

    const renderInteractiveStars = () => (
        <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
            {[...Array(5)].map((_, i) => {
                const ratingValue = i + 1;
                return (
                    <motion.button
                        key={ratingValue}
                        whileHover={{ scale: 1.3 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onQuickRate(food.food_id, ratingValue);}}
                        onMouseEnter={() => setHoverRating(ratingValue)}
                        className="bg-transparent border-none p-0"
                        aria-label={`Rate ${ratingValue} stars`}
                    >
                        <FaStar className="transition-colors" color={ratingValue <= (hoverRating || Math.round(food.average_rating)) ? "#ffc107" : "#4b5563"} />
                    </motion.button>
                )
            })}
        </div>
    );
    
    const renderStars = (rating) => {
        const fullStars = Math.round(rating);
        return [...Array(5)].map((_, i) => <FaStar key={i} className={`inline-block ${i < fullStars ? 'text-yellow-400' : 'text-gray-600'}`} />);
    };

    return (
        <motion.div 
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} 
            className="bg-neutral-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col group h-full shadow-lg hover:shadow-orange-500/20 transition-shadow duration-300"
        >
            <div className="relative overflow-hidden h-56">
                <Link to={`/food/${food.food_id}`}>
                    <img src={`${API_BASE_URL}${food.image_url}`} alt={food.food_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </Link>
                {food.discount_info && (
                    <div className="absolute top-0 right-0 bg-orange-600 text-white font-bold text-sm px-4 py-1.5 rounded-bl-xl shadow-xl flex items-center gap-2">
                         <FaTags size={12}/>
                         <span>{food.discount_info.value_percentage}% OFF</span>
                    </div>
                )}
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2 truncate" title={food.food_name}>{food.food_name}</h3>
                    <div className="flex items-center gap-2 mb-4 h-5" title={isLoggedIn ? 'Click a star to rate!' : 'Log in to rate'}>
                        {isLoggedIn ? renderInteractiveStars() : renderStars(food.average_rating)}
                        <span className="text-xs text-gray-400">({parseFloat(food.average_rating).toFixed(1)})</span>
                    </div>
                </div>
                <p className="text-gray-400 text-sm flex-grow mb-4 line-clamp-2">{food.description}</p>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-800">
                    {food.discount_info ? (
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-orange-500">${food.discount_info.discounted_price}</p>
                            <p className="text-lg text-gray-500 line-through">${food.original_price.toFixed(2)}</p>
                        </div>
                    ) : (
                        <p className="text-2xl font-bold text-orange-500">${parseFloat(String(food.price).replace(/[^0-9.]/g, '')).toFixed(2)}</p>
                    )}
                    <button onClick={(e) => onAddToCart(e, food.food_id)} className="bg-white text-black p-3 rounded-full text-lg transform group-hover:bg-orange-500 group-hover:text-white group-hover:scale-110 transition-all" aria-label="Add to cart"><FaShoppingCart /></button>
                </div>
            </div>
        </motion.div>
    );
};

const OffersPage = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOffers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_BASE_URL}/api/foods/discounts`);
                if (response.data && response.data.data) {
                    const formattedOffers = response.data.data.map(food => ({
                        ...food,
                        original_price: parseFloat(String(food.price).replace(/[^0-9.]/g, '')),
                        discount_info: {
                            discounted_price: parseFloat(String(food.price_after_discounts).replace(/[^0-9.]/g, '')).toFixed(2),
                            value_percentage: food.discounts.length > 0 ? parseFloat(String(food.discounts[0].discount_value).replace(/[^0-9.]/g, '')) : 0,
                        },
                    }));
                    setOffers(formattedOffers);
                } else {
                    setOffers([]);
                }
            } catch (err) {
                setError('Could not load special offers. Please try again later.');
                console.error("Failed to load discounted foods:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    const handleQuickAddToCart = (e, foodId) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(foodId, 1);
    };

    const handleQuickRate = async (foodId, rating) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please log in to submit a rating.");
            navigate('/login');
            return;
        }
        const originalOffers = [...offers];
        const updatedUiOffers = offers.map(food => 
            food.food_id === foodId ? { ...food, average_rating: rating.toString() } : food
        );
        setOffers(updatedUiOffers);
        try {
            await axios.post(`${API_BASE_URL}/api/review/addReviews`, 
                { food_id: foodId, rating }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Thank you for your rating!');
        } catch (error) {
            setOffers(originalOffers);
            toast.error(error.response?.data?.message || 'Could not submit rating.');
        }
    };
    
    const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

    return (
        <div className="bg-black text-white min-h-screen">
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-neutral-950"></div>
                <div className="absolute top-0 left-1/2 -z-10 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-500/20 blur-3xl sm:h-96 sm:w-96"></div>
                
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="text-center pt-32 pb-20 px-4"
                >
                    <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-500">Limited Time</span> Offers
                    </h1>
                    <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
                        Don't miss out on these exclusive deals. The perfect reason to treat yourself today!
                    </p>
                </motion.div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                {loading ? <p className="text-center py-20">Loading Special Offers...</p>
                : error ? <div className="text-center py-20 text-red-400">{error}</div>
                : (
                    <motion.div 
                        variants={containerVariants} 
                        initial="hidden" 
                        animate="visible" 
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {offers.length === 0 
                            ? <p className="col-span-full text-center py-10">No special offers available at the moment.</p> 
                            : offers.map(food => (
                                <FoodCard key={food.food_id} food={food} onAddToCart={handleQuickAddToCart} onQuickRate={handleQuickRate} />
                            ))
                        }
                    </motion.div>
                )}
            </main>
        </div>
    );
};

export default OffersPage;