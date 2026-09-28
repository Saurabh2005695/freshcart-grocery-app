import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin({ onLoginSuccess, onBackToStore }) {
  const { loginAdmin } = useAuth();
  const [email, setEmail] = useState('admin@grocery.local');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginAdmin(email, password);
      onLoginSuccess();
    } catch (err) {
      setError(err.message || 'Invalid admin credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 24,
          padding: '40px 36px',
          maxWidth: 440,
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          position: 'relative'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              width: 60,
              height: 60,
              background: '#ecfdf5',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 14px',
              color: '#0c831f'
            }}
          >
            <ShieldCheck size={36} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
            Store Owner Portal
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 4 }}>
            Secure Admin Dashboard for Order & Inventory Management
          </p>
        </div>

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
              marginBottom: 18
            }}
          >
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                className="form-input"
                style={{ paddingLeft: 38 }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Admin Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
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
            style={{ width: '100%', padding: 12, marginTop: 10 }}
          >
            {loading ? 'Authenticating...' : 'Access Admin Dashboard'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', background: '#f8fafc', color: '#64748b' }}
            onClick={onBackToStore}
          >
            ← Back to Customer Storefront
          </button>
        </div>

        <div style={{ marginTop: 18, background: '#f8fafc', padding: '10px 12px', borderRadius: 8, fontSize: '0.75rem', color: '#64748b', textAlign: 'center' }}>
          <b>Demo Admin:</b> admin@grocery.local / admin123
        </div>
      </div>
    </div>
  );
}
