import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartTotalPrice, setCartTotalPrice] = useState('0.00 $');
    const [cartSubtotal, setCartSubtotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchCartItems = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setCartItems([]);
            setCartTotalPrice('0.00 $');
            setCartSubtotal(0);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/cart/showCart`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                const items = response.data.data.cart_items || [];
                setCartItems(items);
                setCartTotalPrice(response.data.data.total_price || '0.00 $');
                const subtotal = items.reduce((total, item) => {
                    const price = parseFloat(String(item.food_price).replace(/[^0-9.]/g, ''));
                    return total + (price * item.quantity);
                }, 0);
                setCartSubtotal(subtotal);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
            setCartItems([]);
            setCartTotalPrice('0.00 $');
            setCartSubtotal(0);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if(token) fetchCartItems(); else setLoading(false);
        
        window.addEventListener('focus', fetchCartItems);
        window.addEventListener('storage', fetchCartItems);
        return () => {
            window.removeEventListener('focus', fetchCartItems);
            window.removeEventListener('storage', fetchCartItems);
        };
    }, [fetchCartItems]);

    const addToCart = async (foodId, quantity) => {
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Please log in to add items to your cart.");
            navigate('/login');
            return;
        }
        const promise = axios.post(`${API_BASE_URL}/cart/addToCart`, { food_id: foodId, quantity }, { headers: { Authorization: `Bearer ${token}` } });
        toast.promise(promise, {
            loading: 'Adding to cart...',
            success: (res) => { fetchCartItems(); return res.data.message || 'Item added!'; },
            error: (err) => err.response?.data?.message || 'Could not add item.'
        });
    };

    const updateItemQuantity = async (cartItemId, quantity) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        if (quantity < 1) return removeFromCart(cartItemId);
        try {
            await axios.patch(`${API_BASE_URL}/cart/updateItemCart/${cartItemId}`, { quantity }, { headers: { Authorization: `Bearer ${token}` } });
            fetchCartItems();
        } catch (error) {
            toast.error("Could not update quantity.");
        }
    };

    const removeFromCart = async (cartItemId) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            await axios.delete(`${API_BASE_URL}/cart/deleteItemCart/${cartItemId}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchCartItems();
            toast.success("Item removed from cart.");
        } catch (error) {
            toast.error("Could not remove item.");
        }
    };
    
    const applyDiscountCode = async (discountCode) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        const promise = axios.post(`${API_BASE_URL}/cart/applyDiscountCode`, { discount_code: discountCode }, { headers: { Authorization: `Bearer ${token}` } });
        toast.promise(promise, {
            loading: 'Applying discount...',
            success: (res) => {
                fetchCartItems();
                return res.data.message || 'Discount applied!';
            },
            error: (err) => err.response?.data?.message || 'Invalid discount code.'
        });
    };

    const clearCart = () => {
        setCartItems([]);
        setCartTotalPrice('0.00 $');
        setCartSubtotal(0);
    };

    const value = {
        cartItems,
        cartTotalPrice,
        cartSubtotal,
        loading,
        addToCart,
        updateItemQuantity,
        removeFromCart,
        applyDiscountCode,
        clearCart,
        cartItemCount: cartItems.length,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};