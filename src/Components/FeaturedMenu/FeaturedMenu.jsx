import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import FoodCard from '../FoodCard/FoodCard'; // Import the reusable component

const API_BASE_URL = 'http://127.0.0.1:8000';

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

const FeaturedMenu = () => {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedFoods = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/api/foods/filter`);
                if (response.data && response.data.data) {
                    // Get the first 6 items for the homepage
                    setFoods(response.data.data.slice(0, 6));
                }
            } catch (error) {
                console.error("Failed to fetch featured foods:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchFeaturedFoods();
    }, []);

    if (loading) {
        return (
            <div className="text-center py-20">
                <p className="text-white text-lg">Loading Signature Dishes...</p>
            </div>
        );
    }
    
    return (
        <section className="bg-black py-24 px-4">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white">
                        Our Signature <span className="text-orange-500">Dishes</span>
                    </h2>
                    <p className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto">
                        Handpicked by our chef, these are the favorites you don't want to miss.
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.1 }}
                >
                    {foods.map(food => (
                        <FoodCard key={food.food_id} food={food} />
                    ))}
                </motion.div>

                <div className="text-center mt-16">
                    <Link to="/menu">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-10 py-4 bg-orange-600 text-white text-lg font-semibold rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-orange-500/30"
                        >
                            Show More
                        </motion.button>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedMenu;