import React from 'react';
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./Components/Layout/Layout";
import Home from "./Pages/Home/Home";
import Cart from "./Pages/Cart/Cart";
import Login from './Pages/Login/Login';
import Register from './Pages/Register/Register';
import Categories from './Pages/Categories/Categories';
import Reservation from './Pages/Reservation/Reservation';
import MenuPage from './Pages/MenuPage/MenuPage';
import SpecialOffersPage from './Pages/SpecialOffersPage/SpecialOffersPage';
import FoodDetailPage from './Pages/FoodDetailPage/FoodDetailPage';
import CheckoutPage from './Pages/CheckoutPage/CheckoutPage';
import MyOrdersPage from './Pages/MyOrdersPage/MyOrdersPage';
import OrderDetailsPage from './Pages/OrderDetailsPage/OrderDetailsPage';
import OAuth2Callback from './Pages/OAuth2Callback/OAuth2Callback'; 

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/oauth2callback" element={<OAuth2Callback />} /> {/* <<<<< */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/home" />} />
        <Route path="home" element={<Home />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="offers" element={<SpecialOffersPage />} />
        <Route path="categories" element={<Categories />} />
        <Route path="reservations" element={<Reservation />} />
        <Route path="cart" element={<Cart />} />
        <Route path="food/:id" element={<FoodDetailPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="orders" element={<MyOrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage/>} />
      </Route>
    </Routes>
  );
};

export default App;
