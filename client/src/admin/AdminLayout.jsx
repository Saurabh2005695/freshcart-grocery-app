import React from 'react';
import { LayoutDashboard, ShoppingCart, Boxes, LogOut, Store, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ activeTab, setActiveTab, onNavigateStorefront, children }) {
  const { admin, logoutAdmin } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 260,
          background: '#0f172a',
          color: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50,
          flexShrink: 0
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                background: '#0c831f',
                color: '#fff',
                width: 36,
                height: 36,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ShoppingCart size={20} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#fff' }}>
                FreshCart <span style={{ color: '#10b981' }}>Admin</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Shop Owner Dashboard</div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '20px 12px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 10,
              border: 'none',
              width: '100%',
              textAlign: 'left',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'dashboard' ? '#1e293b' : 'transparent',
              color: activeTab === 'dashboard' ? '#10b981' : '#94a3b8',
              transition: 'all 0.15s ease'
            }}
          >
            <LayoutDashboard size={18} />
            <span>Overview & KPIs</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 10,
              border: 'none',
              width: '100%',
              textAlign: 'left',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'orders' ? '#1e293b' : 'transparent',
              color: activeTab === 'orders' ? '#10b981' : '#94a3b8',
              transition: 'all 0.15s ease'
            }}
          >
            <ShoppingCart size={18} />
            <span>Orders Management</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 10,
              border: 'none',
              width: '100%',
              textAlign: 'left',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: activeTab === 'products' ? '#1e293b' : 'transparent',
              color: activeTab === 'products' ? '#10b981' : '#94a3b8',
              transition: 'all 0.15s ease'
            }}
          >
            <Boxes size={18} />
            <span>Product Inventory</span>
          </button>

          <div style={{ margin: '14px 0', borderTop: '1px solid #1e293b' }} />

          <button
            onClick={onNavigateStorefront}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderRadius: 10,
              border: 'none',
              width: '100%',
              textAlign: 'left',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              background: 'rgba(16, 185, 129, 0.1)',
              color: '#34d399',
              transition: 'all 0.15s ease'
            }}
          >
            <Store size={18} />
            <span>View Customer Store</span>
          </button>
        </nav>

        {/* Admin Footer & Logout */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e293b', background: '#0b1120' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ background: '#1e293b', padding: 6, borderRadius: '50%', color: '#94a3b8' }}>
                <User size={16} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff' }}>{admin?.name || 'Owner'}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Store Owner</div>
              </div>
            </div>
            <button
              onClick={logoutAdmin}
              title="Logout"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                padding: 6
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', maxHeight: '100vh' }}>
        {children}
      </main>
    </div>
  );
}
