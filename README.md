# FreshCart Grocery

A full-stack grocery e-commerce web application built in the style of Blinkit and Flipkart Grocery. The application has two separate surfaces: a customer-facing storefront and a restricted admin portal, both served from the same codebase.

---

## Notice

This project is not an original commercial product and does not claim to be one. It was built entirely as a personal practice exercise to develop and strengthen skills in full-stack web development, including React, Node.js, SQLite, REST API design, and UI implementation.

The primary intent of this project is educational. It is intended to serve as a reference for developers who are learning how to structure a grocery or e-commerce style application, and to provide practical inspiration for UI design decisions such as layout, navigation patterns, product listing, cart management, checkout flow, and admin dashboards.

If you find this project useful, you are welcome to clone this repository and use it freely as a starting point or reference for your own projects. No attribution is required, though it is always appreciated. Feel free to adapt, modify, and build upon it however suits your needs.

---

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Customer Storefront](#customer-storefront)
5. [Admin Portal](#admin-portal)
6. [API Reference](#api-reference)
7. [Database Schema](#database-schema)
8. [Authentication and Security](#authentication-and-security)
9. [Client-Side Architecture](#client-side-architecture)
10. [File Reference](#file-reference)

---

## Tech Stack

### Frontend (client)

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| Vite | 5.4.2 | Dev server and bundler |
| Lucide React | 1.16.0 | Icon library |
| Canvas Confetti | 1.9.4 | Order success animation |
| Vanilla CSS | - | All styling, no CSS framework |

### Backend (server)

| Technology | Version | Purpose |
|---|---|---|
| Node.js | - | Runtime |
| Express | 4.19.2 | HTTP server and routing |
| better-sqlite3 | 13.0.3 | Embedded SQLite database |
| jsonwebtoken | 9.0.2 | JWT-based authentication |
| bcryptjs | 2.4.3 | Password hashing |
| dotenv | 16.4.5 | Environment variable loading |
| cors | 2.8.5 | Cross-origin request handling |

---

## Project Structure

```
Grocery Project/
|
|-- package.json                  Root scripts to run client and server together
|
|-- client/                       React frontend application
|   |-- index.html
|   |-- package.json
|   |-- vite.config.js
|   |-- src/
|       |-- main.jsx              Application entry point
|       |-- App.jsx               Root component, routing, global state
|       |-- index.css             Global design system and all component styles
|       |
|       |-- api/
|       |   |-- api.js            Centralized API client for all HTTP calls
|       |
|       |-- context/
|       |   |-- AuthContext.jsx   Customer and admin authentication state
|       |   |-- CartContext.jsx   Shopping cart state and operations
|       |
|       |-- components/           Reusable UI components (storefront)
|       |   |-- Navbar.jsx        Top navigation bar with search and category tabs
|       |   |-- CartDrawer.jsx    Slide-in cart sidebar
|       |   |-- StickyCartBar.jsx Fixed bottom cart summary bar
|       |   |-- AuthModal.jsx     Login and registration modal
|       |   |-- HeroBanner.jsx    Homepage rotating promotional banners
|       |   |-- CategoryGrid.jsx  Category icon grid on homepage
|       |   |-- ProductCard.jsx   Individual product listing card
|       |   |-- ToastNotification.jsx  Global toast message system
|       |
|       |-- pages/                Full-page view components (storefront)
|       |   |-- HomePage.jsx      Product listing, filters, search results
|       |   |-- CheckoutPage.jsx  Multi-step checkout: address, slot, payment
|       |   |-- OrderSuccessPage.jsx  Confirmation and confetti after order
|       |   |-- MyOrdersPage.jsx  Customer order history
|       |
|       |-- admin/                Admin portal components
|           |-- AdminLogin.jsx    Admin-only login screen
|           |-- AdminLayout.jsx   Admin shell with sidebar navigation
|           |-- AdminDashboard.jsx    Analytics overview and key metrics
|           |-- AdminOrders.jsx   Order management table with filters
|           |-- AdminOrderDetailsModal.jsx  Order detail popup
|           |-- AdminProducts.jsx     Product management table
|           |-- AdminProductModal.jsx Add and edit product form
|
|-- server/                       Node.js + Express backend
    |-- package.json
    |-- src/
        |-- server.js             Entry point, middleware setup, route mounting
        |-- db.js                 SQLite initialization and schema creation
        |-- seed.js               Initial data: categories, products, coupons, admin user
        |-- middleware/
        |   |-- auth.js           JWT authentication middleware for customer and admin
        |-- routes/
            |-- auth.js           Register, login, admin login, profile endpoints
            |-- products.js       Product and category CRUD endpoints
            |-- orders.js         Order placement, history, admin management, CSV export
            |-- coupons.js        Coupon validation and listing
            |-- analytics.js      Admin dashboard metrics and trends
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running the Application

The client and server must run simultaneously in separate terminals.

**Terminal 1 - Start the backend server:**
```bash
cd server
npm run dev
```
The server starts on `http://localhost:5000`. It uses Node's built-in `--watch` flag to restart automatically on file changes.

**Terminal 2 - Start the frontend:**
```bash
cd client
npm run dev
```
The client starts on `http://localhost:5173`.

### Default Admin Credentials

| Field | Value |
|---|---|
| URL | `http://localhost:5173/#admin/login` |
| Email | `admin@grocery.local` |
| Password | `admin123` |

---

## Customer Storefront

The storefront is accessible at `http://localhost:5173`. It does not require login to browse, but login is required to place an order.

### Navigation and Routing

Routing is hash-based (no React Router). The `App.jsx` root component reads `window.location.hash` to determine which view to render and listens for the browser `hashchange` event to update state. The available views and their corresponding hashes are:

| View | Hash |
|---|---|
| Home / Product Listing | `#` or empty |
| Checkout | `#checkout` |
| Order Success | Internal state, no hash |
| My Orders | `#orders` |
| Admin Portal | `#admin` |
| Admin Login | `#admin/login` |

### Navbar

File: `client/src/components/Navbar.jsx`

The top navigation bar contains:

- The FreshCart brand logo and name
- A live search input that filters products as the user types. The search resets the category filter when used.
- A horizontal scrollable row of category tabs fetched from the API. Selecting a category filters the product list and clears the active search.
- An "All" tab that resets category filtering.
- A cart icon button showing the live item count from CartContext.
- A user account button that opens the AuthModal if the user is not logged in, or shows the logged-in user name with a logout option if they are.
- A link to the My Orders page when the user is authenticated.

### Hero Banner

File: `client/src/components/HeroBanner.jsx`

An auto-rotating promotional banner displayed at the top of the homepage. It cycles through a set of promotional slides with a configurable interval and includes manual left/right navigation arrows and dot indicators.

### Category Grid

File: `client/src/components/CategoryGrid.jsx`

A visual grid of category cards displayed below the hero banner on the homepage. Each card shows the category icon or image and name. Clicking a card filters the product listing to that category.

### Product Listing

File: `client/src/pages/HomePage.jsx`

The main content of the homepage. It receives the products array, loading state, and filter state from `App.jsx` as props. Features include:

- A sort dropdown with options: Popular, Price Low to High, Price High to Low, Best Discount, and Top Rated.
- Products are displayed in a responsive grid.
- A loading skeleton state shown while the API call is in progress.
- An empty state message when no products match the current filter or search.
- Each product is rendered using the `ProductCard` component.

### Product Card

File: `client/src/components/ProductCard.jsx`

Displays a single product with its image, name, unit/weight, price, MRP with strikethrough, discount percentage, and rating. The card has an Add to Cart button. If the item is already in the cart, the button is replaced with a quantity increment/decrement control. Clicking Add triggers the `addToCart` function from CartContext.

### Cart Drawer

File: `client/src/components/CartDrawer.jsx`

A slide-in panel from the right side of the screen that shows the current cart. It is controlled by a boolean `isCartOpen` in CartContext. Features:

- A list of all cart items with their product image, name, unit, price, and quantity controls.
- Per-item subtotal.
- A section showing available coupons fetched from the API. The user can copy a coupon code with one click.
- A coupon code input with an Apply button. Applied discounts are reflected in the total.
- Order summary: subtotal, discount, delivery fee (free above Rs. 299, Rs. 29 below), and grand total.
- A Proceed to Checkout button that navigates to the checkout page.
- The cart state persists to `localStorage` so items survive a page refresh.

### Sticky Cart Bar

File: `client/src/components/StickyCartBar.jsx`

A fixed bar at the bottom of the viewport showing the item count and total price with a quick-access button to open the cart drawer. It only renders when the cart has at least one item and the current view is the homepage.

### Authentication Modal

File: `client/src/components/AuthModal.jsx`

A centered modal dialog with two tabs: Login and Sign Up. It is controlled by `showAuthModal` state in AuthContext. Features:

- Login form: email and password fields.
- Sign Up form: name, email, phone, password, and optional delivery address.
- On successful login or registration, the JWT token is stored in `localStorage` under the key `freshcart_token` and the user state in AuthContext is updated.
- Form-level error messages are displayed inline.
- The modal closes on backdrop click or the close button.

### Checkout Page

File: `client/src/pages/CheckoutPage.jsx`

A multi-step checkout flow. The page requires the user to be logged in; if not, it shows an authentication prompt. Steps:

1. **Delivery Address**: Pre-filled from the user profile address. The user can edit it inline and save it back to their profile.
2. **Delivery Slot**: A selection of time slots (Express 30-45 mins, Morning, Afternoon, Evening).
3. **Payment Method**: Cash on Delivery, UPI, or Card.
4. **Order Review**: Shows the cart items, coupon discount applied from the cart drawer, delivery fee, and grand total.

When the Place Order button is clicked, the API call validates all items against live stock, applies the coupon server-side, calculates the final total, inserts the order into the database, and decrements product stock, all within a single SQLite transaction. On success, the app navigates to the Order Success page.

### Order Success Page

File: `client/src/pages/OrderSuccessPage.jsx`

Displayed after a successful order placement. Shows the order ID, summary of items, payment method, estimated delivery, and the total charged. A confetti animation plays on mount. Buttons navigate to the homepage or My Orders page.

### My Orders Page

File: `client/src/pages/MyOrdersPage.jsx`

Accessible at `#orders`. Requires authentication. Fetches and displays all past orders for the logged-in customer in reverse chronological order. Each order card shows:

- Order ID, date, and status badge (color-coded).
- Payment method and payment status.
- Itemized list of products ordered.
- Subtotal, discount, delivery fee, and total breakdown.

---

## Admin Portal

The admin portal is a completely separate UI surface that replaces the entire page layout. It is accessible at `http://localhost:5173/#admin/login`.

### Admin Login

File: `client/src/admin/AdminLogin.jsx`

A standalone login screen that appears for the `#admin/login` hash or when navigating to `#admin` without a valid admin session. It posts credentials to the `/api/auth/admin-login` endpoint. On success, the admin JWT is stored in `localStorage` under `freshcart_admin_token` and the admin state in AuthContext is set. A "Back to Store" link returns to the customer storefront.

### Admin Layout

File: `client/src/admin/AdminLayout.jsx`

The shell component for the entire admin portal. It renders a fixed left sidebar containing:

- The store name and "Admin Portal" label.
- Navigation tabs: Dashboard, Orders, and Products. Clicking a tab updates the `adminTab` state in `App.jsx`.
- A "View Storefront" link that navigates back to the customer-facing homepage.
- A Logout button that clears the admin token from `localStorage` and resets auth state.

The main content area to the right of the sidebar renders the active tab component.

### Admin Dashboard

File: `client/src/admin/AdminDashboard.jsx`

The default tab on the admin portal. Makes a single API call to `/api/analytics/overview` on mount and displays the following:

**Key Metric Cards:**
- Today's Orders count.
- Today's Revenue in rupees.
- Total All-Time Orders.
- Total All-Time Revenue.
- Average Order Value.
- Number of Low Stock products (stock at or below 5 units).

**Order Status Breakdown:**
A visual display of the count for each order status: Placed, Packed, Out for Delivery, Delivered, and Cancelled.

**7-Day Revenue and Order Trend:**
A table showing the order count and revenue for each of the last 7 days. The query uses a SQLite recursive CTE to ensure all 7 days appear even if there were no orders on a given day.

**Top 5 Best-Selling Products:**
A ranked list of products by total units sold across all orders, showing the product name, units sold, and total revenue generated.

**Low Stock Alerts:**
A list of all active products with 5 or fewer units remaining. Each row shows the product name, category, current stock, and price.

### Admin Orders

File: `client/src/admin/AdminOrders.jsx`

A full-featured order management table. Features:

- Filter by order status (All, Placed, Packed, Out for Delivery, Delivered, Cancelled).
- Filter by date using a date picker input.
- Search by Order ID, customer name, phone, or email.
- All filters are applied server-side; the API supports combinations of all three simultaneously.
- Paginated results (50 per page).
- Each row shows: Order ID, date/time, customer name, phone, total amount, payment method, payment status, and order status.
- A status badge with distinct colors for each order state.
- Clicking a row opens the `AdminOrderDetailsModal`.
- An Export CSV button downloads a CSV file of all currently filtered orders.

### Admin Order Details Modal

File: `client/src/admin/AdminOrderDetailsModal.jsx`

A modal dialog showing the complete details of a selected order:

- Order ID, placement timestamp, and all customer contact information.
- Delivery address and chosen delivery slot.
- Full itemized list with product name, unit, price per unit, quantity, and line total.
- Pricing breakdown: subtotal, coupon discount, delivery fee, and grand total.
- Coupon code used (if any).
- Two dropdown selectors to update the Order Status and Payment Status independently.
- An Update button that calls `PATCH /api/orders/admin/:id/status`. The change is reflected immediately in the modal and in the parent orders table without a full page reload.

### Admin Products

File: `client/src/admin/AdminProducts.jsx`

A product management table showing all products including inactive ones. Features:

- A search input to filter the displayed product list client-side by name or category.
- Filter by category dropdown.
- Toggle to show or hide inactive products.
- Each row shows: product image thumbnail, name, category, unit, selling price, MRP, discount percentage, stock count, and active/inactive status badge.
- A toggle button to activate or deactivate a product (marks it as in or out of stock without deleting it).
- An Edit button that opens the `AdminProductModal` pre-filled with the product current data.
- A Delete button with a confirmation step that permanently removes the product.
- An Add Product button that opens the `AdminProductModal` with empty fields.

### Admin Product Modal

File: `client/src/admin/AdminProductModal.jsx`

A form modal used for both adding and editing products. Fields:

| Field | Description |
|---|---|
| Name | Product display name |
| Category | Dropdown of all categories from the database |
| Unit | Package size description, e.g., 500g or 1 Litre |
| Selling Price | Actual sale price in rupees |
| MRP | Maximum retail price for strikethrough display |
| Stock | Current inventory quantity |
| Image URL | External image URL (defaults to a fallback if left blank) |
| Description | Optional product description |

Submitting calls either `POST /api/products` for a new product or `PUT /api/products/:id` for an edit, with the admin JWT in the Authorization header.

---

## API Reference

All API routes are prefixed with `/api`. The base URL during development is `http://localhost:5000`.

### Authentication Routes - /api/auth

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | /api/auth/register | None | Create a new customer account |
| POST | /api/auth/login | None | Customer login, returns JWT (7-day expiry) |
| POST | /api/auth/admin-login | None | Admin login, returns JWT (1-day expiry) |
| GET | /api/auth/me | Customer JWT | Get current user profile |
| PUT | /api/auth/me | Customer JWT | Update name, phone, and address |

**Register request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "9876543210",
  "password": "secret123",
  "address": "123 Main Street, Delhi"
}
```

**Login request body:**
```json
{
  "email": "jane@example.com",
  "password": "secret123"
}
```

### Product Routes - /api/products

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | /api/products/categories | None | List all categories |
| GET | /api/products | None | List products with optional filters |
| GET | /api/products/:id | None | Get a single product by ID |
| POST | /api/products | Admin JWT | Add a new product |
| PUT | /api/products/:id | Admin JWT | Update an existing product |
| PATCH | /api/products/:id/toggle-status | Admin JWT | Toggle product active/inactive |
| DELETE | /api/products/:id | Admin JWT | Delete a product permanently |

**GET /api/products query parameters:**

| Parameter | Values | Description |
|---|---|---|
| category | category ID or "all" | Filter by category |
| search | string | Search name, description, and category |
| sort | popular, price_asc, price_desc, discount, rating | Sort order |
| includeInactive | true | Include out-of-stock products |

### Order Routes - /api/orders

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| POST | /api/orders | Customer JWT | Place a new order |
| GET | /api/orders/my-orders | Customer JWT | Get the logged-in customer orders |
| GET | /api/orders/:id | None | Get a single order by ID |
| GET | /api/orders/admin/all | Admin JWT | Get all orders with filters and pagination |
| PATCH | /api/orders/admin/:id/status | Admin JWT | Update order and/or payment status |
| GET | /api/orders/admin/export/csv | Admin JWT | Download filtered orders as CSV |

**POST /api/orders request body:**
```json
{
  "items": [
    { "product_id": 1, "quantity": 2 },
    { "product_id": 5, "quantity": 1 }
  ],
  "delivery_address": "123 Main Street, Delhi",
  "delivery_slot": "Express (30-45 mins)",
  "payment_method": "COD",
  "coupon_code": "SAVE50",
  "notes": "Leave at door"
}
```

**GET /api/orders/admin/all query parameters:**

| Parameter | Description |
|---|---|
| status | Filter by order status |
| date | Filter by date in YYYY-MM-DD format |
| search | Search order ID, customer name, phone, email |
| page | Page number, default 1 |
| limit | Results per page, default 50 |

**PATCH /api/orders/admin/:id/status request body:**
```json
{
  "status": "Out for Delivery",
  "payment_status": "Paid"
}
```

Valid order statuses: `Placed`, `Packed`, `Out for Delivery`, `Delivered`, `Cancelled`.

### Coupon Routes - /api/coupons

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | /api/coupons | None | List all active coupons |
| POST | /api/coupons/validate | None | Validate a coupon code against a subtotal |

**POST /api/coupons/validate request body:**
```json
{
  "code": "SAVE50",
  "subtotal": 499
}
```

### Analytics Routes - /api/analytics

| Method | Endpoint | Auth Required | Description |
|---|---|---|---|
| GET | /api/analytics/overview | Admin JWT | Full dashboard metrics |

**Response from /api/analytics/overview:**
```json
{
  "today_orders": 12,
  "today_revenue": 4850,
  "total_orders": 320,
  "total_revenue": 148000,
  "avg_order_value": 462,
  "low_stock_count": 3,
  "low_stock_products": [],
  "status_breakdown": {
    "Placed": 5,
    "Packed": 3,
    "Out for Delivery": 2,
    "Delivered": 298,
    "Cancelled": 12
  },
  "top_products": [],
  "seven_day_trend": [
    { "date": "2026-09-22", "order_count": 8, "revenue": 3200 }
  ]
}
```

### Health Check

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Returns server status and timestamp |

---

## Database Schema

The database is a SQLite file located at `server/data/grocery.db`. It is created automatically on first run. WAL (Write-Ahead Logging) mode is enabled for better read/write concurrency. Foreign key enforcement is enabled.

### users

| Column | Type | Notes |
|---|---|---|
| id | INTEGER | Primary key, auto-increment |
| name | TEXT | Required |
| email | TEXT | Unique, required |
| phone | TEXT | Optional |
| password | TEXT | bcrypt hash |
| address | TEXT | Optional delivery address |
| role | TEXT | "customer" or "admin", default "customer" |
| created_at | DATETIME | Auto-set on insert |

### categories

| Column | Type | Notes |
|---|---|---|
| id | TEXT | Primary key, e.g., "fruits", "dairy" |
| name | TEXT | Display name |
| tagline | TEXT | Short descriptor |
| icon | TEXT | Emoji or symbol |
| image | TEXT | Image URL |
| display_order | INTEGER | Controls sort order in UI |

### products

| Column | Type | Notes |
|---|---|---|
| id | INTEGER | Primary key, auto-increment |
| name | TEXT | Required |
| category_id | TEXT | Foreign key to categories |
| unit | TEXT | e.g., "500g", "1 Litre" |
| price | REAL | Selling price |
| mrp | REAL | Original price for strikethrough |
| image | TEXT | Image URL |
| stock | INTEGER | Inventory count, decremented on order |
| is_active | INTEGER | 1 = visible, 0 = hidden |
| description | TEXT | Optional |
| rating | REAL | Default 4.6 |
| rating_count | INTEGER | Default 84 |
| created_at | DATETIME | Auto-set |

### coupons

| Column | Type | Notes |
|---|---|---|
| code | TEXT | Primary key, uppercase |
| discount_type | TEXT | "fixed" or "percent" |
| discount_value | REAL | Amount or percentage |
| min_order_amount | REAL | Minimum subtotal to apply coupon |
| description | TEXT | Human-readable description |
| is_active | INTEGER | 1 = active, 0 = disabled |

### orders

| Column | Type | Notes |
|---|---|---|
| id | TEXT | Primary key, format ORD-YYYYMMDD-XXXX |
| user_id | INTEGER | Foreign key to users |
| customer_name | TEXT | Snapshot at time of order |
| customer_email | TEXT | Snapshot |
| customer_phone | TEXT | Snapshot |
| delivery_address | TEXT | Snapshot |
| delivery_slot | TEXT | Selected delivery window |
| payment_method | TEXT | COD, UPI, or CARD |
| payment_status | TEXT | Pending or Paid |
| subtotal | REAL | Sum of all item totals |
| discount | REAL | Coupon discount applied |
| delivery_fee | REAL | Rs. 0 if subtotal >= 299, else Rs. 29 |
| total_amount | REAL | subtotal - discount + delivery_fee |
| coupon_code | TEXT | Coupon used, if any |
| order_status | TEXT | Placed, Packed, Out for Delivery, Delivered, Cancelled |
| notes | TEXT | Optional customer note |
| created_at | DATETIME | Auto-set |

### order_items

| Column | Type | Notes |
|---|---|---|
| id | INTEGER | Primary key, auto-increment |
| order_id | TEXT | Foreign key to orders, CASCADE on delete |
| product_id | INTEGER | Reference to products |
| product_name | TEXT | Snapshot of name at time of order |
| product_image | TEXT | Snapshot of image URL |
| unit | TEXT | Snapshot of unit |
| price | REAL | Price per unit at time of order |
| quantity | INTEGER | Quantity ordered |
| total | REAL | price * quantity |

---

## Authentication and Security

### JWT Strategy

Two separate JWT flows exist in the same system using the same JWT_SECRET.

**Customer tokens:**
- Stored in `localStorage` under key `freshcart_token`.
- Expire after 7 days.
- Carry payload: id, name, email, phone, address, role.
- Required for: placing orders, viewing order history, updating profile.

**Admin tokens:**
- Stored in `localStorage` under key `freshcart_admin_token`.
- Expire after 1 day.
- Carry payload: id, name, email, role (must equal "admin").
- Required for: all admin API endpoints.

### Middleware

File: `server/src/middleware/auth.js`

- `authenticateUser`: Reads the `Authorization: Bearer <token>` header, verifies the JWT, and attaches the decoded payload to `req.user`.
- `authenticateAdmin`: Same process as authenticateUser, but additionally checks that `decoded.role === "admin"`. Returns 403 Forbidden if the role does not match.

### Password Hashing

All passwords are hashed using bcrypt with a salt rounds value of 10 before being stored in the database. Plaintext passwords are never stored.

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| PORT | 5000 | Server listening port |
| JWT_SECRET | grocery_secret_key_2026_softlaunch | Secret for signing JWTs |

Create a `.env` file in the `server/` directory to override defaults in production.

---

## Client-Side Architecture

### State Management

There is no external state management library. All state is managed with React built-in hooks and the Context API.

- **AuthContext**: Authentication state for both customer and admin.
- **CartContext**: Cart items, cart open/close state, coupon state.
- **App.jsx**: Storefront-level state including products, categories, selected category, search query, sort preference, and current view.

### Cart Persistence

Cart items are serialized to JSON and stored in `localStorage` under the key `freshcart_cart`. The CartContext reads this on mount and writes to it whenever the cart changes, ensuring the cart survives page refreshes.

### Error Boundary

`App.jsx` wraps all views in a React class-based `ErrorBoundary` component. If any child component throws an unhandled error during rendering, the error boundary catches it and displays a full-screen error message with a Reload button, preventing blank white screens.

### API Client

File: `client/src/api/api.js`

A single exported `api` object containing all API call functions. There is no third-party HTTP library; all calls use the browser native `fetch` API. The file contains two private helper functions:

- `getCustomerAuthHeader()`: Reads `freshcart_token` from localStorage and returns the Authorization header object.
- `getAdminAuthHeader()`: Reads `freshcart_admin_token` from localStorage and returns the Authorization header object.

All API functions throw errors if the HTTP response is not OK, allowing callers to use try/catch for error handling.

### Styling

File: `client/src/index.css`

All CSS is written in a single global stylesheet using vanilla CSS. The file defines:

- CSS custom properties (variables) for the color palette, spacing, typography, border radius, and shadows.
- Base resets and typography defaults.
- Utility classes for layout and spacing.
- Component-level styles scoped by class names.
- Responsive breakpoints using standard media queries.

---

## File Reference

| File | Path | Description |
|---|---|---|
| App.jsx | client/src/App.jsx | Root component, routing logic, global product/category state |
| main.jsx | client/src/main.jsx | React DOM render entry point, context providers |
| index.css | client/src/index.css | Global CSS design system |
| api.js | client/src/api/api.js | All HTTP API call functions |
| AuthContext.jsx | client/src/context/AuthContext.jsx | Customer and admin auth state |
| CartContext.jsx | client/src/context/CartContext.jsx | Cart state, localStorage sync |
| Navbar.jsx | client/src/components/Navbar.jsx | Top navigation, search, category tabs |
| CartDrawer.jsx | client/src/components/CartDrawer.jsx | Side cart panel, coupon input, order summary |
| StickyCartBar.jsx | client/src/components/StickyCartBar.jsx | Fixed bottom cart bar |
| AuthModal.jsx | client/src/components/AuthModal.jsx | Login and registration modal |
| HeroBanner.jsx | client/src/components/HeroBanner.jsx | Auto-rotating promotional banner |
| CategoryGrid.jsx | client/src/components/CategoryGrid.jsx | Homepage category icon grid |
| ProductCard.jsx | client/src/components/ProductCard.jsx | Product grid item with add to cart |
| ToastNotification.jsx | client/src/components/ToastNotification.jsx | Global toast message display |
| HomePage.jsx | client/src/pages/HomePage.jsx | Product listing, sort, empty states |
| CheckoutPage.jsx | client/src/pages/CheckoutPage.jsx | Multi-step checkout flow |
| OrderSuccessPage.jsx | client/src/pages/OrderSuccessPage.jsx | Post-order confirmation page |
| MyOrdersPage.jsx | client/src/pages/MyOrdersPage.jsx | Customer order history |
| AdminLogin.jsx | client/src/admin/AdminLogin.jsx | Admin authentication screen |
| AdminLayout.jsx | client/src/admin/AdminLayout.jsx | Admin portal shell and sidebar |
| AdminDashboard.jsx | client/src/admin/AdminDashboard.jsx | Analytics metrics and charts |
| AdminOrders.jsx | client/src/admin/AdminOrders.jsx | Order management table |
| AdminOrderDetailsModal.jsx | client/src/admin/AdminOrderDetailsModal.jsx | Order detail and status update modal |
| AdminProducts.jsx | client/src/admin/AdminProducts.jsx | Product management table |
| AdminProductModal.jsx | client/src/admin/AdminProductModal.jsx | Add/edit product form modal |
| server.js | server/src/server.js | Express app entry point |
| db.js | server/src/db.js | SQLite connection and schema init |
| seed.js | server/src/seed.js | Database seeding with default data |
| auth.js (middleware) | server/src/middleware/auth.js | JWT verification middleware |
| auth.js (route) | server/src/routes/auth.js | Register, login, profile endpoints |
| products.js (route) | server/src/routes/products.js | Product and category endpoints |
| orders.js (route) | server/src/routes/orders.js | Order placement and management |
| coupons.js (route) | server/src/routes/coupons.js | Coupon validation and listing |
| analytics.js (route) | server/src/routes/analytics.js | Admin dashboard data |
