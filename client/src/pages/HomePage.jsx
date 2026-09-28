import React from 'react';
import HeroBanner from '../components/HeroBanner';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, PackageSearch, Sparkles, ShoppingBag } from 'lucide-react';

export default function HomePage({
  products = [],
  categories = [],
  selectedCategory,
  onSelectCategory,
  searchQuery,
  sortBy,
  onSortChange,
  isLoading
}) {
  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="container" style={{ paddingBottom: 40 }}>
      {/* Show Hero Deals Banner when browsing All or Landing */}
      {!searchQuery && selectedCategory === 'all' && (
        <HeroBanner onSelectCategory={onSelectCategory} />
      )}

      {/* Category Grid Section */}
      {!searchQuery && (
        <CategoryGrid
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
      )}

      {/* Product Section Header & Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 10,
          marginBottom: 18,
          paddingBottom: 12,
          borderBottom: '1px solid #e2e8f0'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
            {searchQuery ? (
              <span>Results for "{searchQuery}"</span>
            ) : selectedCategory === 'all' ? (
              <span>All Products & Daily Essentials</span>
            ) : (
              <span>{currentCategoryObj ? currentCategoryObj.name : 'Category'}</span>
            )}
          </h2>
          <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
            {products.length} {products.length === 1 ? 'item' : 'items'} available
          </p>
        </div>

        {/* Sort Filter Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <SlidersHorizontal size={16} color="#64748b" />
          <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Sort by:</span>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.85rem' }}
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
          >
            <option value="popular">Popularity</option>
            <option value="discount">Biggest Discount</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', color: '#0c831f' }}>
            <ShoppingBag size={40} style={{ animation: 'pulseGlow 1.5s infinite' }} />
          </div>
          <p style={{ color: '#64748b', marginTop: 12, fontWeight: 600 }}>Loading fresh groceries...</p>
        </div>
      ) : products.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            margin: '20px 0'
          }}
        >
          <PackageSearch size={48} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            No products found
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 16 }}>
            {searchQuery
              ? `We couldn't find any grocery item matching "${searchQuery}". Try searching for tomato, milk, chips, atta...`
              : 'No items in this category currently.'}
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              onSelectCategory('all');
            }}
          >
            <Sparkles size={14} />
            <span>Browse All Essentials</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
