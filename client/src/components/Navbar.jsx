import React, { useState } from 'react';
import { ShoppingBag, Search, MapPin, User, LogOut, Package, ChevronDown, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({
  categories = [],
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onNavigate
}) {
  const { user, isAuthenticated, logoutCustomer, openAuthModal } = useAuth();
  const { cartCount, grandTotal, setIsCartDrawerOpen } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState('Sector 18, Noida (201301)');
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-top">
          {/* Logo */}
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
            onClick={() => onNavigate('home')}
          >
            <div className="brand-logo">
              <div style={{
                background: 'linear-gradient(135deg, #0c831f 0%, #10b981 100%)',
                color: '#fff',
                width: 38,
                height: 38,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(12, 131, 31, 0.3)'
              }}>
                <ShoppingBag size={20} color="#ffffff" />
              </div>
              <span style={{ letterSpacing: '-0.03em' }}>
                Fresh<span style={{ color: '#ff6b35' }}>Cart</span>
              </span>
              <span className="brand-badge">SOFT LAUNCH</span>
            </div>
          </div>

          {/* Delivery Location Selector */}
          <div 
            className="location-picker"
            onClick={() => {
              const newLoc = prompt('Enter your delivery area or pincode:', deliveryLocation);
              if (newLoc && newLoc.trim()) setDeliveryLocation(newLoc.trim());
            }}
            title="Click to change delivery area"
          >
            <MapPin size={18} color="#0c831f" style={{ flexShrink: 0 }} />
            <div>
              <div className="location-title" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                Delivery in 15 mins
                <ChevronDown size={14} color="#64748b" />
              </div>
              <div className="location-sub">{user?.address ? user.address.slice(0, 24) + '...' : deliveryLocation}</div>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="search-container">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder='Search for "milk", "tomato", "chips", "atta"...'
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#e2e8f0',
                  border: 'none',
                  borderRadius: '50%',
                  width: 20,
                  height: 20,
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#475569'
                }}
              >
                X
              </button>
            )}
          </div>

          {/* Nav Actions */}
          <div className="nav-actions">
            {/* Customer Account Button */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: 9999, padding: '8px 14px' }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <User size={16} color="#0c831f" />
                  <span>{user?.name?.split(' ')[0] || 'Account'}</span>
                  <ChevronDown size={14} />
                </button>

                {showUserMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '115%',
                      background: '#fff',
                      borderRadius: 12,
                      boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                      border: '1px solid #e2e8f0',
                      width: 190,
                      padding: '8px',
                      zIndex: 150,
                      animation: 'fadeIn 0.15s ease'
                    }}
                  >
                    <div style={{ padding: '8px 10px', borderBottom: '1px solid #f1f5f9', marginBottom: 4 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{user.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user.email}</div>
                    </div>
                    <button
                      className="btn"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        background: 'transparent',
                        padding: '8px 10px',
                        fontSize: '0.85rem'
                      }}
                      onClick={() => {
                        setShowUserMenu(false);
                        onNavigate('orders');
                      }}
                    >
                      <Package size={16} color="#0c831f" />
                      <span>My Orders</span>
                    </button>
                    <button
                      className="btn"
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        background: 'transparent',
                        color: '#ef4444',
                        padding: '8px 10px',
                        fontSize: '0.85rem'
                      }}
                      onClick={() => {
                        setShowUserMenu(false);
                        logoutCustomer();
                      }}
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => openAuthModal('login')}
              >
                <User size={16} />
                <span>Login</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              className="nav-cart-btn"
              onClick={() => setIsCartDrawerOpen(true)}
              aria-label="View Cart"
            >
              <ShoppingBag size={18} />
              <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>
                  {cartCount === 0 ? 'My Cart' : `${cartCount} items`}
                </div>
                {cartCount > 0 && (
                  <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>₹{grandTotal}</div>
                )}
              </div>
              {cartCount > 0 && <span className="cart-badge-count">{cartCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Strip */}
      <div className="category-nav-strip">
        <div className="container">
          <ul className="category-strip-list">
            <li>
              <button
                className={`category-pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => onSelectCategory('all')}
              >
                <Sparkles size={14} color={selectedCategory === 'all' ? '#0c831f' : '#64748b'} />
                <span>All Products</span>
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat.id}>
                <button
                  className={`category-pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => onSelectCategory(cat.id)}
                >
                  <span>{cat.name}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
