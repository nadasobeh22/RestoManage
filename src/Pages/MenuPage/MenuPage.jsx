import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaChevronLeft, FaChevronRight, FaFilter, FaTimes, FaTags, FaStar } from 'react-icons/fa';
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

    const originalPrice = parseFloat(String(food.price).replace(/[^0-9.]/g, ''));
    const finalPrice = food.price_after_discounts ? parseFloat(String(food.price_after_discounts).replace(/[^0-9.]/g, '')) : originalPrice;
    const hasDiscount = finalPrice < originalPrice;

    return (
        <motion.div 
            variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }} 
            className="bg-neutral-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col group h-full shadow-lg hover:shadow-orange-500/10"
        >
            <div className="relative overflow-hidden h-56">
                <Link to={`/food/${food.food_id}`}>
                    <img src={`${API_BASE_URL}${food.image_url}`} alt={food.food_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </Link>
                {hasDiscount && (
                    <div className="absolute top-0 right-0 bg-orange-600 text-white font-bold text-xs px-3 py-1 rounded-bl-lg shadow-xl">
                        SALE
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
                    {hasDiscount ? (
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-orange-500">${finalPrice.toFixed(2)}</p>
                            <p className="text-lg text-gray-500 line-through">${originalPrice.toFixed(2)}</p>
                        </div>
                    ) : (
                        <p className="text-2xl font-bold text-orange-500">${originalPrice.toFixed(2)}</p>
                    )}
                    <button onClick={(e) => onAddToCart(e, food.food_id)} className="bg-white text-black p-3 rounded-full text-lg transform group-hover:bg-orange-500 group-hover:text-white group-hover:scale-110 transition-all" aria-label="Add to cart"><FaShoppingCart /></button>
                </div>
            </div>
        </motion.div>
    );
};


const MenuPage = () => {
    const [allFoods, setAllFoods] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [filters, setFilters] = useState({ category_id: '', min_price: '', max_price: '' });
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const fetchAllFoods = async (page = 1, appliedFilters = filters) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ page });
            if (appliedFilters.category_id) params.append('category_id', appliedFilters.category_id);
            if (appliedFilters.min_price) params.append('min_price', appliedFilters.min_price);
            if (appliedFilters.max_price) params.append('max_price', appliedFilters.max_price);
            
            const response = await axios.get(`${API_BASE_URL}/api/foods/filter?${params.toString()}`);
            if (response.data && response.data.data) {
                setAllFoods(response.data.data);
                setMeta(response.data.meta);
            } else {
                setAllFoods([]);
                setMeta(null);
            }
        } catch (err) {
            setError('Failed to load menu items. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const categoriesResponse = await axios.get(`${API_BASE_URL}/api/categories`);
                setCategories(categoriesResponse.data.data || []);
            } catch (error) {
                console.error("Failed to fetch categories for filter", error);
            }
            await fetchAllFoods();
        };
        fetchInitialData();
    }, []);

    const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleApplyFilters = () => fetchAllFoods(1, filters);
    const handleResetFilters = () => {
        const resetState = { category_id: '', min_price: '', max_price: '' };
        setFilters(resetState);
        fetchAllFoods(1, resetState);
    };
    const handlePageChange = (page) => {
        if (page && meta && page >= 1 && page <= meta.last_page) {
            fetchAllFoods(page, filters);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
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

        const originalFoods = [...allFoods];
        const updatedUiFoods = allFoods.map(food => 
            food.food_id === foodId ? { ...food, average_rating: rating.toString() } : food
        );
        setAllFoods(updatedUiFoods);

        try {
            await axios.post(`${API_BASE_URL}/api/review/addReviews`, 
                { food_id: foodId, rating }, 
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Thank you for your rating!');
        } catch (error) {
            setAllFoods(originalFoods);
            toast.error(error.response?.data?.message || 'Could not submit rating.');
        }
    };

    const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

    return (
        <div className="bg-black text-white min-h-screen pt-24">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                    <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">Our <span className="text-orange-500">Exquisite Menu</span></h1>
                    <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">Explore our curated selection of dishes, crafted with the finest ingredients.</p>
                </motion.div>
                
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <Link to="/offers" className="block mb-12 bg-neutral-900 border border-orange-500/30 rounded-2xl p-6 group hover:bg-neutral-800 transition-colors">
                        <div className="flex items-center justify-center text-center">
                            <FaTags className="text-orange-500 text-3xl mr-4" />
                            <div>
                                <h3 className="font-bold text-white text-xl">Looking for a deal?</h3>
                                <p className="text-orange-400 group-hover:underline">Check out our Special Offers!</p>
                            </div>
                        </div>
                    </Link>
                </motion.div>
                
                <div className="bg-neutral-900 border border-gray-800 rounded-2xl p-6 mb-12 shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end">
                        <div className="md:col-span-2 lg:col-span-2"><label className="block text-sm mb-2 text-gray-400">Category</label><select name="category_id" value={filters.category_id} onChange={handleFilterChange} className="w-full rounded-lg bg-neutral-800 border-gray-700 p-3 text-white"><option value="">All Categories</option>{categories.map(cat => <option key={cat.category_id} value={cat.category_id}>{cat.name}</option>)}</select></div>
                        <div><label className="block text-sm mb-2 text-gray-400">Min Price</label><input type="number" name="min_price" value={filters.min_price} onChange={handleFilterChange} placeholder="$0" className="w-full rounded-lg bg-neutral-800 border-gray-700 p-3 text-white" /></div>
                        <div><label className="block text-sm mb-2 text-gray-400">Max Price</label><input type="number" name="max_price" value={filters.max_price} onChange={handleFilterChange} placeholder="$100" className="w-full rounded-lg bg-neutral-800 border-gray-700 p-3 text-white" /></div>
                        <div className="flex gap-2"><button onClick={handleApplyFilters} className="w-full bg-orange-600 hover:bg-orange-700 p-3 rounded-lg flex justify-center text-white"><FaFilter /></button><button onClick={handleResetFilters} title="Reset Filters" className="w-full bg-neutral-700 hover:bg-neutral-600 p-3 rounded-lg flex justify-center text-white"><FaTimes /></button></div>
                    </div>
                </div>

                {loading ? <p className="text-center py-20">Loading Menu...</p>
                : error ? <div className="text-center py-20 text-red-400">{error}</div>
                : (
                    <>
                        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {allFoods.length === 0 ? <p className="col-span-full text-center py-10 text-gray-400">No items match your filter criteria.</p> : allFoods.map(food => (
                                <FoodCard key={food.food_id} food={food} onAddToCart={handleQuickAddToCart} onQuickRate={handleQuickRate} />
                            ))}
                        </motion.div>
                        
                        {!loading && !error && meta && meta.last_page > 1 && (
                            <div className="flex justify-center items-center mt-16 space-x-2">
                                <button onClick={() => handlePageChange(meta.current_page - 1)} disabled={meta.current_page === 1} className="p-3 disabled:opacity-50 hover:bg-neutral-800 rounded-full transition-colors"><FaChevronLeft /></button>
                                {meta.links.filter(link => !isNaN(link.label)).map(link => <button key={link.label} onClick={() => handlePageChange(Number(link.label))} className={`px-4 py-2 rounded-lg text-sm transition-colors ${link.active ? 'bg-orange-600 font-bold text-white' : 'hover:bg-neutral-800'}`}>{link.label}</button>)}
                                <button onClick={() => handlePageChange(meta.current_page + 1)} disabled={meta.current_page === meta.last_page} className="p-3 disabled:opacity-50 hover:bg-neutral-800 rounded-full transition-colors"><FaChevronRight /></button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default MenuPage;