import React, { useEffect, useState } from 'react';
import { IndianRupee, ShoppingBag, AlertTriangle, TrendingUp, PackageCheck, Truck, Users, RefreshCw } from 'lucide-react';
import { api } from '../api/api';

export default function AdminDashboard({ onNavigateTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOverview();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'center', color: '#0c831f' }}>
          <TrendingUp size={44} style={{ animation: 'pulseGlow 1.5s infinite' }} />
        </div>
        <p style={{ color: '#64748b', marginTop: 14, fontWeight: 600 }}>Loading store analytics...</p>
      </div>
    );
  }

  const maxRevenue = data?.seven_day_trend
    ? Math.max(...data.seven_day_trend.map((d) => d.revenue), 500)
    : 1000;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Dashboard Overview</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Real-time shop sales, orders volume, and inventory health</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={fetchAnalytics}>
          <RefreshCw size={14} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 16,
          marginBottom: 28
        }}
      >
        {/* Today's Revenue */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 20,
            border: '1px solid #e2e8f0',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Today's Revenue
            </span>
            <div style={{ background: '#ecfdf5', padding: 8, borderRadius: 10, color: '#0c831f' }}>
              <IndianRupee size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            ₹{data?.today_revenue || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#0c831f', fontWeight: 600, marginTop: 4 }}>
            From {data?.today_orders || 0} orders today
          </div>
        </div>

        {/* Total Orders */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 20,
            border: '1px solid #e2e8f0',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Total Orders
            </span>
            <div style={{ background: '#eff6ff', padding: 8, borderRadius: 10, color: '#2563eb' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            {data?.total_orders || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 600, marginTop: 4 }}>
            Total Revenue: ₹{data?.total_revenue || 0}
          </div>
        </div>

        {/* Average Order Value */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 20,
            border: '1px solid #e2e8f0',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Avg Order Value
            </span>
            <div style={{ background: '#f5f3ff', padding: 8, borderRadius: 10, color: '#7c3aed' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>
            ₹{data?.avg_order_value || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#7c3aed', fontWeight: 600, marginTop: 4 }}>
            Per completed checkout
          </div>
        </div>

        {/* Low Stock Alert */}
        <div
          style={{
            background: data?.low_stock_count > 0 ? '#fffbeb' : '#ffffff',
            borderRadius: 16,
            padding: 20,
            border: `1px solid ${data?.low_stock_count > 0 ? '#fde68a' : '#e2e8f0'}`,
            boxShadow: 'var(--shadow-sm)',
            cursor: 'pointer'
          }}
          onClick={() => onNavigateTab('products')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#b45309', textTransform: 'uppercase' }}>
              Low Stock Alerts
            </span>
            <div style={{ background: '#fef3c7', padding: 8, borderRadius: 10, color: '#b45309' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: data?.low_stock_count > 0 ? '#b45309' : '#0f172a' }}>
            {data?.low_stock_count || 0}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 600, marginTop: 4 }}>
            Items with &lt; 5 units in stock
          </div>
        </div>
      </div>

      {/* Grid: 7-Day Sales Trend & Status Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20, marginBottom: 28 }}>
        {/* 7-Day Revenue & Volume Chart */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 24,
            border: '1px solid #e2e8f0',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Last 7 Days Sales Trend</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Daily revenue (₹) and completed order volumes</p>
            </div>
          </div>

          {/* Responsive SVG Bar & Line Chart */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: 180, gap: 12, paddingBottom: 10, borderBottom: '1px solid #e2e8f0' }}>
            {data?.seven_day_trend?.map((day, idx) => {
              const heightPercent = Math.max(8, Math.round((day.revenue / maxRevenue) * 100));
              const dayLabel = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });

              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0c831f', marginBottom: 6 }}>
                    ₹{day.revenue}
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: 38,
                      height: `${heightPercent}%`,
                      background: 'linear-gradient(180deg, #10b981 0%, #0c831f 100%)',
                      borderRadius: '8px 8px 2px 2px',
                      transition: 'height 0.4s ease'
                    }}
                    title={`${day.date}: ₹${day.revenue} (${day.order_count} orders)`}
                  />
                  <div style={{ marginTop: 8, fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
                    {dayLabel}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 24,
            border: '1px solid #e2e8f0',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: 6 }}>
            Order Status Breakdown
          </h3>
          <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: 20 }}>
            Current pipeline of customer orders
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#eff6ff', borderRadius: 10 }}>
              <span style={{ fontWeight: 700, color: '#1d4ed8', fontSize: '0.85rem' }}>Placed</span>
              <span style={{ fontWeight: 800, color: '#1d4ed8' }}>{data?.status_breakdown?.Placed || 0}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fdf4ff', borderRadius: 10 }}>
              <span style={{ fontWeight: 700, color: '#a21caf', fontSize: '0.85rem' }}>Packed</span>
              <span style={{ fontWeight: 800, color: '#a21caf' }}>{data?.status_breakdown?.Packed || 0}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fff7ed', borderRadius: 10 }}>
              <span style={{ fontWeight: 700, color: '#c2410c', fontSize: '0.85rem' }}>Out for Delivery</span>
              <span style={{ fontWeight: 800, color: '#c2410c' }}>{data?.status_breakdown?.['Out for Delivery'] || 0}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#ecfdf5', borderRadius: 10 }}>
              <span style={{ fontWeight: 700, color: '#047857', fontSize: '0.85rem' }}>Delivered</span>
              <span style={{ fontWeight: 800, color: '#047857' }}>{data?.status_breakdown?.Delivered || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Best-Selling Products Leaderboard */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: 24,
          border: '1px solid #e2e8f0',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Top Selling Products</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Most popular items ordered by customers</p>
          </div>
          <button className="btn btn-outline-primary btn-sm" onClick={() => onNavigateTab('products')}>
            View All Products
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data?.top_products?.map((prod, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: '#f8fafc',
                borderRadius: 12,
                border: '1px solid #f1f5f9'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontWeight: 800, color: '#94a3b8', width: 16 }}>#{idx + 1}</span>
                <img
                  src={prod.product_image}
                  alt={prod.product_name}
                  style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>{prod.product_name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{prod.unit}</div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0c831f' }}>
                  {prod.total_sold} units sold
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Revenue: ₹{prod.total_revenue}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
