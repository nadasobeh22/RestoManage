import React from 'react';
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FooterLink = ({ children, to = "#" }) => (
    <li>
        <Link to={to} className="relative text-neutral-400 hover:text-white transition-colors duration-300 group">
            {children}
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
        </Link>
    </li>
);

const Footer = () => {
  return (
    <motion.footer 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        className="bg-black border-t border-orange-500/30"
    >
      {/* Main content section of the footer */}
      <div className="container px-5 py-16 mx-auto flex md:items-center lg:items-start md:flex-row md:flex-nowrap flex-wrap flex-col">
        <motion.div variants={{hidden:{opacity:0, x:-20}, visible:{opacity:1, x:0}}} className="w-64 flex-shrink-0 md:mx-0 mx-auto text-center md:text-left">
          <h3 className="font-bold text-3xl text-white">
            Resto<span className='text-orange-500'>Manage</span>
          </h3>
          <p className="mt-2 text-sm text-neutral-400">Your ultimate restaurant management system.</p>
        </motion.div>

        <div className="flex-grow flex flex-wrap md:pl-20 -mb-10 md:mt-0 mt-10 md:text-left text-center justify-center">
          <motion.div variants={{hidden:{opacity:0, y:20}, visible:{opacity:1, y:0}}} className="lg:w-1/4 md:w-1/2 w-full px-4">
            <h2 className="title-font font-medium text-white tracking-widest text-sm mb-4">Our Services</h2>
            <ul className="list-none mb-10 space-y-3"><FooterLink>Order Management</FooterLink><FooterLink>Customer Dashboard</FooterLink><FooterLink>Menu Customization</FooterLink><FooterLink>Reservation System</FooterLink></ul>
          </motion.div>

          <motion.div variants={{hidden:{opacity:0, y:20}, visible:{opacity:1, y:0}}} className="lg:w-1/4 md:w-1/2 w-full px-4">
            <h2 className="title-font font-medium text-white tracking-widest text-sm mb-4">About Us</h2>
            <ul className="list-none mb-10 space-y-3"><FooterLink>Our Story</FooterLink><FooterLink>Privacy Policy</FooterLink><FooterLink>Terms & Conditions</FooterLink><FooterLink>Careers</FooterLink></ul>
          </motion.div>

          <motion.div variants={{hidden:{opacity:0, y:20}, visible:{opacity:1, y:0}}} className="lg:w-1/4 md:w-1/2 w-full px-4">
            <h2 className="title-font font-medium text-white tracking-widest text-sm mb-4">Contact</h2>
            <ul className="list-none mb-10 space-y-3"><FooterLink>Customer Support</FooterLink><FooterLink to="tel:+18001234567">+1 (800) 123-4567</FooterLink><FooterLink to="mailto:support@restomanage.com">support@restomanage.com</FooterLink></ul>
          </motion.div>
        </div>
      </div>

      {/* Copyright section with the separator line */}
      {/* ***** THE CHANGE IS HERE ***** */}
      <div className="border-t border-orange-500/30">
        <div className="container mx-auto py-8 px-5 flex flex-col items-center gap-4">
          <p className="text-neutral-500 text-sm text-center">&copy; {new Date().getFullYear()} RestoManage — All Rights Reserved.</p>
          <span className="inline-flex justify-center space-x-5">
            <motion.a href="#" whileHover={{ scale: 1.2, color: '#f97316' }} className="text-neutral-500 transition hover:text-orange-500"><FaFacebookF /></motion.a>
            <motion.a href="#" whileHover={{ scale: 1.2, color: '#f97316' }} className="text-neutral-500 transition hover:text-orange-500"><FaInstagram /></motion.a>
            <motion.a href="#" whileHover={{ scale: 1.2, color: '#f97316' }} className="text-neutral-500 transition hover:text-orange-500"><FaTwitter /></motion.a>
            <motion.a href="#" whileHover={{ scale: 1.2, color: '#f97316' }} className="text-neutral-500 transition hover:text-orange-500"><FaLinkedin /></motion.a>
          </span>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;