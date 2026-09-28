import React from 'react';

export default function CategoryGrid({ categories = [], selectedCategory, onSelectCategory }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
            Shop by Category
          </h2>
          <p style={{ fontSize: '0.825rem', color: '#64748b' }}>
            Explore daily groceries, fresh veggies, dairy, and household essentials
          </p>
        </div>
        {selectedCategory !== 'all' && (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => onSelectCategory('all')}
          >
            View All Categories
          </button>
        )}
      </div>

      <div className="category-grid">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              className={`category-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="category-thumb"
                loading="lazy"
              />
              <div className="category-name">{cat.name}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
