import React, { useState } from 'react';
import { MapPin, Clock, CreditCard, Banknote, QrCode, ShieldCheck, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../api/api';

export default function CheckoutPage({ onOrderPlaced, onBackToShopping }) {
  const { user, setUser } = useAuth();
  const {
    cart,
    cartCount,
    subtotal,
    deliveryFee,
    appliedCoupon,
    couponDiscount,
    grandTotal,
    clearCart,
    showToast
  } = useCart();

  // Form states
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [deliverySlot, setDeliverySlot] = useState('Express (30-45 mins)');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // UPI Simulation State
  const [upiId, setUpiId] = useState('');
  const [showUpiModal, setShowUpiModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const deliverySlots = [
    { id: 'Express (30-45 mins)', label: 'Express Delivery', time: '30-45 mins', badge: 'FASTEST' },
    { id: 'Morning (7 AM - 10 AM)', label: 'Morning Slot', time: '7:00 AM - 10:00 AM' },
    { id: 'Afternoon (1 PM - 4 PM)', label: 'Afternoon Slot', time: '1:00 PM - 4:00 PM' },
    { id: 'Evening (6 PM - 9 PM)', label: 'Evening Slot', time: '6:00 PM - 9:00 PM' }
  ];

  const handlePlaceOrder = async (e) => {
    if (e) e.preventDefault();
    setError('');

    if (!deliveryAddress.trim()) {
      setError('Please provide a complete delivery address');
      return;
    }
    if (!customerPhone.trim()) {
      setError('Please provide a valid phone number for delivery updates');
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    // If UPI selected, verify or simulate UPI
    if (paymentMethod === 'UPI' && !upiId.trim()) {
      setShowUpiModal(true);
      return;
    }

    setLoading(true);

    try {
      // 1. Update user profile address in backend if modified
      if (user && (deliveryAddress !== user.address || customerPhone !== user.phone)) {
        try {
          const updatedProfile = await api.updateProfile({
            address: deliveryAddress,
            phone: customerPhone
          });
          setUser(updatedProfile.user);
        } catch {
          // non-blocking
        }
      }

      // 2. Prepare payload
      const orderPayload = {
        items: cart.map((i) => ({ product_id: i.product_id, quantity: i.quantity })),
        customer_phone: customerPhone,
        delivery_address: deliveryAddress,
        delivery_slot: deliverySlot,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        notes: deliveryNotes
      };

      const res = await api.placeOrder(orderPayload);
      clearCart();
      showToast('Order placed successfully!', 'success');
      onOrderPlaced(res.order);
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '24px 16px 60px' }}>
      <button
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: 20 }}
        onClick={onBackToShopping}
      >
        <ArrowLeft size={16} />
        <span>Back to Store</span>
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Form & Options */}
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 8, color: '#0f172a' }}>
            Checkout & Delivery
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 24 }}>
            Review your delivery details and choose your preferred payment method
          </p>

          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 12,
                padding: '12px 16px',
                color: '#b91c1c',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 20
              }}
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Delivery Address & Contact */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: 20,
              border: '1px solid #e2e8f0',
              marginBottom: 20,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#ecfdf5', padding: 8, borderRadius: 10, color: '#0c831f' }}>
                <MapPin size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>1. Delivery Address & Contact</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Where should we deliver your groceries?</p>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Recipient Name *</label>
              <input
                type="text"
                required
                className="form-input"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number (for delivery OTP/updates) *</label>
              <input
                type="tel"
                required
                placeholder="e.g. 9812345678"
                className="form-input"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Delivery Address (House/Flat No, Street, Landmark, Pincode) *</label>
              <textarea
                required
                rows={3}
                placeholder="e.g. Flat 402, Sunshine Heights, Sector 18, Noida - 201301"
                className="form-textarea"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Step 2: Delivery Slot Selection */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: 20,
              border: '1px solid #e2e8f0',
              marginBottom: 20,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#eff6ff', padding: 8, borderRadius: 10, color: '#2563eb' }}>
                <Clock size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>2. Delivery Time Slot</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Choose when you want the delivery</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {deliverySlots.map((slot) => {
                const isSelected = deliverySlot === slot.id;
                return (
                  <div
                    key={slot.id}
                    onClick={() => setDeliverySlot(slot.id)}
                    style={{
                      border: `2px solid ${isSelected ? '#0c831f' : '#e2e8f0'}`,
                      background: isSelected ? '#f0fdf4' : '#ffffff',
                      borderRadius: 12,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? '#0c831f' : '#0f172a' }}>
                        {slot.label}
                      </span>
                      {slot.badge && (
                        <span style={{ background: '#ff6b35', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 5px', borderRadius: 4 }}>
                          {slot.badge}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{slot.time}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Payment Method Selection */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: 16,
              padding: 20,
              border: '1px solid #e2e8f0',
              marginBottom: 20,
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ background: '#fffbeb', padding: 8, borderRadius: 10, color: '#b45309' }}>
                <Banknote size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>3. Payment Method</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Choose your mode of payment</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Cash on Delivery (Primary) */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: `2px solid ${paymentMethod === 'COD' ? '#0c831f' : '#e2e8f0'}`,
                  background: paymentMethod === 'COD' ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                />
                <Banknote size={22} color="#0c831f" />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Cash on Delivery (COD)</span>
                    <span style={{ background: '#0c831f', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>
                      RECOMMENDED
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Pay in cash or UPI when groceries arrive at your doorstep
                  </div>
                </div>
              </label>

              {/* UPI */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: `2px solid ${paymentMethod === 'UPI' ? '#0c831f' : '#e2e8f0'}`,
                  background: paymentMethod === 'UPI' ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                />
                <QrCode size={22} color="#2563eb" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Instant UPI (GPay / PhonePe / Paytm)</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Pay seamlessly with QR scan or UPI handle
                  </div>
                </div>
              </label>

              {/* Card */}
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 12,
                  border: `2px solid ${paymentMethod === 'CARD' ? '#0c831f' : '#e2e8f0'}`,
                  background: paymentMethod === 'CARD' ? '#f0fdf4' : '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value="CARD"
                  checked={paymentMethod === 'CARD'}
                  onChange={() => setPaymentMethod('CARD')}
                />
                <CreditCard size={22} color="#7c3aed" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Credit / Debit Card</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    Visa, Mastercard, RuPay cards accepted
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Delivery Note */}
          <div className="form-group">
            <label className="form-label">Special Delivery Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Ring bell twice / Leave at security gate"
              className="form-input"
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Right Column: Order Review Box */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 24,
            border: '1px solid #e2e8f0',
            boxShadow: 'var(--shadow-md)',
            position: 'sticky',
            top: 90
          }}
        >
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 16, color: '#0f172a' }}>
            Order Summary ({cartCount} {cartCount === 1 ? 'item' : 'items'})
          </h3>

          {/* Items mini list */}
          <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 16, paddingRight: 4, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {cart.map((item) => (
              <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  <img src={item.image} alt={item.name} style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} />
                  <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>
                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {item.unit} x {item.quantity}
                    </div>
                  </div>
                </div>
                <div style={{ fontWeight: 700 }}>₹{item.price * item.quantity}</div>
              </div>
            ))}
          </div>

          {/* Calculations */}
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
              <span>Item Total</span>
              <span>₹{subtotal}</span>
            </div>

            {appliedCoupon && couponDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#0c831f', fontWeight: 700 }}>
                <span>Coupon ({appliedCoupon.code})</span>
                <span>- ₹{couponDiscount}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
              <span>Delivery Charges</span>
              <span>{deliveryFee === 0 ? <span style={{ color: '#0c831f', fontWeight: 700 }}>FREE</span> : `₹${deliveryFee}`}</span>
            </div>

            <div
              style={{
                borderTop: '1.5px solid #cbd5e1',
                paddingTop: 12,
                marginTop: 4,
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '1.2rem',
                color: '#0f172a'
              }}
            >
              <span>Total Payable</span>
              <span>₹{grandTotal}</span>
            </div>
          </div>

          {/* Place Order CTA */}
          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 20, padding: 14 }}
            disabled={loading || cart.length === 0}
            onClick={handlePlaceOrder}
          >
            {loading ? 'Confirming Order...' : `Place Order (₹${grandTotal})`}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, fontSize: '0.75rem', color: '#64748b' }}>
            <ShieldCheck size={14} color="#0c831f" />
            <span>Safe & Secure Soft Launch Checkout</span>
          </div>
        </div>
      </div>

      {/* UPI Simulation Modal */}
      {showUpiModal && (
        <div className="modal-overlay" onClick={() => setShowUpiModal(false)}>
          <div className="modal-card" style={{ maxWidth: 400, padding: 24 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>
              Instant UPI Payment
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginBottom: 18 }}>
              Scan QR code or enter your UPI ID to simulate payment
            </p>

            <div style={{ textAlign: 'center', background: '#f8fafc', padding: 16, borderRadius: 12, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'center', margin: '0 auto', color: '#2563eb' }}>
                <QrCode size={56} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginTop: 8 }}>Pay ₹{grandTotal}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Grocery Soft Launch Demo</div>
            </div>

            <div className="form-group">
              <label className="form-label">Enter UPI ID (e.g. yourname@oksbi)</label>
              <input
                type="text"
                placeholder="yourname@okaxis"
                className="form-input"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: 12 }}
              onClick={() => {
                if (!upiId) setUpiId('user@upi');
                setShowUpiModal(false);
                handlePlaceOrder();
              }}
            >
              Verify & Authorize ₹{grandTotal}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
