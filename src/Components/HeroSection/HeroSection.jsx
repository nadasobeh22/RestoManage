import React from 'react';
import { Link } from 'react-router-dom';
import 'animate.css';
import photo from '../../assets/images/dawnlowd.png'
const HeroSection = () => {

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10"></div>
      
      <img
        src={photo}
        alt="A vibrant and delicious dish prepared by a chef"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />

      <div className="relative z-20 h-full flex items-center justify-center lg:justify-start text-center lg:text-left text-white p-4">
        <div className="max-w-2xl lg:ml-12 xl:ml-24">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold font-serif text-white animate__animated animate__fadeInDown tracking-tight drop-shadow-lg">
            Craveable Classics, Modern Taste
          </h1>
          <p className="mt-5 text-lg sm:text-xl md:text-2xl font-light text-gray-200 animate__animated animate__fadeInUp animate__delay-1s tracking-wide drop-shadow-md">
             Explore our diverse menu, from hearty burgers to exquisite main courses. Your next favorite dish awaits.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate__animated animate__fadeIn animate__delay-2s">
            <Link to="/categories">
              <button className="w-full sm:w-auto px-8 py-3 bg-orange-600 text-white text-lg font-semibold rounded-lg hover:bg-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                Explore Menu
              </button>
            </Link>
            <Link to="/reservations">
              <button className="w-full sm:w-auto px-8 py-3 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                Book a Table
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;