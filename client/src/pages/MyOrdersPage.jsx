import React, { useEffect, useState } from 'react';
import { Package, Clock, RefreshCw, ChevronRight, ShoppingBag, ArrowLeft, CheckCircle2, Truck, AlertCircle } from 'lucide-react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function MyOrdersPage({ onNavigate }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { addToCart, setIsCartDrawerOpen, showToast } = useCart();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const res = await api.getMyOrders();
      setOrders(res.orders || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal('login', () => fetchOrders());
    } else {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    order.items.forEach((item) => {
      addToCart({
        id: item.product_id,
        name: item.product_name,
        price: item.price,
        mrp: item.price,
        unit: item.unit,
        image: item.product_image,
        stock: 50
      });
    });
    showToast(`Items from order #${order.id.slice(-4)} added to cart!`);
    setIsCartDrawerOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <Package size={52} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 8 }}>Please Log In</h2>
        <p style={{ color: '#64748b', marginBottom: 20 }}>Log in to view your past orders and track current deliveries.</p>
        <button className="btn btn-primary" onClick={() => openAuthModal('login', () => fetchOrders())}>
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ maxWidth: 840, padding: '24px 16px 80px' }}>
      <button
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: 20 }}
        onClick={() => onNavigate('home')}
      >
        <ArrowLeft size={16} />
        <span>Back to Store</span>
      </button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>My Orders</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Track active deliveries and view your purchase history</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchOrders}>
          <RefreshCw size={14} />
          <span>Refresh Status</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: '#0c831f' }}>
            <Package size={40} style={{ animation: 'pulseGlow 1.5s infinite' }} />
          </div>
          <p style={{ color: '#64748b', marginTop: 12 }}>Fetching your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0'
          }}
        >
          <ShoppingBag size={52} color="#94a3b8" style={{ margin: '0 auto 14px' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 6 }}>No orders placed yet</h3>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: 20 }}>
            Ready for lightning-fast groceries? Add your favorite essentials to the cart!
          </p>
          <button className="btn btn-primary" onClick={() => onNavigate('home')}>
            Start Shopping
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {orders.map((order) => {
            const statusClass = order.order_status.replace(/\s+/g, '-');
            return (
              <div
                key={order.id}
                style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  padding: 20,
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Order Top Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 14,
                    borderBottom: '1px solid #f1f5f9',
                    flexWrap: 'wrap',
                    gap: 10
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
                      Order #{order.id}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                      Placed on {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className={`status-pill ${statusClass}`}>
                      {order.order_status}
                    </span>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                      ₹{order.total_amount}
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div style={{ padding: '14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.875rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <img
                          src={item.product_image}
                          alt={item.product_name}
                          style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: '#f8fafc' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.product_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {item.unit} • Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700 }}>₹{item.total}</div>
                    </div>
                  ))}
                </div>

                {/* Order Footer & Reorder Button */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 14,
                    borderTop: '1px solid #f1f5f9',
                    flexWrap: 'wrap',
                    gap: 12
                  }}
                >
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    <span>Payment: <b>{order.payment_method}</b> ({order.payment_status})</span>
                    <span style={{ margin: '0 8px' }}>•</span>
                    <span>Slot: <b>{order.delivery_slot}</b></span>
                  </div>

                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleReorder(order)}
                  >
                    <RefreshCw size={14} />
                    <span>Reorder Items</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
