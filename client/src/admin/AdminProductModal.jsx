import React, { useState, useEffect } from 'react';
import { X, Sparkles, Image, Tag, Layers, DollarSign, Package } from 'lucide-react';

export default function AdminProductModal({ product, categories, onClose, onSave }) {
  const [name, setName] = useState(product?.name || '');
  const [categoryId, setCategoryId] = useState(product?.category_id || categories[0]?.id || 'fruits-veg');
  const [unit, setUnit] = useState(product?.unit || '500 g');
  const [price, setPrice] = useState(product?.price || '');
  const [mrp, setMrp] = useState(product?.mrp || '');
  const [stock, setStock] = useState(product?.stock != null ? product.stock : 25);
  const [image, setImage] = useState(product?.image || '');
  const [description, setDescription] = useState(product?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const sampleImages = [
    { label: 'Fresh Produce', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80' },
    { label: 'Dairy & Milk', url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80' },
    { label: 'Snacks / Chips', url: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80' },
    { label: 'Beverages', url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !unit || price == null || mrp == null) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        id: product?.id,
        name: name.trim(),
        category_id: categoryId,
        unit: unit.trim(),
        price: Number(price),
        mrp: Number(mrp),
        stock: Number(stock),
        image: image.trim() || sampleImages[0].url,
        description: description.trim()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
            {product ? 'Edit Grocery Product' : 'Add New Grocery Product'}
          </h3>
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

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: 14 }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Fresh Red Tomatoes"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pack Unit / Size *</label>
              <input
                type="text"
                required
                placeholder="e.g. 1 kg, 500 g, 1 L"
                className="form-input"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Selling Price (₹) *</label>
              <input
                type="number"
                step="any"
                required
                placeholder="38"
                className="form-input"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">MRP (₹) *</label>
              <input
                type="number"
                step="any"
                required
                placeholder="50"
                className="form-input"
                value={mrp}
                onChange={(e) => setMrp(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stock Quantity *</label>
              <input
                type="number"
                required
                placeholder="25"
                className="form-input"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              className="form-input"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
            {/* Sample Image Presets */}
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
              {sampleImages.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImage(s.url)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  Preset: {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Product freshness, sourcing or storage instructions..."
              className="form-textarea"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
