import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingBasket, FaCalendarAlt, FaCreditCard, FaStar } from 'react-icons/fa';
import ExploreOrder from "../../assets/images/Explore & Order.png"
import Reservations from "../../assets/images/Reservations.png"
import Payments from "../../assets/images/Payments.png"
import Reviews from "../../assets/images/Customer Reviews.png"
const servicesList = [
    { 
        id: 1,
        icon: <FaShoppingBasket />, 
        title: "Explore & Order", 
        description: "A seamless and intuitive online ordering system that guides customers from menu to checkout effortlessly.",
        imageUrl: ExploreOrder 
    },
    { 
        id: 2,
        icon: <FaCalendarAlt />, 
        title: "Easy Reservations", 
        description: "Book tables in an instant. Our system allows customers to make reservations and add special requests with ease.",
        imageUrl: Reservations
    },
    { 
        id: 3,
        icon: <FaCreditCard />, 
        title: "Secure Payments", 
        description: "Integrated with trusted payment gateways for secure, fast transactions with real-time status updates.",
        imageUrl: Payments
    },
    { 
        id: 4,
        icon: <FaStar />, 
        title: "Customer Reviews", 
        description: "Gather valuable feedback and reviews from your customers to continuously improve and grow your reputation.",
        imageUrl: Reviews
    }
];

const Services = () => {
    // Set the first service as active by default
    const [activeService, setActiveService] = useState(servicesList[0]);

    return (
        <section className="bg-black text-white py-24 px-4 overflow-hidden">
            <div className="container mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-white">
                        Why Choose Resto<span className="text-orange-500">Manage</span>?
                    </h2>
                    <p className="text-lg text-gray-400 mt-4 max-w-3xl mx-auto">
                        A complete suite of tools designed to streamline your operations and delight your guests.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[500px]">
                    {/* Left Column: List of Services */}
                    <div className="flex flex-col gap-4">
                        {servicesList.map((service) => (
                            <motion.div
                                key={service.id}
                                onMouseEnter={() => setActiveService(service)}
                                className="p-6 rounded-xl cursor-pointer relative border-2 border-transparent transition-all duration-300"
                                animate={{
                                    borderColor: activeService.id === service.id ? 'rgba(249, 115, 22, 0.5)' : 'rgba(249, 115, 22, 0)',
                                    backgroundColor: activeService.id === service.id ? 'rgba(249, 115, 22, 0.05)' : 'rgba(0, 0, 0, 0)'
                                }}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`transition-colors duration-300 ${activeService.id === service.id ? 'text-orange-500' : 'text-gray-500'}`}>
                                        {React.cloneElement(service.icon, { size: 28 })}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-2xl text-white">{service.title}</h3>
                                        <p className="text-base text-gray-400 mt-1 leading-relaxed">{service.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right Column: Image Display */}
                    <div className="hidden lg:block w-full h-[500px] rounded-2xl overflow-hidden relative shadow-2xl shadow-black/50">
                        <AnimatePresence>
                            <motion.img
                                key={activeService.id}
                                src={activeService.imageUrl}
                                alt={activeService.title}
                                initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                transition={{ duration: 0.5, ease: 'easeInOut' }}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Services;