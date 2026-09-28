import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/api';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('freshcart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('freshcart_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('freshcart_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedCoupon) {
      localStorage.setItem('freshcart_coupon', JSON.stringify(appliedCoupon));
    } else {
      localStorage.removeItem('freshcart_coupon');
    }
  }, [appliedCoupon]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Add Item to Cart
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product_id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          product_id: product.id,
          name: product.name,
          price: product.price,
          mrp: product.mrp,
          unit: product.unit,
          image: product.image,
          stock: product.stock,
          quantity: 1
        }
      ];
    });
    showToast(`Added "${product.name}" to cart!`);
  };

  // Update Quantity
  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product_id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  // Remove Item
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product_id !== productId));
    showToast('Item removed from cart', 'info');
  };

  // Clear Cart
  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Subtotal & Counts
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalMrp = cart.reduce((sum, item) => sum + (item.mrp || item.price) * item.quantity, 0);
  const savings = Math.max(0, totalMrp - subtotal);

  // Free delivery logic: Free if >= 299, else 29
  const freeDeliveryThreshold = 299;
  const deliveryFee = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : 29;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);

  // Coupon Discount
  let couponDiscount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (subtotal < (appliedCoupon.min_order_amount || 0)) {
      // invalid if subtotal dropped below min requirement
      couponDiscount = 0;
    } else if (appliedCoupon.discount_type === 'fixed') {
      couponDiscount = Math.min(appliedCoupon.discount_value, subtotal);
    } else if (appliedCoupon.discount_type === 'percent') {
      couponDiscount = Math.min(100, Math.round((subtotal * appliedCoupon.discount_value) / 100));
    }
  }

  const grandTotal = Math.max(0, subtotal - couponDiscount + deliveryFee);

  // Coupon Application
  const applyCoupon = async (code) => {
    try {
      const res = await api.validateCoupon(code, subtotal);
      setAppliedCoupon(res);
      showToast(res.message, 'success');
      return { success: true, message: res.message };
    } catch (err) {
      showToast(err.message, 'error');
      return { success: false, message: err.message };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  // Quick lookup helper
  const getItemQuantity = (productId) => {
    const item = cart.find((i) => i.product_id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        totalMrp,
        savings,
        deliveryFee,
        freeDeliveryThreshold,
        amountNeededForFreeDelivery,
        appliedCoupon,
        couponDiscount,
        grandTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        getItemQuantity,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        toastMessage,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
