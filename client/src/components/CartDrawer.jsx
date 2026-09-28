import React, { useState } from 'react';
import { X, Trash2, Tag, ShoppingBag, ArrowRight, CheckCircle, Truck, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartDrawer({ onProceedToCheckout }) {
  const {
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
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    isCartDrawerOpen,
    setIsCartDrawerOpen
  } = useCart();

  const { isAuthenticated, openAuthModal } = useAuth();
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = async (codeToApply) => {
    const code = codeToApply || couponInput;
    if (!code || !code.trim()) return;
    setIsApplyingCoupon(true);
    await applyCoupon(code.trim().toUpperCase());
    setIsApplyingCoupon(false);
    setCouponInput('');
  };

  const handleCheckoutClick = () => {
    setIsCartDrawerOpen(false);
    if (!isAuthenticated) {
      openAuthModal('login', onProceedToCheckout);
    } else {
      onProceedToCheckout();
    }
  };

  const deliveryProgressPercent = Math.min(100, Math.round((subtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="drawer-overlay" onClick={() => setIsCartDrawerOpen(false)}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        {/* Drawer Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={20} color="#0c831f" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              My Cart ({cartCount} {cartCount === 1 ? 'item' : 'items'})
            </h2>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Free Delivery Goal Bar */}
        <div style={{ background: '#f8fafc', padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
              <Truck size={16} color={deliveryFee === 0 ? '#0c831f' : '#ea580c'} />
              <span>
                {deliveryFee === 0
                  ? 'You unlocked FREE Delivery!'
                  : `Add ₹${amountNeededForFreeDelivery} more for FREE Delivery`}
              </span>
            </div>
            <span style={{ fontWeight: 700, color: deliveryFee === 0 ? '#0c831f' : '#64748b' }}>
              ₹{subtotal}/₹{freeDeliveryThreshold}
            </span>
          </div>
          <div style={{ width: '100%', height: 6, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
            <div
              style={{
                width: `${deliveryProgressPercent}%`,
                height: '100%',
                background: deliveryFee === 0 ? '#0c831f' : '#ea580c',
                borderRadius: 999,
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Drawer Body / Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#64748b' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, color: '#94a3b8' }}>
                <ShoppingBag size={54} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
                Your cart is empty
              </h3>
              <p style={{ fontSize: '0.85rem', marginBottom: 20 }}>
                Explore fresh fruits, daily milk, crispy snacks & more!
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setIsCartDrawerOpen(false)}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {cart.map((item) => (
                <div
                  key={item.product_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px',
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 8, background: '#f1f5f9' }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={item.name}
                    >
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0' }}>
                      {item.unit}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                        ₹{item.price * item.quantity}
                      </span>
                      {item.mrp > item.price && (
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                          ₹{item.mrp * item.quantity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="stepper-btn-group" style={{ height: 28 }}>
                    <button
                      className="stepper-btn"
                      style={{ width: 26, height: 28 }}
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="stepper-count" style={{ minWidth: 20, fontSize: '0.8rem' }}>
                      {item.quantity}
                    </span>
                    <button
                      className="stepper-btn"
                      style={{ width: 26, height: 28 }}
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}

              {/* Coupon Section */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px dashed #cbd5e1',
                  borderRadius: 12,
                  padding: 12,
                  marginTop: 10
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: '0.85rem', marginBottom: 8 }}>
                  <Tag size={16} color="#0c831f" />
                  <span>Avail Coupons & Offers</span>
                </div>

                {appliedCoupon ? (
                  <div
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: 8,
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: '#065f46', fontSize: '0.85rem' }}>
                        {appliedCoupon.code} Applied!
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#047857' }}>
                        You saved ₹{couponDiscount} with this code
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                      <input
                        type="text"
                        placeholder="Enter promo code"
                        className="form-input"
                        style={{ padding: '8px 12px', fontSize: '0.85rem', textTransform: 'uppercase' }}
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={isApplyingCoupon || !couponInput}
                        onClick={() => handleApplyCoupon()}
                      >
                        Apply
                      </button>
                    </div>

                    {/* Quick Coupon Chips */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span
                        onClick={() => handleApplyCoupon('WELCOME50')}
                        style={{
                          fontSize: '0.72rem',
                          background: '#e8f7ec',
                          color: '#0c831f',
                          border: '1px solid #bbf7d0',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        WELCOME50 (₹50 OFF)
                      </span>
                      <span
                        onClick={() => handleApplyCoupon('SUPER10')}
                        style={{
                          fontSize: '0.72rem',
                          background: '#fffbeb',
                          color: '#b45309',
                          border: '1px solid #fde68a',
                          padding: '3px 8px',
                          borderRadius: 6,
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        SUPER10 (10% OFF)
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Bill Details */}
              <div
                style={{
                  background: '#f8fafc',
                  borderRadius: 12,
                  padding: 14,
                  border: '1px solid #e2e8f0',
                  marginTop: 6
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: 10, color: '#0f172a' }}>
                  Bill Summary
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6, color: '#64748b' }}>
                  <span>Item Total (MRP: ₹{totalMrp})</span>
                  <span>₹{subtotal}</span>
                </div>

                {savings > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6, color: '#0c831f', fontWeight: 600 }}>
                    <span>Product Discount</span>
                    <span>- ₹{savings}</span>
                  </div>
                )}

                {appliedCoupon && couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6, color: '#0c831f', fontWeight: 600 }}>
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>- ₹{couponDiscount}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8, color: '#64748b' }}>
                  <span>Delivery Partner Fee</span>
                  <span>{deliveryFee === 0 ? <span style={{ color: '#0c831f', fontWeight: 700 }}>FREE</span> : `₹${deliveryFee}`}</span>
                </div>

                <div
                  style={{
                    borderTop: '1px solid #cbd5e1',
                    paddingTop: 10,
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 800,
                    fontSize: '1.05rem',
                    color: '#0f172a'
                  }}
                >
                  <span>Grand Total</span>
                  <span>₹{grandTotal}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer / Checkout CTA */}
        {cart.length > 0 && (
          <div
            style={{
              padding: '16px 20px',
              borderTop: '1px solid #e2e8f0',
              background: '#ffffff',
              boxShadow: '0 -4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <button
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '1rem',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              onClick={handleCheckoutClick}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.78rem', opacity: 0.9 }}>{cartCount} items</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>₹{grandTotal}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                <span>Proceed to Checkout</span>
                <ArrowRight size={18} />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
