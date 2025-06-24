import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const CTA = () => {
  return (
    <section className="bg-black">
      <div className="container mx-auto px-4 py-24 sm:py-32">
        <motion.div
          className="relative text-center max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold font-serif text-white tracking-tight">
            Ready for an Unforgettable Experience?
          </h2>
          <p className="mt-6 max-w-2xl mx-auto text-lg lg:text-xl text-gray-400">
            Your table is waiting. Our chefs are ready to delight your senses. Reserve your spot or explore our full menu now.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Primary Button */}
            <Link to="/reservations">
              <motion.button 
                className="w-full sm:w-auto px-8 py-3 bg-orange-600 text-white text-lg font-semibold rounded-lg hover:bg-orange-700 transition-colors duration-300 shadow-lg shadow-orange-900/20"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Your Table
              </motion.button>
            </Link>
            {/* Secondary Button */}
            <Link to="/menu">
              <motion.button 
                className="w-full sm:w-auto px-8 py-3 border-2 border-neutral-700 text-gray-300 text-lg font-semibold rounded-lg hover:bg-neutral-800 hover:text-white hover:border-neutral-600 transition-colors duration-300"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Full Menu
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;