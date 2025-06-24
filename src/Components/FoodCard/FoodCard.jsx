import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShoppingCart, FaStar } from 'react-icons/fa';

const API_BASE_URL = 'http://127.0.0.1:8000';

const FoodCard = ({ food, onAddToCart = () => {}, onQuickRate = () => {} }) => {
    
    // ******** THE ULTIMATE FIX IS HERE (GUARD CLAUSE) ********
    // If the food prop is not valid (undefined, null, etc.), render nothing.
    // This prevents the entire app from crashing if bad data is passed.
    if (!food || !food.food_id) {
        return null; 
    }
    // **********************************************************

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
            className="bg-neutral-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col group h-full shadow-lg hover:shadow-orange-500/10"
        >
            <div className="relative overflow-hidden h-56">
                <Link to={`/food/${food.food_id}`}>
                    <img src={`${API_BASE_URL}${food.image_url}`} alt={food.food_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </Link>
                {food.discount_info && (
                    <div className="absolute top-0 right-0 bg-orange-600 text-white font-bold text-xs px-3 py-1 rounded-bl-lg shadow-xl">
                        -{food.discount_info.value_percentage}% OFF
                    </div>
                )}
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <div>
                    <h3 className="text-xl font-bold text-white mb-2 truncate" title={food.food_name}>{food.food_name}</h3>
                    <div className="flex items-center gap-2 mb-3 h-5" title={isLoggedIn ? 'Click a star to rate!' : 'Log in to rate'}>
                        {isLoggedIn ? renderInteractiveStars() : renderStars(food.average_rating)}
                        <span className="text-xs text-gray-400">({parseFloat(food.average_rating).toFixed(1)})</span>
                    </div>
                </div>
                <p className="text-gray-400 text-sm flex-grow mb-4 line-clamp-2">{food.description}</p>
                <div className="flex justify-between items-center mt-auto">
                    {food.discount_info ? (
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-orange-500">${food.discount_info.discounted_price}</p>
                            <p className="text-lg text-gray-500 line-through">${food.original_price}</p>
                        </div>
                    ) : <p className="text-2xl font-bold text-orange-500">{food.price}</p>}
                    <button onClick={(e) => onAddToCart(e, food.food_id)} className="bg-white text-black p-3 rounded-full text-lg transform group-hover:bg-orange-500 group-hover:text-white group-hover:scale-110 transition-all" aria-label="Add to cart"><FaShoppingCart /></button>
                </div>
            </div>
        </motion.div>
    );
};

export default FoodCard;