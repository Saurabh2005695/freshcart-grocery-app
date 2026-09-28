import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function StickyCartBar({ currentView }) {
  const { cartCount, grandTotal, setIsCartDrawerOpen } = useCart();

  // Don't show if empty or currently on checkout/success/admin pages
  if (cartCount === 0 || currentView === 'checkout' || currentView === 'success' || currentView?.startsWith('admin')) {
    return null;
  }

  return (
    <div
      className="sticky-cart-bar"
      onClick={() => setIsCartDrawerOpen(true)}
      role="button"
      tabIndex={0}
    >
      <div className="sticky-cart-left">
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: 10,
            padding: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ShoppingBag size={20} color="#ffffff" />
        </div>
        <div>
          <div className="sticky-cart-qty">{cartCount} {cartCount === 1 ? 'item' : 'items'} in cart</div>
          <div className="sticky-cart-price">₹{grandTotal}</div>
        </div>
      </div>

      <div className="sticky-cart-action">
        <span>View Cart</span>
        <ArrowRight size={18} />
      </div>
    </div>
  );
}
