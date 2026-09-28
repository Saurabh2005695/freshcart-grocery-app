import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, RefreshCw, AlertTriangle, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { api } from '../api/api';
import AdminProductModal from './AdminProductModal';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts({
          category: categoryFilter,
          search: searchQuery,
          includeInactive: true
        }),
        api.getCategories()
      ]);
      setProducts(prodRes.products || []);
      setCategories(catRes.categories || []);
    } catch (err) {
      console.error('Failed to load inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryFilter]);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const handleToggleStatus = async (id) => {
    try {
      const res = await api.adminToggleProductStatus(id);
      setProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, is_active: res.is_active } : p))
      );
    } catch (err) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) return;
    try {
      await api.adminDeleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete product');
    }
  };

  const handleSaveProduct = async (formData) => {
    if (formData.id) {
      const res = await api.adminUpdateProduct(formData.id, formData);
      setProducts((prev) => prev.map((p) => (p.id === formData.id ? res.product : p)));
    } else {
      const res = await api.adminAddProduct(formData);
      setProducts((prev) => [res.product, ...prev]);
    }
  };

  return (
    <div>
      {/* Header & Add CTA */}
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>Product Inventory</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Manage grocery catalog items, stock quantities, and availability
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchData}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
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
            placeholder="Search products by title or description..."
            className="form-input"
            style={{ paddingLeft: 36, fontSize: '0.875rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={16} color="#64748b" />
          <select
            className="form-select"
            style={{ width: 'auto', fontSize: '0.875rem' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
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
                <th style={{ padding: '12px 16px' }}>Product</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Unit</th>
                <th style={{ padding: '12px 16px' }}>Price / MRP</th>
                <th style={{ padding: '12px 16px' }}>Stock Qty</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading inventory items...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isLowStock = product.stock <= 5;
                  return (
                    <tr key={product.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* Product Thumbnail & Name */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <img
                            src={product.image}
                            alt={product.name}
                            style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', background: '#f8fafc' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, color: '#0f172a' }}>{product.name}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ID: #{product.id}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '12px 16px', color: '#475569' }}>
                        <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 }}>
                          {product.category_name || product.category_id}
                        </span>
                      </td>

                      {/* Unit */}
                      <td style={{ padding: '12px 16px', color: '#64748b' }}>{product.unit}</td>

                      {/* Price / MRP */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>₹{product.price}</div>
                        {product.mrp > product.price && (
                          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                            ₹{product.mrp}
                          </div>
                        )}
                      </td>

                      {/* Stock Count */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontWeight: 800, fontSize: '0.95rem', color: isLowStock ? '#b45309' : '#0f172a' }}>
                            {product.stock}
                          </span>
                          {isLowStock && (
                            <span
                              style={{
                                background: '#fef3c7',
                                color: '#b45309',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                padding: '2px 5px',
                                borderRadius: 4,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 2
                              }}
                              title="Low Stock Alert"
                            >
                              <AlertTriangle size={10} /> LOW
                            </span>
                          )}
                        </div>
                      </td>

                      {/* In Stock / Out of Stock Toggle */}
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => handleToggleStatus(product.id)}
                          style={{
                            background: product.is_active === 1 ? '#ecfdf5' : '#fef2f2',
                            color: product.is_active === 1 ? '#047857' : '#b91c1c',
                            border: `1px solid ${product.is_active === 1 ? '#a7f3d0' : '#fecaca'}`,
                            padding: '4px 10px',
                            borderRadius: 999,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                        >
                          {product.is_active === 1 ? (
                            <>
                              <CheckCircle2 size={12} />
                              <span>In Stock</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={12} />
                              <span>Out of Stock</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: 6 }}
                            title="Edit Product"
                            onClick={() => {
                              setEditingProduct(product);
                              setIsModalOpen(true);
                            }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: 6, color: '#ef4444' }}
                            title="Delete Product"
                            onClick={() => handleDelete(product.id, product.name)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <AdminProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}
