import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext.jsx'; 
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));
const googleClientId = "1090853395154-18vp7oe2vsr6v7hojaggbiirov3b3icu.apps.googleusercontent.com";


root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <CartProvider>
          <App />
          <Toaster position="top-center" reverseOrder={false} />
        </CartProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);