import React, { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import { FaUtensils, FaRegThumbsUp, FaRegSmile } from 'react-icons/fa';

// --- Helper Component (no changes needed here) ---
const AnimatedCounter = ({ to }) => {
    const nodeRef = useRef();
    const isInView = useInView(nodeRef, { once: true, margin: "-100px" });

    useEffect(() => {
        if (isInView) {
            const node = nodeRef.current;
            const controls = animate(0, to, {
                duration: 2,
                ease: 'easeOut',
                onUpdate(value) { node.textContent = Math.round(value); }
            });
            return () => controls.stop();
        }
    }, [isInView, to]);

    return <span ref={nodeRef} />;
};


// --- Main Responsive Component ---
const AboutUs = () => {
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ['start end', 'end start'],
    });

    const imageY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']); // Reduced parallax effect slightly for better feel

    const stats = [
        { icon: <FaUtensils />, value: 50, label: "Authentic Recipes" },
        { icon: <FaRegThumbsUp />, value: 20, label: "Years of Experience" },
        { icon: <FaRegSmile />, value: 10000, label: "Happy Guests" }
    ];

    return (
        // RESPONSIVE CHANGE: Removed fixed vh height, using responsive padding instead
        <section ref={targetRef} className="relative bg-black py-20 sm:py-24 md:py-32 px-4 overflow-hidden">
            {/* Background Image with Parallax */}
            <motion.div
                className="absolute inset-0 z-0"
                style={{ y: imageY }}
            >
                <img
                    src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop"
                    alt="Our Restaurant Kitchen"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70"></div>
            </motion.div>

            {/* Content Container */}
            <div className="relative z-10 container mx-auto flex flex-col justify-center items-center text-center text-white">
                
                {/* Main Text Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    // RESPONSIVE CHANGE: Responsive padding
                    className="bg-black/50 backdrop-blur-md border border-white/10 p-6 sm:p-8 md:p-12 rounded-2xl max-w-3xl"
                >
                    {/* RESPONSIVE CHANGE: Responsive font sizes */}
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif">
                        Our Culinary <span className="text-orange-500">Story</span>
                    </h2>
                    {/* RESPONSIVE CHANGE: Responsive font sizes */}
                    <p className="text-base sm:text-lg text-gray-300 mt-6 leading-relaxed">
                        Founded on a passion for authentic flavors and the finest ingredients, RestoManage is more than just a place to eat—it's an experience. We believe in community, quality, and creating unforgettable moments, one plate at a time.
                    </p>
                </motion.div>

                {/* Animated Stats Section */}
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.5 }}
                    variants={{
                        visible: { transition: { staggerChildren: 0.2 } }
                    }}
                    // RESPONSIVE CHANGE: Responsive margin and gap
                    className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 w-full max-w-4xl"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={{
                                hidden: { opacity: 0, y: 30 },
                                visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } }
                            }}
                            className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-700 p-6 rounded-xl flex flex-col items-center"
                        >
                            <div className="text-orange-500 mb-3">{React.cloneElement(stat.icon, { size: 36 })}</div>
                            {/* RESPONSIVE CHANGE: Responsive font sizes */}
                            <h3 className="text-3xl sm:text-4xl font-bold">
                                <AnimatedCounter to={stat.value} />+
                            </h3>
                            <p className="text-gray-400 mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default AboutUs;