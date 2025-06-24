import React from 'react'
import HeroSection from '../../Components/HeroSection/HeroSection'
import Services from '../../Components/Services/Services'
import AboutUs from '../../Components/AboutUs/AboutUs'
import CTA from '../../Components/CTA/CTA'
import FoodCard from '../../Components/FoodCard/FoodCard'
import FeaturedMenu from '../../Components/FeaturedMenu/FeaturedMenu';


const Home = () => {
  return (
     <>
     <HeroSection/>
      <Services/>
      <FoodCard/>
      <FeaturedMenu/>
      <AboutUs/>
      <CTA/>
     </>
  )
}

export default Home
