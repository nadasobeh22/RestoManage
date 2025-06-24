import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronRight } from 'react-icons/fa';
import axios from 'axios';

// Animation variants for Framer Motion for a cleaner look
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
};

// Main Component
const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/categories');
        if (response.data && Array.isArray(response.data.data)) {
          const categoriesWithDesc = response.data.data.map(cat => ({
            ...cat,
            description: `Explore our delicious and fresh options in the ${cat.name} category.`,
          }));
          setCategories(categoriesWithDesc);
          if (categoriesWithDesc.length > 0) {
            setActiveCategory(categoriesWithDesc[0]);
          }
        } else {
          throw new Error('API response is not in the expected format.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setTimeout(() => setLoading(false), 500); 
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <SkeletonLoader />;
  if (error) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 text-2xl p-4">Error: {error}</div>;

  return (
    // THEME CHANGE: Background changed to 'bg-black'
    <section className="bg-black text-white min-h-screen w-full pt-24 overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row">
          <aside className="w-full md:w-1/4 p-4 md:p-8">
            <div className="md:sticky md:top-28">
              <motion.h2 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl font-bold text-white mb-8 pl-3"
              >
                Categories
              </motion.h2>
              <motion.ul 
                className="space-y-2"
                variants={listVariants}
                initial="hidden"
                animate="visible"
              >
                {categories.map(category => (
                  <motion.li key={category.category_id} variants={itemVariants} className="relative">
                    <button
                      onClick={() => setActiveCategory(category)}
                      className={`w-full text-left text-lg font-medium p-3 rounded-lg transition-colors duration-300 flex items-center justify-between ${
                        activeCategory?.category_id === category.category_id 
                          ? 'text-white' 
                          : 'text-gray-400 hover:bg-neutral-800/60 hover:text-white'
                      }`}
                    >
                      {category.name}
                      <AnimatePresence>
                        {activeCategory?.category_id === category.category_id &&
                          // THEME CHANGE: Icon color changed to 'text-orange-500'
                          <motion.div layoutId="icon-indicator" className="text-orange-500"><FaChevronRight size="0.8em" /></motion.div>
                        }
                      </AnimatePresence>
                    </button>
                    {activeCategory?.category_id === category.category_id && (
                      // THEME CHANGE: Active indicator colors changed to match Login page
                      <motion.div 
                        layoutId="active-indicator" 
                        className="absolute inset-0 bg-orange-600/20 border-l-2 border-orange-500 rounded-lg -z-10"
                      />
                    )}
                  </motion.li>
                ))}
              </motion.ul>
            </div>
          </aside>

          <main className="w-full md:w-3/4 p-4 flex items-center">
            <AnimatePresence mode="wait">
              {activeCategory && (
                <motion.div
                  key={activeCategory.category_id}
                  className="w-full"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                >
                  <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative shadow-2xl shadow-black/50">
                    <motion.img 
                      src={activeCategory.image_url} 
                      alt={activeCategory.name} 
                      className="absolute inset-0 w-full h-full object-cover" 
                      initial={{ scale: 1.15 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-12 text-white">
                      <motion.h1 variants={contentVariants} initial="hidden" animate="visible" className="text-5xl lg:text-7xl font-bold font-serif">{activeCategory.name}</motion.h1>
                      <motion.p variants={contentVariants} initial="hidden" animate="visible" transition={{delay: 0.1}} className="mt-4 text-lg lg:text-xl max-w-lg text-gray-300">
                        {activeCategory.description}
                      </motion.p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </section>
  );
};

// --- Skeleton Loader Component ---
const SkeletonLoader = () => (
    // THEME CHANGE: Background changed to 'bg-black'
    <div className="min-h-screen bg-black w-full pt-24">
        <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row animate-pulse">
                <aside className="w-full md:w-1/4 p-4 md:p-8">
                    <div className="h-8 bg-neutral-800 rounded-md w-3/4 mb-8"></div>
                    <div className="space-y-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-12 bg-neutral-800 rounded-lg"></div>
                        ))}
                    </div>
                </aside>
                <main className="w-full md:w-3/4 p-4 flex items-center">
                    <div className="w-full aspect-[16/9] bg-neutral-800 rounded-2xl"></div>
                </main>
            </div>
        </div>
    </div>
);

export default Categories;