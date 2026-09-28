import React, { useEffect, useState } from 'react';
import { Search, Download, Eye, RefreshCw, Filter, Calendar, CheckCircle2, Phone, MapPin } from 'lucide-react';
import { api } from '../api/api';
import AdminOrderDetailsModal from './AdminOrderDetailsModal';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getAdminOrders({
        status: statusFilter,
        date: dateFilter,
        search: searchQuery
      });
      setOrders(res.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, dateFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const paymentStatus = newStatus === 'Delivered' ? 'Paid' : undefined;
      const res = await api.updateOrderStatus(orderId, newStatus, paymentStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, order_status: newStatus, payment_status: paymentStatus || o.payment_status } : o))
      );
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportCSV = () => {
    const url = api.exportOrdersCSVUrl(statusFilter, dateFilter);
    window.open(url, '_blank');
  };

  return (
    <div>
      {/* Header & Export */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Orders Management</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Process customer orders, update delivery progress, and export records
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchOrders}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={handleExportCSV}>
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap'
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by customer, phone, order ID..."
            className="form-input"
            style={{ paddingLeft: 36, fontSize: '0.875rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={16} color="#64748b" />
          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.875rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Placed">Placed</option>
            <option value="Packed">Packed</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Date Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Calendar size={16} color="#64748b" />
          <input
            type="date"
            className="form-input"
            style={{ width: 'auto', fontSize: '0.875rem' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setDateFilter('')}
              title="Clear date"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 16px' }}>Order ID & Date</th>
                <th style={{ padding: '12px 16px' }}>Customer & Contact</th>
                <th style={{ padding: '12px 16px' }}>Items</th>
                <th style={{ padding: '12px 16px' }}>Amount & Pay Mode</th>
                <th style={{ padding: '12px 16px' }}>Order Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusClass = order.order_status.replace(/\s+/g, '-');
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* ID & Date */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{order.id}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 2 }}>
                          {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#0c831f', fontWeight: 600, marginTop: 2 }}>
                          {order.delivery_slot}
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{order.customer_name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Phone size={11} /> {order.customer_phone}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: '#475569',
                            maxWidth: 220,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: 2
                          }}
                          title={order.delivery_address}
                        >
                          {order.delivery_address}
                        </div>
                      </td>

                      {/* Items */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {order.items?.map((i) => `${i.product_name || i.name} (x${i.quantity})`).join(', ')}
                        </div>
                      </td>

                      {/* Amount & Mode */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                          ₹{order.total_amount}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          <span style={{ fontWeight: 600 }}>{order.payment_method}</span> ({order.payment_status})
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td style={{ padding: '14px 16px' }}>
                        <select
                          className="form-select"
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            padding: '4px 8px',
                            width: 'auto',
                            borderColor: updatingId === order.id ? '#3b82f6' : '#cbd5e1'
                          }}
                          value={order.order_status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="Placed">Placed</option>
                          <option value="Packed">Packed</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '6px 10px' }}
                          onClick={() => setSelectedOrder(order)}
                          title="View Order Slip"
                        >
                          <Eye size={14} />
                          <span>View Slip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Slip Modal */}
      {selectedOrder && (
        <AdminOrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
