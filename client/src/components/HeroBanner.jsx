import React, { useState, useEffect } from 'react';
import { Tag, Sparkles, Clock, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function HeroBanner({ onSelectCategory }) {
  const { applyCoupon } = useCart();
  const [activeSlide, setActiveSlide] = useState(0);

  const banners = [
    {
      id: 1,
      tag: 'SOFT LAUNCH OFFER',
      title: 'Flat ₹50 OFF on Your First Grocery Order',
      subtitle: 'Use coupon code WELCOME50 at checkout (Min order ₹199)',
      code: 'WELCOME50',
      bgGradient: 'linear-gradient(135deg, #0c831f 0%, #065f46 100%)',
      accentColor: '#fef08a',
      buttonText: 'Claim Coupon',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      actionType: 'coupon'
    },
    {
      id: 2,
      tag: '15 MINS DELIVERY',
      title: 'Farm Fresh Fruits & Daily Vegetables',
      subtitle: 'Handpicked crisp produce directly sourced from local farmers daily',
      code: null,
      bgGradient: 'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)',
      accentColor: '#fed7aa',
      buttonText: 'Shop Fresh Produce',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
      actionType: 'category',
      categoryTarget: 'fruits-veg'
    },
    {
      id: 3,
      tag: 'FREE DELIVERY',
      title: 'Free Delivery on Orders Above ₹299',
      subtitle: 'Stock up your kitchen essentials, snacks & dairy with zero shipping fees',
      code: 'FREESHIP',
      bgGradient: 'linear-gradient(135deg, #1e40af 0%, #172554 100%)',
      accentColor: '#bfdbfe',
      buttonText: 'Apply FREESHIP',
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
      actionType: 'coupon'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % banners.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [banners.length]);

  const currentBanner = banners[activeSlide];

  return (
    <div style={{ marginTop: 18, marginBottom: 24 }}>
      <div
        style={{
          background: currentBanner.bgGradient,
          borderRadius: 20,
          padding: '28px 32px',
          color: '#ffffff',
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: 20,
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
          transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Decorative Background Blob */}
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 250,
            height: 250,
            background: 'rgba(255, 255, 255, 0.08)',
            borderRadius: '50%',
            pointerEvents: 'none'
          }}
        />

        {/* Left Content */}
        <div style={{ zIndex: 2 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              padding: '4px 12px',
              borderRadius: 999,
              fontSize: '0.78rem',
              fontWeight: 800,
              color: currentBanner.accentColor,
              marginBottom: 12
            }}
          >
            {currentBanner.tag}
          </div>

          <h1
            style={{
              color: '#ffffff',
              fontSize: '1.85rem',
              lineHeight: 1.2,
              marginBottom: 10,
              fontWeight: 800
            }}
          >
            {currentBanner.title}
          </h1>

          <p
            style={{
              fontSize: '0.95rem',
              opacity: 0.9,
              marginBottom: 20,
              maxWidth: 480,
              lineHeight: 1.4
            }}
          >
            {currentBanner.subtitle}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="btn"
              style={{
                background: '#ffffff',
                color: '#0f172a',
                fontWeight: 700,
                padding: '10px 20px',
                borderRadius: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}
              onClick={() => {
                if (currentBanner.actionType === 'coupon' && currentBanner.code) {
                  applyCoupon(currentBanner.code);
                } else if (currentBanner.categoryTarget) {
                  onSelectCategory(currentBanner.categoryTarget);
                }
              }}
            >
              <span>{currentBanner.buttonText}</span>
              <ArrowRight size={16} />
            </button>

            {currentBanner.code && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px dashed rgba(255, 255, 255, 0.4)',
                  fontSize: '0.85rem',
                  fontFamily: 'monospace',
                  fontWeight: 700
                }}
              >
                <Tag size={14} color={currentBanner.accentColor} />
                <span>CODE: {currentBanner.code}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Image */}
        <div
          style={{
            zIndex: 2,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <img
            src={currentBanner.image}
            alt="Grocery deals"
            style={{
              width: '100%',
              maxHeight: 200,
              objectFit: 'cover',
              borderRadius: 16,
              boxShadow: '0 12px 24px rgba(0,0,0,0.25)',
              border: '3px solid rgba(255,255,255,0.2)'
            }}
          />
        </div>
      </div>

      {/* Slide Indicators */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
        {banners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            style={{
              width: activeSlide === idx ? 28 : 8,
              height: 8,
              borderRadius: 4,
              background: activeSlide === idx ? '#0c831f' : '#cbd5e1',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          />
        ))}
      </div>

      {/* Trust Badges Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          marginTop: 18,
          background: '#ffffff',
          padding: '14px 20px',
          borderRadius: 14,
          border: '1px solid #e2e8f0'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#ecfdf5', padding: 8, borderRadius: 10, color: '#0c831f' }}>
            <Zap size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>15-Min Delivery</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Lightning fast doorstep service</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#fffbeb', padding: 8, borderRadius: 10, color: '#b45309' }}>
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>100% Quality Guarantee</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Fresh produce or instant return</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#eff6ff', padding: 8, borderRadius: 10, color: '#2563eb' }}>
            <Clock size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>Cash on Delivery</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pay after you inspect groceries</div>
          </div>
        </div>
      </div>
    </div>
  );
}
