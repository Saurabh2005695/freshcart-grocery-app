import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Package, MapPin, Phone, MessageSquare, ArrowRight, Clock, ShieldCheck } from 'lucide-react';

export default function OrderSuccessPage({ order, onNavigate }) {
  useEffect(() => {
    // Fire festive celebratory confetti!
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
  }, []);

  if (!order) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <h2>Order not found</h2>
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => onNavigate('home')}>
          Return to Store
        </button>
      </div>
    );
  }

  const steps = [
    { label: 'Order Placed', desc: 'Received by store', active: true },
    { label: 'Packed', desc: 'Items sealed & ready', active: false },
    { label: 'Out for Delivery', desc: 'Rider on the way', active: false },
    { label: 'Delivered', desc: 'Enjoy fresh groceries!', active: false }
  ];

  return (
    <div className="container" style={{ maxWidth: 740, padding: '36px 16px 80px' }}>
      {/* Success Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          padding: '36px 28px',
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-xl)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            background: '#ecfdf5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#0c831f'
          }}
        >
          <CheckCircle2 size={44} />
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
          Order Confirmed!
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: 12 }}>
          Thank you for ordering with FreshCart. Your groceries are being prepared now!
        </p>

        {/* Order ID Pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#f8fafc',
            border: '1px dashed #cbd5e1',
            padding: '8px 18px',
            borderRadius: 999,
            fontWeight: 800,
            fontSize: '0.95rem',
            color: '#0f172a',
            marginBottom: 24
          }}
        >
          <span>ORDER ID: {order.orderId || order.id}</span>
        </div>

        {/* Simulated WhatsApp / SMS Notification Alert */}
        <div
          style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: 14,
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textAlign: 'left',
            marginBottom: 28
          }}
        >
          <div style={{ background: '#0c831f', color: '#fff', borderRadius: '50%', padding: 6, display: 'flex' }}>
            <MessageSquare size={16} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#065f46' }}>
              WhatsApp & SMS Notification Sent!
            </div>
            <div style={{ fontSize: '0.78rem', color: '#047857' }}>
              We've dispatched confirmation & live delivery tracker to your phone.
            </div>
          </div>
        </div>

        {/* Live Delivery Tracker Timeline */}
        <div style={{ marginBottom: 32, textAlign: 'left' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 16, color: '#0f172a' }}>
            Live Delivery Tracker
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              position: 'relative',
              gap: 8
            }}
          >
            {steps.map((step, idx) => (
              <div key={idx} style={{ textAlign: 'center', position: 'relative' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: step.active ? '#0c831f' : '#f1f5f9',
                    color: step.active ? '#ffffff' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    border: `2px solid ${step.active ? '#0c831f' : '#e2e8f0'}`
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: step.active ? '#0c831f' : '#64748b' }}>
                  {step.label}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details Breakdown */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: 16,
            padding: 20,
            textAlign: 'left',
            border: '1px solid #e2e8f0',
            marginBottom: 28
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h4 style={{ fontWeight: 800, fontSize: '0.95rem' }}>Items Ordered</h4>
            <span style={{ fontWeight: 700, color: '#0c831f', fontSize: '0.85rem' }}>
              Payment: {order.payment_method || 'COD'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                <span>
                  {item.name || item.product_name} ({item.unit}) <b style={{ color: '#64748b' }}>x{item.quantity}</b>
                </span>
                <span style={{ fontWeight: 700 }}>₹{item.total || item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
            <span>Grand Total</span>
            <span style={{ color: '#0c831f', fontSize: '1.1rem' }}>₹{order.total_amount}</span>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline-primary"
            onClick={() => onNavigate('orders')}
          >
            <Package size={16} />
            <span>View in My Orders</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => onNavigate('home')}
          >
            <span>Continue Shopping</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
