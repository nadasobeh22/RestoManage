import React, { useState, useEffect, useRef } from 'react';
import { FaShoppingCart, FaBars, FaTimes } from 'react-icons/fa';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../../assets/images/logo.png';
import axios from 'axios';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasScrolled, setHasScrolled] = useState(false);
    const navigate = useNavigate();
    const { cartItemCount } = useCart();

    useEffect(() => {
        const checkToken = () => setIsLoggedIn(!!localStorage.getItem('token'));
        const handleScroll = () => setHasScrolled(window.scrollY > 10);

        handleScroll();
        checkToken();

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('storage', checkToken); // Listen for changes in other tabs

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('storage', checkToken);
        };
    }, []);

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        const API_URL = "http://127.0.0.1:8000/api/user/logout";
        try {
            await axios.post(API_URL, {}, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Server logout failed, logging out client-side.", error);
        } finally {
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            closeMenu();
            navigate('/login');
        }
    };

    const closeMenu = () => setIsMenuOpen(false);

    const navItems = [
        { path: "/home", label: "Home" },
        { path: "/menu", label: "Menu" },
        { path: "/categories", label: "Categories" },
        { path: "/reservations", label: "Reservations" },
        { path: "/offers", label: "Offers" },
        { path: "/orders", label: "My Orders" },
    ];

    const navLinks = (isMobile = false) => (
        navItems.map(item => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              onClick={closeMenu} 
              className="relative text-gray-300 hover:text-orange-500 transition-colors duration-300 py-2"
            >
                {({ isActive }) => (
                    <motion.div whileHover={{ y: -2 }} className="flex flex-col items-center">
                        <span className={isActive ? 'text-orange-500' : ''}>{item.label}</span>
                        {isActive && !isMobile && (
                            <motion.div
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                                layoutId="underline"
                                initial={false}
                                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            />
                        )}
                    </motion.div>
                )}
            </NavLink>
        ))
    );

    return (
        <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${hasScrolled ? 'bg-black/80 backdrop-blur-md shadow-lg' : 'bg-transparent'}`}>
            <div className="container mx-auto flex justify-between items-center py-2 px-4 lg:px-8">
                <Link to="/home">
                    <motion.img 
                        src={logo} 
                        alt="RestoManage Logo"
                        className={`object-contain transition-all duration-300 ${hasScrolled ? 'w-16 h-16' : 'w-20 h-20 lg:w-24 lg:h-24'}`}
                    />
                </Link>
                
                <nav className="hidden lg:flex items-center gap-8 text-lg font-medium">
                    {navLinks()}
                </nav>

                <div className="hidden lg:flex items-center gap-4">
                    {isLoggedIn ? (
                        <motion.button onClick={handleLogout} whileHover={{scale:1.05}} whileTap={{scale:0.95}} className="px-5 py-2 rounded-md font-semibold bg-orange-600 hover:bg-orange-700 transition text-white">Logout</motion.button>
                    ) : (
                        <Link to="/login"><motion.div whileHover={{scale:1.05}} whileTap={{scale:0.95}} className="px-5 py-2 rounded-md font-semibold border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition">Login</motion.div></Link>
                    )}
                    <Link to='/cart' className="relative text-gray-300 hover:text-orange-500 transition p-2">
                        <FaShoppingCart size={24} />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">{cartItemCount}</span>
                        )}
                    </Link>
                </div>

                <div className="lg:hidden">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-2xl text-gray-300" aria-label="Toggle menu">
                        {isMenuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-black/95 backdrop-blur-sm absolute top-full left-0 w-full overflow-hidden"
                    >
                        <motion.nav 
                            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                            initial="hidden"
                            animate="visible"
                            className="flex flex-col items-center gap-6 p-8 text-xl font-medium"
                        >
                            {navItems.map(item => (
                                <motion.div key={item.path} variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}>
                                    <NavLink to={item.path} onClick={closeMenu} className={({ isActive }) => isActive ? 'text-orange-500' : 'text-gray-300'}>{item.label}</NavLink>
                                </motion.div>
                            ))}
                            
                            <div className="flex flex-col items-stretch gap-6 mt-4 w-full max-w-xs">
                                {isLoggedIn ? (
                                    <button onClick={handleLogout} className="text-center px-5 py-3 rounded-md font-semibold bg-orange-600 hover:bg-orange-700 transition text-white">Logout</button>
                                ) : (
                                    <Link to="/login" onClick={closeMenu} className="text-center px-5 py-3 rounded-md font-semibold border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition">Login</Link>
                                )}
                                <Link to='/cart' onClick={closeMenu} className="relative text-gray-300 hover:text-orange-500 transition p-2 mt-2 mx-auto">
                                    <FaShoppingCart size={32} />
                                    {cartItemCount > 0 && (
                                        <span className="absolute -top-1 -right-2 bg-orange-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-black">{cartItemCount}</span>
                                    )}
                                </Link>
                            </div>
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Navbar;