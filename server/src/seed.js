import bcrypt from 'bcryptjs';
import db, { initDatabase } from './db.js';

export function seedData() {
  initDatabase();

  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) {
    console.log('Database already contains data. Skipping initial seeding.');
    return;
  }

  console.log('Seeding initial grocery database...');

  const insertUser = db.prepare(`
    INSERT INTO users (name, email, phone, password, address, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const adminPasswordHash = bcrypt.hashSync('admin123', 10);
  const customerPasswordHash = bcrypt.hashSync('user123', 10);

  insertUser.run('Store Admin', 'admin@grocery.local', '9876543210', adminPasswordHash, 'Main Grocery Hub, Sector 18, Noida', 'admin');
  const demoCustomerId = insertUser.run('Rahul Sharma', 'rahul@gmail.com', '9812345678', customerPasswordHash, 'Flat 402, Sunshine Heights, Indirapuram, Ghaziabad, UP - 201014', 'customer').lastInsertRowid;

  // 1. Categories
  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, tagline, icon, image, display_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const categories = [
    {
      id: 'fruits-veg',
      name: 'Fruits & Vegetables',
      tagline: 'Farm fresh & crispy',
      icon: 'Apple',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
      display_order: 1
    },
    {
      id: 'dairy-bread',
      name: 'Dairy, Bread & Eggs',
      tagline: 'Fresh milk & bakery',
      icon: 'Milk',
      image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80',
      display_order: 2
    },
    {
      id: 'snacks-munchies',
      name: 'Snacks & Munchies',
      tagline: 'Chips, namkeen & cookies',
      icon: 'Cookie',
      image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80',
      display_order: 3
    },
    {
      id: 'beverages',
      name: 'Cold Drinks & Juices',
      tagline: 'Soft drinks & energy sips',
      icon: 'GlassWater',
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
      display_order: 4
    },
    {
      id: 'staples-dals',
      name: 'Atta, Rice & Dals',
      tagline: 'Kitchen essentials & grains',
      icon: 'Wheat',
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      display_order: 5
    },
    {
      id: 'instant-frozen',
      name: 'Instant & Ready to Eat',
      tagline: 'Noodles, pasta & soup',
      icon: 'Utensils',
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
      display_order: 6
    },
    {
      id: 'personal-care',
      name: 'Personal Care',
      tagline: 'Soaps, shampoo & oral care',
      icon: 'Sparkles',
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=600&q=80',
      display_order: 7
    },
    {
      id: 'household',
      name: 'Household & Cleaning',
      tagline: 'Detergent, cleaners & wipes',
      icon: 'Home',
      image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
      display_order: 8
    }
  ];

  categories.forEach(c => {
    insertCategory.run(c.id, c.name, c.tagline, c.icon, c.image, c.display_order);
  });

  // 2. Products
  const insertProduct = db.prepare(`
    INSERT INTO products (name, category_id, unit, price, mrp, image, stock, is_active, description, rating, rating_count)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const products = [
    // Fruits & Veg
    {
      name: 'Fresh Hybrid Tomato (Tamatar)',
      category_id: 'fruits-veg',
      unit: '1 kg',
      price: 38,
      mrp: 50,
      image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
      stock: 45,
      description: 'Handpicked fresh and juicy hybrid tomatoes sourced directly from local farmers.',
      rating: 4.8,
      rating_count: 240
    },
    {
      name: 'Fresh Onion (Pyaz)',
      category_id: 'fruits-veg',
      unit: '1 kg',
      price: 32,
      mrp: 45,
      image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
      stock: 60,
      description: 'Firm and crispy Indian onions, perfect for rich curries and daily cooking.',
      rating: 4.7,
      rating_count: 310
    },
    {
      name: 'Fresh Potato (Aloo)',
      category_id: 'fruits-veg',
      unit: '1 kg',
      price: 28,
      mrp: 40,
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80',
      stock: 80,
      description: 'Starchy golden table potatoes, uniform in size and easy to cook.',
      rating: 4.6,
      rating_count: 195
    },
    {
      name: 'Shimla Fresh Green Capsicum',
      category_id: 'fruits-veg',
      unit: '500 g',
      price: 42,
      mrp: 60,
      image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=600&q=80',
      stock: 22,
      description: 'Bright green, crunchy capsicums rich in Vitamin C and antioxidants.',
      rating: 4.9,
      rating_count: 110
    },
    {
      name: 'Fresh Robusta Banana',
      category_id: 'fruits-veg',
      unit: '6 pcs (approx. 750g)',
      price: 45,
      mrp: 60,
      image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=600&q=80',
      stock: 35,
      description: 'Naturally ripened, sweet and energy-packed robusta bananas.',
      rating: 4.8,
      rating_count: 420
    },
    {
      name: 'Royal Gala Red Apples',
      category_id: 'fruits-veg',
      unit: '4 pcs (approx. 600g)',
      price: 139,
      mrp: 180,
      image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=600&q=80',
      stock: 18,
      description: 'Crisp, sweet, and aromatic premium imported Gala apples.',
      rating: 4.9,
      rating_count: 175
    },

    // Dairy & Bread
    {
      name: 'Amul Taaza Homogenised Toned Milk',
      category_id: 'dairy-bread',
      unit: '1 L',
      price: 54,
      mrp: 56,
      image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
      stock: 50,
      description: 'Amul Taaza toned milk is hygienically processed with essential nutrients.',
      rating: 4.9,
      rating_count: 890
    },
    {
      name: 'Amul Salted Butter',
      category_id: 'dairy-bread',
      unit: '500 g',
      price: 275,
      mrp: 285,
      image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=600&q=80',
      stock: 30,
      description: 'The classic taste of India! Pure dairy butter with the iconic creamy aroma.',
      rating: 4.9,
      rating_count: 650
    },
    {
      name: 'Harvest Gold 100% Atta Whole Wheat Bread',
      category_id: 'dairy-bread',
      unit: '400 g',
      price: 50,
      mrp: 55,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      stock: 25,
      description: 'Nutritious brown bread made with 100% whole wheat flour, zero maida.',
      rating: 4.7,
      rating_count: 210
    },
    {
      name: 'Farm Fresh White Table Eggs',
      category_id: 'dairy-bread',
      unit: '6 pcs pack',
      price: 55,
      mrp: 65,
      image: 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=600&q=80',
      stock: 40,
      description: 'Protein-rich clean farm eggs inspected for superior freshness.',
      rating: 4.8,
      rating_count: 530
    },
    {
      name: 'Amul Malai Fresh Paneer',
      category_id: 'dairy-bread',
      unit: '200 g',
      price: 90,
      mrp: 95,
      image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=600&q=80',
      stock: 4, // low stock test
      description: 'Soft and melt-in-mouth cottage cheese, vacuum packed for freshness.',
      rating: 4.8,
      rating_count: 310
    },

    // Snacks & Munchies
    {
      name: "Lay's India's Magic Masala Potato Chips",
      category_id: 'snacks-munchies',
      unit: '73 g',
      price: 20,
      mrp: 20,
      image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=600&q=80',
      stock: 75,
      description: 'Crispy crunchy potato chips infused with vibrant Indian spices and herbs.',
      rating: 4.8,
      rating_count: 720
    },
    {
      name: 'Haldiram’s Nagpur Aloo Bhujia',
      category_id: 'snacks-munchies',
      unit: '400 g',
      price: 110,
      mrp: 130,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
      stock: 45,
      description: 'Crispy spicy potato sev blended with tepary bean flour and Indian spices.',
      rating: 4.9,
      rating_count: 480
    },
    {
      name: 'Cadbury Dairy Milk Silk Chocolate',
      category_id: 'snacks-munchies',
      unit: '150 g',
      price: 165,
      mrp: 180,
      image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?auto=format&fit=crop&w=600&q=80',
      stock: 28,
      description: 'Silky smooth, rich creamy milk chocolate that melts instantly in your mouth.',
      rating: 4.9,
      rating_count: 940
    },
    {
      name: 'Britannia Good Day Cashew Cookies',
      category_id: 'snacks-munchies',
      unit: '200 g',
      price: 45,
      mrp: 50,
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
      stock: 3, // low stock test
      description: 'Butter-rich crunchy cookies with roasted cashew nuts in every bite.',
      rating: 4.7,
      rating_count: 360
    },

    // Cold Drinks & Juices
    {
      name: 'Coca-Cola Original Taste Soft Drink',
      category_id: 'beverages',
      unit: '750 ml',
      price: 40,
      mrp: 45,
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
      stock: 50,
      description: 'Crisp, refreshing, fizzy classic cola beverage served best chilled.',
      rating: 4.8,
      rating_count: 510
    },
    {
      name: 'Real Fruit Power 100% Mixed Fruit Juice',
      category_id: 'beverages',
      unit: '1 L',
      price: 115,
      mrp: 130,
      image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
      stock: 35,
      description: 'Delicious blend of 9 fruits rich in Vitamin C, no added preservatives.',
      rating: 4.8,
      rating_count: 290
    },
    {
      name: 'Red Bull Energy Drink',
      category_id: 'beverages',
      unit: '250 ml can',
      price: 120,
      mrp: 125,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
      stock: 40,
      description: 'Vitalizes body and mind with caffeine, taurine, and B-group vitamins.',
      rating: 4.7,
      rating_count: 310
    },

    // Staples & Grains
    {
      name: 'Aashirvaad Shudh Chakki Whole Wheat Atta',
      category_id: 'staples-dals',
      unit: '5 kg',
      price: 245,
      mrp: 290,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      stock: 30,
      description: '100% whole wheat grains processed with 3-step cleaning for soft rotis.',
      rating: 4.9,
      rating_count: 820
    },
    {
      name: 'Fortune Sunlite Refined Sunflower Oil',
      category_id: 'staples-dals',
      unit: '1 L Pouch',
      price: 142,
      mrp: 175,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80',
      stock: 35,
      description: 'Light, healthy refined oil enriched with Vitamin A & D for everyday cooking.',
      rating: 4.8,
      rating_count: 410
    },
    {
      name: 'Daawat Rozana Super Basmati Rice',
      category_id: 'staples-dals',
      unit: '5 kg',
      price: 385,
      mrp: 499,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
      stock: 22,
      description: 'Aromatic long-grain basmati rice, aged to perfection for fluffy daily meals.',
      rating: 4.8,
      rating_count: 360
    },
    {
      name: 'Tata Sampann Unpolished Toor Dal',
      category_id: 'staples-dals',
      unit: '1 kg',
      price: 168,
      mrp: 195,
      image: 'https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=600&q=80',
      stock: 26,
      description: 'High in natural protein, unpolished arhar dal with wholesome taste and aroma.',
      rating: 4.8,
      rating_count: 280
    },

    // Instant Food
    {
      name: 'Maggi 2-Minute Masala Instant Noodles (Pack of 4)',
      category_id: 'instant-frozen',
      unit: '280 g',
      price: 56,
      mrp: 60,
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=600&q=80',
      stock: 60,
      description: 'India’s favorite instant snack with the signature Tastemaker blend.',
      rating: 4.9,
      rating_count: 1100
    },
    {
      name: 'Knorr Classic Mixed Vegetable Soup',
      category_id: 'instant-frozen',
      unit: '43 g',
      price: 35,
      mrp: 40,
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=600&q=80',
      stock: 40,
      description: 'Warm, restaurant-style thick vegetable soup ready in just 3 easy steps.',
      rating: 4.6,
      rating_count: 140
    },

    // Personal Care
    {
      name: 'Dettol Original Germ Protection Liquid Handwash',
      category_id: 'personal-care',
      unit: '675 ml Refill',
      price: 119,
      mrp: 149,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
      stock: 35,
      description: 'Provides 99.9% germ protection with pine fragrance and moisturizing care.',
      rating: 4.9,
      rating_count: 510
    },
    {
      name: 'Colgate MaxFresh Spicy Fresh Red Gel Toothpaste',
      category_id: 'personal-care',
      unit: '150 g',
      price: 105,
      mrp: 130,
      image: 'https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=600&q=80',
      stock: 28,
      description: 'Infused with cooling crystals for intense freshness and germ fighting.',
      rating: 4.8,
      rating_count: 320
    },

    // Household
    {
      name: 'Surf Excel Quick Wash Detergent Powder',
      category_id: 'household',
      unit: '1 kg',
      price: 145,
      mrp: 165,
      image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
      stock: 45,
      description: 'Removes tough stains like tea, coffee, and ketchup with superior foam action.',
      rating: 4.9,
      rating_count: 670
    },
    {
      name: 'Vim Lemon Dishwash Liquid Gel',
      category_id: 'household',
      unit: '750 ml Bottle',
      price: 180,
      mrp: 215,
      image: 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?auto=format&fit=crop&w=600&q=80',
      stock: 2, // low stock test
      description: 'Degreasing lemon formula that cleans a sink full of utensils in one spoon.',
      rating: 4.8,
      rating_count: 430
    }
  ];

  products.forEach(p => {
    insertProduct.run(
      p.name,
      p.category_id,
      p.unit,
      p.price,
      p.mrp,
      p.image,
      p.stock,
      1,
      p.description,
      p.rating,
      p.rating_count
    );
  });

  // 3. Coupons
  const insertCoupon = db.prepare(`
    INSERT INTO coupons (code, discount_type, discount_value, min_order_amount, description, is_active)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const coupons = [
    {
      code: 'WELCOME50',
      discount_type: 'fixed',
      discount_value: 50,
      min_order_amount: 199,
      description: 'Flat ₹50 OFF on orders above ₹199 (Soft Launch Special)'
    },
    {
      code: 'SUPER10',
      discount_type: 'percent',
      discount_value: 10,
      min_order_amount: 499,
      description: '10% Instant OFF up to ₹100 on orders above ₹499'
    },
    {
      code: 'FREESHIP',
      discount_type: 'fixed',
      discount_value: 29,
      min_order_amount: 149,
      description: 'Free Delivery on your order above ₹149'
    }
  ];

  coupons.forEach(c => {
    insertCoupon.run(c.code, c.discount_type, c.discount_value, c.min_order_amount, c.description, 1);
  });

  // 4. Sample past orders for realistic dashboard metrics
  const insertOrder = db.prepare(`
    INSERT INTO orders (id, user_id, customer_name, customer_email, customer_phone, delivery_address, delivery_slot, payment_method, payment_status, subtotal, discount, delivery_fee, total_amount, coupon_code, order_status, notes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertOrderItem = db.prepare(`
    INSERT INTO order_items (order_id, product_id, product_name, product_image, unit, price, quantity, total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();
  const formatOffset = (hoursAgo) => {
    const d = new Date(now.getTime() - hoursAgo * 3600 * 1000);
    return d.toISOString().replace('T', ' ').substring(0, 19);
  };

  const sampleOrders = [
    {
      id: 'ORD-20260923-1001',
      user_id: demoCustomerId,
      customer_name: 'Rahul Sharma',
      customer_email: 'rahul@gmail.com',
      customer_phone: '9812345678',
      delivery_address: 'Flat 402, Sunshine Heights, Indirapuram, Ghaziabad, UP - 201014',
      delivery_slot: 'Morning (7 AM - 10 AM)',
      payment_method: 'COD',
      payment_status: 'Paid',
      subtotal: 443,
      discount: 50,
      delivery_fee: 0,
      total_amount: 393,
      coupon_code: 'WELCOME50',
      order_status: 'Delivered',
      notes: 'Please ring the doorbell twice.',
      created_at: formatOffset(18),
      items: [
        { product_id: 1, name: 'Fresh Hybrid Tomato (Tamatar)', unit: '1 kg', price: 38, quantity: 2, total: 76, image: products[0].image },
        { product_id: 7, name: 'Amul Taaza Homogenised Toned Milk', unit: '1 L', price: 54, quantity: 2, total: 108, image: products[6].image },
        { product_id: 19, name: 'Aashirvaad Shudh Chakki Whole Wheat Atta', unit: '5 kg', price: 245, quantity: 1, total: 245, image: products[18].image }
      ]
    },
    {
      id: 'ORD-20260923-1002',
      user_id: demoCustomerId,
      customer_name: 'Pooja Verma',
      customer_email: 'pooja.verma@gmail.com',
      customer_phone: '9871122334',
      delivery_address: 'House #12B, Green Park Extension, New Delhi - 110016',
      delivery_slot: 'Express (30-45 mins)',
      payment_method: 'UPI',
      payment_status: 'Paid',
      subtotal: 312,
      discount: 0,
      delivery_fee: 29,
      total_amount: 341,
      coupon_code: null,
      order_status: 'Out for Delivery',
      notes: 'Leave at security gate if not answering.',
      created_at: formatOffset(2),
      items: [
        { product_id: 12, name: "Lay's India's Magic Masala Potato Chips", unit: '73 g', price: 20, quantity: 3, total: 60, image: products[11].image },
        { product_id: 14, name: 'Cadbury Dairy Milk Silk Chocolate', unit: '150 g', price: 165, quantity: 1, total: 165, image: products[13].image },
        { product_id: 10, name: 'Farm Fresh White Table Eggs', unit: '6 pcs pack', price: 55, quantity: 1, total: 55, image: products[9].image }
      ]
    },
    {
      id: 'ORD-20260923-1003',
      user_id: demoCustomerId,
      customer_name: 'Amit Patel',
      customer_email: 'amit.patel@yahoo.com',
      customer_phone: '9988776655',
      delivery_address: 'B-604, Royal Palms, Sector 62, Noida, UP - 201309',
      delivery_slot: 'Evening (6 PM - 9 PM)',
      payment_method: 'COD',
      payment_status: 'Pending',
      subtotal: 588,
      discount: 50,
      delivery_fee: 0,
      total_amount: 538,
      coupon_code: 'WELCOME50',
      order_status: 'Placed',
      notes: 'Call before arriving.',
      created_at: formatOffset(0.5),
      items: [
        { product_id: 21, name: 'Daawat Rozana Super Basmati Rice', unit: '5 kg', price: 385, quantity: 1, total: 385, image: products[20].image },
        { product_id: 20, name: 'Fortune Sunlite Refined Sunflower Oil', unit: '1 L Pouch', price: 142, quantity: 1, total: 142, image: products[19].image },
        { product_id: 23, name: 'Maggi 2-Minute Masala Instant Noodles', unit: '280 g', price: 56, quantity: 1, total: 56, image: products[22].image }
      ]
    }
  ];

  sampleOrders.forEach(o => {
    insertOrder.run(
      o.id,
      o.user_id,
      o.customer_name,
      o.customer_email,
      o.customer_phone,
      o.delivery_address,
      o.delivery_slot,
      o.payment_method,
      o.payment_status,
      o.subtotal,
      o.discount,
      o.delivery_fee,
      o.total_amount,
      o.coupon_code,
      o.order_status,
      o.notes,
      o.created_at
    );

    o.items.forEach(item => {
      insertOrderItem.run(
        o.id,
        item.product_id,
        item.name,
        item.image,
        item.unit,
        item.price,
        item.quantity,
        item.total
      );
    });
  });

  console.log('Database seeded successfully!');
}
