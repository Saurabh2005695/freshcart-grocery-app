import React from 'react';
import { X, Printer, Package, MapPin, Phone, Mail, Clock, CreditCard } from 'lucide-react';

export default function AdminOrderDetailsModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        style={{ maxWidth: 600, padding: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              Order Slip #{order.id}
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Placed: {new Date(order.created_at).toLocaleString('en-IN')}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handlePrint}
              title="Print Order Slip"
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: '#e2e8f0',
                border: 'none',
                borderRadius: '50%',
                width: 30,
                height: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          {/* Customer & Delivery Details */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              background: '#f8fafc',
              padding: 16,
              borderRadius: 12,
              marginBottom: 20
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#64748b', marginBottom: 4 }}>
                CUSTOMER DETAILS
              </div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{order.customer_name}</div>
              <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Phone size={12} /> {order.customer_phone}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <Mail size={12} /> {order.customer_email}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#64748b', marginBottom: 4 }}>
                DELIVERY DETAILS
              </div>
              <div style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600 }}>{order.delivery_address}</div>
              <div style={{ fontSize: '0.78rem', color: '#0c831f', fontWeight: 700, marginTop: 4 }}>
                Slot: {order.delivery_slot}
              </div>
              {order.notes && (
                <div style={{ fontSize: '0.75rem', color: '#b45309', background: '#fef3c7', padding: '2px 6px', borderRadius: 4, marginTop: 4 }}>
                  Note: {order.notes}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 10 }}>Order Items</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: 20 }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '8px 10px' }}>Item</th>
                <th style={{ padding: '8px 10px' }}>Unit</th>
                <th style={{ padding: '8px 10px' }}>Price</th>
                <th style={{ padding: '8px 10px' }}>Qty</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 10px', fontWeight: 600 }}>{item.product_name || item.name}</td>
                  <td style={{ padding: '10px 10px', color: '#64748b' }}>{item.unit}</td>
                  <td style={{ padding: '10px 10px' }}>₹{item.price}</td>
                  <td style={{ padding: '10px 10px', fontWeight: 700 }}>x{item.quantity}</td>
                  <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700 }}>₹{item.total}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
              <span style={{ color: '#64748b' }}>Subtotal:</span>
              <span>₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#0c831f', marginBottom: 4 }}>
                <span>Coupon Discount ({order.coupon_code}):</span>
                <span>- ₹{order.discount}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
              <span style={{ color: '#64748b' }}>Delivery Fee:</span>
              <span>{order.delivery_fee === 0 ? 'FREE' : `₹${order.delivery_fee}`}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', borderTop: '1px solid #cbd5e1', paddingTop: 8, color: '#0f172a' }}>
              <span>Grand Total:</span>
              <span>₹{order.total_amount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
