import React from 'react';
import { Plus, Minus, Star, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  if (!product) return null;

  const { addToCart, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  const discountPercent = product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  const isOutOfStock = product.stock <= 0 || product.is_active === 0;

  return (
    <div className="product-card">
      {/* Product Image & Badges */}
      <div className="product-img-wrapper">
        <img
          src={product.image}
          alt={product.name}
          className="product-img"
          loading="lazy"
        />

        {discountPercent > 0 && (
          <span className="product-discount-tag">
            {discountPercent}% OFF
          </span>
        )}

        <div className="product-time-tag">
          <Clock size={11} color="#0c831f" />
          <span>15 MINS</span>
        </div>
      </div>

      {/* Product Info */}
      <div className="product-unit">{product.unit}</div>
      <h3 className="product-title" title={product.name}>
        {product.name}
      </h3>

      {/* Ratings & Stock Warning */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', fontWeight: 700, color: '#334155' }}>
          <Star size={12} fill="#f59e0b" color="#f59e0b" />
          <span>{product.rating || '4.8'}</span>
          <span style={{ color: '#94a3b8', fontWeight: 500 }}>({product.rating_count || 120})</span>
        </div>

        {product.stock > 0 && product.stock <= 5 && (
          <span style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: 700, background: '#fef2f2', padding: '1px 5px', borderRadius: 4 }}>
            Only {product.stock} left
          </span>
        )}
      </div>

      {/* Bottom Pricing & Action Stepper */}
      <div className="product-bottom-row">
        <div className="price-container">
          <div className="price-current">₹{product.price}</div>
          {product.mrp > product.price && (
            <div className="price-mrp">₹{product.mrp}</div>
          )}
        </div>

        <div>
          {isOutOfStock ? (
            <button
              className="btn btn-secondary btn-sm"
              disabled
              style={{ cursor: 'not-allowed', opacity: 0.6, fontSize: '0.75rem', padding: '6px 10px' }}
            >
              Out of Stock
            </button>
          ) : quantity === 0 ? (
            <button
              className="add-btn"
              onClick={() => addToCart(product)}
            >
              ADD
            </button>
          ) : (
            <div className="stepper-btn-group">
              <button
                className="stepper-btn"
                onClick={() => updateQuantity(product.id, quantity - 1)}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="stepper-count">{quantity}</span>
              <button
                className="stepper-btn"
                onClick={() => {
                  if (quantity >= product.stock) {
                    alert(`Maximum stock available is ${product.stock}`);
                    return;
                  }
                  updateQuantity(product.id, quantity + 1);
                }}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
