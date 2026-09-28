import React from 'react';
import { useCart } from '../context/CartContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function ToastNotification() {
  const { toastMessage } = useCart();
  if (!toastMessage) return null;

  const isError = toastMessage.type === 'error';
  const isInfo = toastMessage.type === 'info';

  return (
    <div className="toast-container">
      <div
        className="toast-card"
        style={{
          borderLeft: `4px solid ${isError ? '#ef4444' : isInfo ? '#3b82f6' : '#10b981'}`
        }}
      >
        {isError ? (
          <AlertCircle size={20} color="#ef4444" />
        ) : isInfo ? (
          <Info size={20} color="#3b82f6" />
        ) : (
          <CheckCircle2 size={20} color="#10b981" />
        )}
        <span style={{ fontWeight: 500 }}>{toastMessage.message}</span>
      </div>
    </div>
  );
}
