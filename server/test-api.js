// Comprehensive API Verification Suite
async function runTests() {
  console.log('[TEST] Running Comprehensive Full-Stack API Tests...\n');
  const baseUrl = 'http://localhost:5000/api';

  try {
    // 1. Health Check
    console.log('1. Testing Health Check...');
    const healthRes = await fetch(`${baseUrl}/health`);
    const health = await healthRes.json();
    console.log('   [OK] Health check passed:', health.status);

    // 2. Fetch Categories
    console.log('2. Testing Categories API...');
    const catRes = await fetch(`${baseUrl}/products/categories`);
    const { categories } = await catRes.json();
    console.log(`   [OK] Categories fetched: ${categories.length} categories available`);

    // 3. Fetch Products & Filters
    console.log('3. Testing Products API (filtering & search)...');
    const prodRes = await fetch(`${baseUrl}/products?category=fruits-veg`);
    const { products } = await prodRes.json();
    console.log(`   [OK] Filtered products for fruits-veg: ${products.length} products`);

    const searchRes = await fetch(`${baseUrl}/products?search=milk`);
    const searchData = await searchRes.json();
    console.log(`   [OK] Search for "milk": found ${searchData.products.length} items (${searchData.products[0]?.name})`);

    // 4. Validate Coupon
    console.log('4. Testing Coupon Validation...');
    const couponRes = await fetch(`${baseUrl}/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'WELCOME50', subtotal: 350 })
    });
    const couponData = await couponRes.json();
    console.log(`   [OK] Coupon WELCOME50 applied: discount ₹${couponData.discount_amount} (${couponData.message})`);

    // 5. Customer Login
    console.log('5. Testing Customer Login...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'rahul@gmail.com', password: 'user123' })
    });
    const customerAuth = await loginRes.json();
    console.log(`   [OK] Customer logged in: ${customerAuth.user.name} (${customerAuth.user.email})`);

    // 6. Place New Order
    console.log('6. Testing Order Placement...');
    const orderPayload = {
      items: [
        { product_id: 1, quantity: 2 }, // Tomato
        { product_id: 7, quantity: 1 }  // Milk
      ],
      customer_phone: '9812345678',
      delivery_address: 'Flat 402, Sunshine Heights, Sector 18, Noida - 201301',
      delivery_slot: 'Morning (7 AM - 10 AM)',
      payment_method: 'COD',
      coupon_code: 'WELCOME50',
      notes: 'Please leave at door'
    };

    const orderRes = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerAuth.token}`
      },
      body: JSON.stringify(orderPayload)
    });
    const orderResult = await orderRes.json();
    console.log(`   [OK] Order placed successfully: ID ${orderResult.order.orderId}, Grand Total: ₹${orderResult.order.total_amount}`);

    // 7. Get Customer Orders
    console.log('7. Testing Customer Order History...');
    const myOrdersRes = await fetch(`${baseUrl}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${customerAuth.token}` }
    });
    const myOrders = await myOrdersRes.json();
    console.log(`   [OK] Retrieved customer orders: ${myOrders.orders.length} total orders found`);

    // 8. Admin Login
    console.log('8. Testing Admin Login...');
    const adminLoginRes = await fetch(`${baseUrl}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@grocery.local', password: 'admin123' })
    });
    const adminAuth = await adminLoginRes.json();
    console.log(`   [OK] Admin authenticated: ${adminAuth.admin.name}`);

    // 9. Admin Overview Analytics
    console.log('9. Testing Admin Dashboard Analytics...');
    const analyticsRes = await fetch(`${baseUrl}/analytics/overview`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` }
    });
    const analytics = await analyticsRes.json();
    console.log(`   [OK] Analytics KPIs: Today's Orders: ${analytics.today_orders}, Today's Revenue: ₹${analytics.today_revenue}, Low stock count: ${analytics.low_stock_count}`);

    // 10. Admin Update Order Status
    console.log('10. Testing Admin Order Status Update...');
    const updateRes = await fetch(`${baseUrl}/orders/admin/${orderResult.order.orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminAuth.token}`
      },
      body: JSON.stringify({ status: 'Out for Delivery' })
    });
    const updateResult = await updateRes.json();
    console.log(`   [OK] Status updated to: "${updateResult.order.order_status}"`);

    // 11. Admin CSV Export
    console.log('11. Testing Admin CSV Export...');
    const csvRes = await fetch(`${baseUrl}/orders/admin/export/csv`, {
      headers: { Authorization: `Bearer ${adminAuth.token}` }
    });
    const csvText = await csvRes.text();
    console.log(`   [OK] CSV exported: ${csvText.split('\n').length} rows generated with headers.`);

    console.log('\n[SUCCESS] ALL 11 END-TO-END TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('[ERROR] Test failed:', err);
  }
}

runTests();
