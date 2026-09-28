import React, { useState } from 'react';
import { X, Lock, Mail, Phone, User as UserIcon, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function AuthModal() {
  const { isAuthModalOpen, authModalMode, setAuthModalMode, closeAuthModal, loginCustomer, registerCustomer } = useAuth();
  const { showToast } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        await loginCustomer(email, password);
        showToast('Welcome back to FreshCart!');
      } else {
        if (!name || !email || !password) {
          throw new Error('Please fill in all mandatory fields');
        }
        await registerCustomer({ name, email, phone, password, address });
        showToast('Account registered successfully! Happy shopping!');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCustomer = () => {
    setEmail('rahul@gmail.com');
    setPassword('user123');
    setError('');
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {authModalMode === 'login' ? 'Customer Login' : 'Create Customer Account'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {authModalMode === 'login' ? 'Login to place orders & track delivery' : 'Quick sign up for groceries delivered to your door'}
            </p>
          </div>
          <button
            onClick={closeAuthModal}
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

        {/* Body */}
        <div style={{ padding: '20px 24px' }}>
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                padding: '10px 14px',
                color: '#b91c1c',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {authModalMode === 'signup' && (
              <>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <UserIcon size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      className="form-input"
                      style={{ paddingLeft: 38 }}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9812345678"
                      className="form-input"
                      style={{ paddingLeft: 38 }}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Delivery Address (House/Street/Pincode)</label>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: 14 }} />
                    <textarea
                      placeholder="e.g. Flat 402, Sunshine Heights, Sector 18, Noida - 201301"
                      className="form-textarea"
                      style={{ paddingLeft: 38, minHeight: 70 }}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email / Gmail Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  required
                  placeholder="Enter password"
                  className="form-input"
                  style={{ paddingLeft: 38 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', marginTop: 10, fontSize: '0.95rem' }}
            >
              {loading ? 'Processing...' : authModalMode === 'login' ? 'Log In to FreshCart' : 'Complete Registration'}
            </button>
          </form>

          {/* Quick Demo Customer Button */}
          {authModalMode === 'login' && (
            <div style={{ marginTop: 16, textAlign: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ width: '100%', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#0c831f', fontWeight: 700 }}
                onClick={fillDemoCustomer}
              >
                <Sparkles size={14} color="#0c831f" />
                Fill Demo Customer (rahul@gmail.com)
              </button>
            </div>
          )}

          {/* Toggle Mode */}
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.85rem', color: '#64748b' }}>
            {authModalMode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#0c831f', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => {
                    setError('');
                    setAuthModalMode('signup');
                  }}
                >
                  Sign Up Here
                </button>
              </>
            ) : (
              <>
                Already registered?{' '}
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#0c831f', fontWeight: 700, cursor: 'pointer' }}
                  onClick={() => {
                    setError('');
                    setAuthModalMode('login');
                  }}
                >
                  Log In
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
