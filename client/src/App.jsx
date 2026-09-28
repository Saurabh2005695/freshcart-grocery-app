import React, { useState, useEffect, Component } from 'react';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import StickyCartBar from './components/StickyCartBar';
import AuthModal from './components/AuthModal';
import ToastNotification from './components/ToastNotification';

import HomePage from './pages/HomePage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import MyOrdersPage from './pages/MyOrdersPage';

import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminOrders from './admin/AdminOrders';
import AdminProducts from './admin/AdminProducts';

import { useAuth } from './context/AuthContext';
import { api } from './api/api';

// Error Boundary to prevent any blank white screen
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center', background: '#f8fafc' }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 16, maxWidth: 480, border: '1px solid #e2e8f0', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 20 }}>
              {this.state.error?.message || 'A temporary display error occurred.'}
            </p>
            <button
              className="btn btn-primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.hash = '';
                window.location.reload();
              }}
            >
              Reload FreshCart Store
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const { isAdminAuthenticated } = useAuth();

  // Determine initial view from hash
  const getViewFromHash = () => {
    const hash = window.location.hash;
    if (hash.includes('admin/login') || hash === '#admin/login') {
      return 'admin_login';
    }
    if (hash.includes('admin') || hash === '#admin') {
      return 'admin_portal';
    }
    if (hash.includes('orders') || hash === '#orders') {
      return 'orders';
    }
    if (hash.includes('checkout') || hash === '#checkout') {
      return 'checkout';
    }
    return 'home';
  };

  const [currentView, setCurrentView] = useState(getViewFromHash);
  const [adminTab, setAdminTab] = useState('dashboard'); // 'dashboard', 'orders', 'products'
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Storefront Data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // Load Categories on mount
  useEffect(() => {
    api.getCategories()
      .then((res) => {
        if (res && res.categories) setCategories(res.categories);
      })
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  // Fetch Products whenever category, search, or sort changes
  useEffect(() => {
    setIsLoadingProducts(true);
    api.getProducts({
      category: selectedCategory,
      search: searchQuery,
      sort: sortBy
    })
      .then((res) => {
        if (res && res.products) {
          setProducts(res.products);
        } else {
          setProducts([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load products', err);
        setProducts([]);
      })
      .finally(() => setIsLoadingProducts(false));
  }, [selectedCategory, searchQuery, sortBy]);

  // Synchronize hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const view = getViewFromHash();
      setCurrentView(view);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Navigation Trigger
  const handleNavigate = (view) => {
    if (view === 'home') {
      window.location.hash = '';
    } else if (view === 'orders') {
      window.location.hash = 'orders';
    } else if (view === 'checkout') {
      window.location.hash = 'checkout';
    } else if (view === 'admin_portal') {
      window.location.hash = 'admin';
    } else if (view === 'admin_login') {
      window.location.hash = 'admin/login';
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderPlaced = (orderData) => {
    setConfirmedOrder(orderData);
    setCurrentView('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // ADMIN PORTAL ROUTING
  // ==========================================
  if (currentView === 'admin_login' || (currentView === 'admin_portal' && !isAdminAuthenticated)) {
    return (
      <ErrorBoundary>
        <AdminLogin
          onLoginSuccess={() => {
            window.location.hash = 'admin';
            setCurrentView('admin_portal');
          }}
          onBackToStore={() => {
            window.location.hash = '';
            setCurrentView('home');
          }}
        />
      </ErrorBoundary>
    );
  }

  if (currentView === 'admin_portal') {
    return (
      <ErrorBoundary>
        <AdminLayout
          activeTab={adminTab}
          setActiveTab={setAdminTab}
          onNavigateStorefront={() => {
            window.location.hash = '';
            setCurrentView('home');
          }}
        >
          {adminTab === 'dashboard' && <AdminDashboard onNavigateTab={setAdminTab} />}
          {adminTab === 'orders' && <AdminOrders />}
          {adminTab === 'products' && <AdminProducts />}
        </AdminLayout>
      </ErrorBoundary>
    );
  }

  // ==========================================
  // CUSTOMER STOREFRONT ROUTING
  // ==========================================
  return (
    <ErrorBoundary>
      <div className="app-container">
        {/* Toast Notification Container */}
        <ToastNotification />

        {/* Customer Login / Signup Modal */}
        <AuthModal />

        {/* Cart Side Drawer */}
        <CartDrawer onProceedToCheckout={() => handleNavigate('checkout')} />

        {/* Top Navbar */}
        <Navbar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setSearchQuery('');
            if (currentView !== 'home') handleNavigate('home');
          }}
          searchQuery={searchQuery}
          onSearchChange={(query) => {
            setSearchQuery(query);
            if (currentView !== 'home') handleNavigate('home');
          }}
          onNavigate={handleNavigate}
        />

        {/* Main Content Area */}
        <main className="main-content">
          {currentView === 'home' && (
            <HomePage
              products={products}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                setSearchQuery('');
              }}
              searchQuery={searchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              isLoading={isLoadingProducts}
            />
          )}

          {currentView === 'checkout' && (
            <CheckoutPage
              onOrderPlaced={handleOrderPlaced}
              onBackToShopping={() => handleNavigate('home')}
            />
          )}

          {currentView === 'success' && (
            <OrderSuccessPage
              order={confirmedOrder}
              onNavigate={handleNavigate}
            />
          )}

          {currentView === 'orders' && (
            <MyOrdersPage
              onNavigate={handleNavigate}
            />
          )}
        </main>

        {/* Sticky Bottom Cart Bar (Mobile & Desktop) */}
        <StickyCartBar currentView={currentView} />

        {/* Storefront Footer */}
        <footer
          style={{
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            padding: '24px 0',
            marginTop: 'auto',
            fontSize: '0.825rem',
            color: '#64748b'
          }}
        >
          <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 800, color: '#0c831f' }}>FreshCart Grocery</span>
              <span>• Soft Launch Edition</span>
            </div>

            <div>
              100% Genuine Quality • Lightning Fast Delivery • Secure Checkout
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
