# PlugNG Backend - Complete Context Document

**Save this entire document as `BACKEND_CONTEXT.md` - Feed this to your AI coding agents (Claude, Cursor, GitHub Copilot) whenever you need backend code generation.**

---

## 🎯 **PROJECT IDENTITY**

```
Project Name: PlugNG Backend API
Purpose: RESTful API for a Nigerian phone accessories e-commerce platform
Target Users: Nigerian consumers (80% mobile, 3G networks)
Scale: 1,000+ orders/month by Month 6, 10,000+ products
Critical Success Factor: Payment reliability, speed on slow networks, Nigerian payment integration
```

---

## 📋 **CORE BUSINESS RULES**

### **Payment Rules (CRITICAL - Non-Negotiable)**

```
1. PAYMENT METHOD PRIORITY
   - Bank Transfer (Paystack) = PRIMARY (incentivized with ₦100-200 discount)
   - Wallet System = SECONDARY (pre-funded, zero transaction fees for customer)
   - Card Payment = TERTIARY (available but not promoted)
   - Cash on Delivery = NOT SUPPORTED (too risky for small business)

2. PAYMENT FLOW
   - Customer selects payment method
   - If Bank Transfer: Generate unique Paystack virtual account → Display account details
   - If Wallet: Check balance → Deduct → Instant confirmation
   - If Card: Paystack popup → Redirect → Verify
   - ALL payments MUST be verified via webhook before order confirmation
   - NEVER mark order as paid without webhook confirmation

3. WEBHOOK RELIABILITY
   - Must handle duplicate webhooks (idempotent processing)
   - Must verify webhook signature (Paystack security)
   - Must handle out-of-order webhooks (payment before order creation edge case)
   - Must retry failed webhook processing (queue system)
   - Response time: <500ms (Paystack timeout is 5 seconds)

4. WALLET RULES
   - Minimum top-up: ₦1,000
   - Maximum balance: ₦500,000 (fraud prevention)
   - Bonus on top-up: ₦500 for every ₦10,000 loaded
   - Wallet can only be used for purchases (no withdrawals)
   - Transaction history must be immutable (append-only)
```

---

### **Inventory Rules**

```
1. STOCK MANAGEMENT
   - Deduct stock ONLY after payment confirmed (not on order creation)
   - Reserve stock for 30 minutes during checkout (prevent overselling)
   - Auto-release reserved stock if payment not completed
   - Low stock alert at 20% of lowStockThreshold
   - Auto-mark product as "Out of Stock" when stock = 0
   - Prevent negative stock (validation before deduction)
   - VARIANT SUPPORT: Stock is managed at the variant level. A product is "Out of Stock" only if ALL variants are at 0 stock.

2. INVENTORY UPDATES
   - Restock increases stock count
   - Sale decreases stock count
   - Return increases stock count
   - Damaged/Lost creates inventory adjustment record
   - Every stock change must have audit trail (who, when, why)

3. PRODUCT LIFECYCLE
   - Draft → Active (admin publishes)
   - Active → Out of Stock (stock = 0 or manual)
   - Out of Stock → Active (restock)
   - Active → Archived (discontinued, but keep for order history)
```

---

### **Order Processing Rules**

```
1. ORDER STATUSES (Linear progression)
   Payment: pending → paid → (failed/refunded)
   Fulfillment: pending → processing → shipped → delivered → (cancelled)

2. ORDER WORKFLOW
   Step 1: Customer creates order (status = payment_pending)
   Step 2: Payment confirmed via webhook (status = paid, fulfillment = processing)
   Step 3: Admin assigns order to packer (status = processing)
   Step 4: Order packed & handed to logistics (status = shipped, trackingNumber assigned)
   Step 5: Customer confirms delivery OR auto-confirm after 7 days (status = delivered)

3. CANCELLATION RULES
   - Customer can cancel if payment_pending (no payment yet)
   - Customer can cancel if paid but not shipped (refund to wallet)
   - Customer CANNOT cancel once shipped (must use return process)
   - Admin can cancel at any stage (must provide reason)

4. RETURN/REFUND RULES
   - Return window: 7 days from delivery
   - Condition: Unopened package, all accessories intact
   - Refund to: Wallet (instant) or Original payment method (5-7 business days)
   - Restocking fee: None (customer pays return shipping only)
```

---

### **Pricing Rules**

```
1. PRICE CALCULATION
   Subtotal = Sum of (item.price × item.quantity)
   Delivery Fee = Based on state (Lagos ₦1,200, Others ₦1,500-2,500)
   Discount = Promo code + Wallet credit + Payment method discount
   Total = Subtotal + DeliveryFee - Discount

2. DELIVERY FEE LOGIC
   - Free delivery if order total > ₦5,000 (before discount)
   - Lagos/Abuja: ₦1,200 (1-2 days)
   - Other states: ₦1,500-2,500 (3-5 days) based on state
   - Express delivery: +₦1,000 (same day in Lagos if ordered before 2pm)

3. DISCOUNT STACKING
   - Promo code: Max 1 per order
   - Payment method discount (bank transfer): Auto-applied
   - Wallet credit: Can combine with promo code
   - Maximum total discount: 50% of subtotal (fraud prevention)

4. PRICE IMMUTABILITY
   - Once item added to cart, price is locked for 30 minutes
   - Once order created, price is locked permanently (snapshot)
   - If product price changes, existing carts show old price with "Price changed" notice
```

---

### **User & Authentication Rules**

```
1. REGISTRATION
   - Email + Password (min 8 chars, 1 uppercase, 1 number)
   - Phone number (Nigerian: starts with 070, 080, 081, 090, 091)
   - First Name + Last Name (no special characters)
   - Email verification: Optional for first order, required for account features
   - Phone verification: SMS OTP via Termii (required before first order)

2. LOGIN
   - Can login with Email OR Phone
   - Password attempts: Max 5 within 15 minutes (then lock account for 1 hour)
   - JWT Access Token: 15 minutes lifespan
   - JWT Refresh Token: 7 days lifespan (httpOnly cookie)
   - Logout: Blacklist refresh token in Redis

3. GUEST CHECKOUT
   - Allowed (email + phone required)
   - Cart stored by sessionId (7 days expiry)
   - After payment, prompt to create account
   - If account created, migrate order to user account

4. ROLES
   - customer: Can browse, buy, view own orders
   - admin: Full access to dashboard, inventory, orders
   - (Future: vendor, support roles)
```

---

### **Nigerian Market-Specific Rules**

```
1. CURRENCY
   - All prices in Nigerian Naira (₦)
   - Store as integer kobo in database (avoid floating point errors)
   - Example: ₦2,500.00 stored as 250000 kobo
   - Display with thousand separators: ₦2,500

2. PHONE NUMBER FORMAT
   - Accept: 08012345678, 2348012345678, +2348012345678
   - Store in E.164 format: +2348012345678
   - Display as: 0801 234 5678

3. ADDRESS FORMAT
   - No zip/postal codes (Nigeria doesn't use them reliably)
   - Required fields: Street Address, City, State, Phone
   - Optional: Landmark (critical for Nigeria: "Opposite Zenith Bank")
   - State: Validate against 36 Nigerian states + FCT

4. DELIVERY ZONES
   Tier 1 (1-2 days, ₦1,200): Lagos, Abuja
   Tier 2 (2-3 days, ₦1,500): Port Harcourt, Ibadan, Benin, Enugu, Kano
   Tier 3 (3-5 days, ₦2,000): Other state capitals
   Tier 4 (5-7 days, ₦2,500): Rural areas

5. BUSINESS HOURS
   - Order processing: Mon-Sat, 9am-7pm WAT
   - Same-day delivery cutoff: 2pm WAT (Lagos only)
   - No Sunday operations (cultural respect)
```

---

## 🏗️ **TECHNICAL ARCHITECTURE**

### **Tech Stack (Zero-Cost Stack)**

```
Runtime: Node.js 20+ LTS (TypeScript strict mode)
Framework: Express.js 4.19+
Database: MongoDB Atlas (Free M0 Tier)
Caching: Redis via Upstash (Free Tier: 10k commands/day)
File Storage: Cloudflare R2 (Free Tier: 10GB storage, 1M Class A ops)
File Optimization: Sharp (Node.js library) + on-the-fly via R2 Public Bucket
Backend Host: Render (Free Tier - Note: 15-min spin-down)
Payment Gateway: Paystack (Nigerian market leader)
SMS Provider: Termii (OTP, order notifications)
Email Provider: Resend (3,000 emails/month free)
```

---

### **API Design Principles**

```
1. REST CONVENTIONS
   - Use proper HTTP methods: GET (read), POST (create), PUT/PATCH (update), DELETE
   - Plural resource names: /api/v1/products, /api/v1/orders
   - Nested resources: /api/v1/orders/:orderId/items
   - Use query params for filtering: /api/v1/products?category=cases&price[lte]=5000

2. RESPONSE FORMAT (Standardized)
   Success:
   {
     "success": true,
     "data": { ... },
     "message": "Operation successful",
     "meta": { "page": 1, "limit": 20, "total": 150 } // Pagination
   }

   Error:
   {
     "success": false,
     "error": {
       "code": "PRODUCT_NOT_FOUND",
       "message": "Product with ID xyz not found",
       "details": { ... } // Optional validation errors
     }
   }

3. STATUS CODES
   200: Success (GET, PUT, PATCH)
   201: Created (POST)
   204: No Content (DELETE)
   400: Bad Request (validation errors)
   401: Unauthorized (missing/invalid token)
   403: Forbidden (insufficient permissions)
   404: Not Found (resource doesn't exist)
   409: Conflict (duplicate, stock unavailable)
   422: Unprocessable Entity (business logic error)
   429: Too Many Requests (rate limit exceeded)
   500: Internal Server Error (unexpected errors)

4. PAGINATION
   - Default limit: 20 items
   - Max limit: 100 items
   - Response includes: total count, current page, total pages, hasNext, hasPrev
   - Query params: ?page=2&limit=50

5. FILTERING & SORTING
   - Filter by field: ?category=cases&brand=apple
   - Price range: ?price[gte]=1000&price[lte]=5000
   - Search: ?search=iphone+14+case
   - Sort: ?sort=-createdAt (desc) or ?sort=price (asc)
```

---

### **Performance Requirements (Nigerian Network Reality)**

```
1. RESPONSE TIME TARGETS
   - Simple GET (product listing): <200ms (cached), <800ms (uncached)
   - Complex GET (order with relations): <1.5s
   - Webhook processing: <500ms (CRITICAL)

2. RENDER FREE TIER (Cold Starts)
   - The backend spins down after 15 minutes of inactivity.
   - First request after spin-down can take 30-50 seconds (Cold Start).
   - SUCCESS FACTOR: Implement a "Loading" state on the frontend for initial hits.
   - OPTIONAL: Use Uptime Robot to ping the server every 14 minutes to keep it awake during business hours.

3. RESPONSE SIZE LIMITS
   - Single resource: <10KB
   - List endpoint (20 items): <100KB
   - Image URLs only (use R2 Public URL)
   - Minimize nested data (use IDs + populate selectively)

4. DATABASE QUERY OPTIMIZATION
   - Index all foreign keys (userId, productId, categoryId)
   - Index filter fields (price, category, status, createdAt)
   - Use .lean() for read-only queries
   - Pagination: Use cursor-based for large datasets

5. CACHING STRATEGY (Upstash)
   - Product listings: 5 minutes
   - Single product: 15 minutes
   - Categories: 1 hour
   - User cart: No expiry (handled by TTL index in Mongo)

6. RATE LIMITING
   - Guest users: 100 requests/15 minutes per IP
   - Authenticated users: 500 requests/15 minutes per userId
   - Webhook endpoint: Verify signature (No rate limit)
```

---

### **Security Requirements**

```
1. AUTHENTICATION
   - Passwords: bcrypt hash with salt rounds = 10
   - JWT secrets: Minimum 256 bits (64 hex characters)
   - Access token: Short-lived (15 min), in Authorization header
   - Refresh token: Long-lived (7 days), httpOnly cookie, SameSite=Strict
   - Token blacklist: Store revoked refresh tokens in Redis

2. AUTHORIZATION
   - Middleware checks: authenticate → authorize(role)
   - Customer: Can only access own orders, cart, profile
   - Admin: Can access all resources
   - Use role-based access control (RBAC)

3. INPUT VALIDATION
   - Validate ALL inputs (body, params, query)
   - Use Zod schemas (shared with frontend)
   - Sanitize HTML (prevent XSS): Use DOMPurify or similar
   - Prevent NoSQL injection: Mongoose schema validation + explicit type checking

4. SENSITIVE DATA
   - NEVER log passwords, tokens, payment details
   - Mask phone numbers in logs: 080****5678
   - Mask email in logs: j***@example.com
   - Payment references: Log transaction ID only, not card details

5. CORS
   - Production: Whitelist frontend domain only (https://plugng.shop)
   - Development: Allow localhost:3000
   - Credentials: true (for cookies)

6. HELMET (Security Headers)
   - Content-Security-Policy
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff
   - Strict-Transport-Security (HSTS)

7. FILE UPLOAD
   - Max file size: 5MB per image
   - Allowed types: image/jpeg, image/png, image/webp
   - Scan for malware (use ClamAV or Cloudinary moderation)
   - Never store on server disk (stream directly to Cloudinary)
```

---

### **Error Handling Strategy**

```
1. ERROR TYPES
   - ValidationError: User input errors (400)
   - AuthenticationError: Missing/invalid token (401)
   - AuthorizationError: Insufficient permissions (403)
   - NotFoundError: Resource doesn't exist (404)
   - ConflictError: Duplicate or business rule violation (409)
   - PaymentError: Paystack API failure (422)
   - DatabaseError: MongoDB connection/query failure (500)
   - ExternalAPIError: Third-party service down (503)

2. ERROR RESPONSES
   Include:
   - Error code (for frontend to handle programmatically)
   - User-friendly message
   - Technical details (only in development mode)
   - Timestamp
   - Request ID (for tracing logs)

   Example:
   {
     "success": false,
     "error": {
       "code": "INSUFFICIENT_STOCK",
       "message": "Only 3 units of 'iPhone 14 Case' available",
       "details": {
         "productId": "...",
         "requested": 5,
         "available": 3
       },
       "requestId": "req_abc123",
       "timestamp": "2026-01-27T15:30:00Z"
     }
   }

3. LOGGING
   - Use Winston or Pino (structured JSON logs)
   - Log levels: error, warn, info, debug
   - Production: error + warn only
   - Development: all levels
   - Log to: Console (development), File (production), External service (Logtail, Sentry)

4. MONITORING
   - Track: Error rate, response time, database query time
   - Alert on: >5% error rate, >2s avg response time, database down
   - Tools: Sentry (errors), Uptime Robot (downtime), MongoDB Atlas monitoring
```

---

## 🗄️ **DATABASE DESIGN PRINCIPLES**

### **Schema Design Rules**

```
1. NORMALIZATION vs DENORMALIZATION
   Normalize:
   - User data (frequent updates, privacy concerns)
   - Product master data (inventory, pricing)
   
   Denormalize (Performance):
   - Order items (snapshot product data - price, name, image)
   - User address in order (shipping address doesn't change even if user updates profile)
   - Product name in cart (avoid JOIN on every cart fetch)

2. INDEXES (Critical for Performance)
   Create index on:
   - All foreign keys (userId, productId, categoryId)
   - Filter fields (category, price, status, featured)
   - Sort fields (createdAt, price, salesCount)
   - Search fields (text index on name, description)
   
   Avoid:
   - Indexing low-cardinality fields (gender, boolean)
   - Too many indexes per collection (slows writes)

3. DATA TYPES
   - Prices: Number (store kobo as integer: 250000 = ₦2,500.00)
   - Dates: Date object (not strings)
   - IDs: ObjectId (MongoDB native)
   - Phone: String (with validation, stored as E.164: +2348012345678)
   - Status: String with enum validation
   - Images: Object with url, publicId, alt

4. RELATIONSHIPS
   - One-to-Many: Embed if child is always accessed with parent (cart items in cart)
   - Many-to-Many: Reference (products ↔ categories if products can have multiple categories)
   - One-to-One: Embed if child never accessed independently (user profile in user)

5. SOFT DELETE
   - Never hard delete: orders, transactions, users
   - Add deletedAt field (null = active, Date = deleted)
   - Filter out deleted in queries: { deletedAt: null }
   - Keep for: Audit trail, analytics, legal compliance
```

---

### **Collections Overview**

```
1. users
   Purpose: Customer and admin accounts
   Key Fields: email, phone, password (hashed), wallet, addresses, role
   Indexes: email, phone, createdAt
   Relationships: Has many orders, Has one cart

2. products
   Purpose: Product catalog
   Key Fields: name, slug, images, category, options, variants, compatibility
   Indexes: slug (unique), category, price, status, featured, text(name, description)
   Relationships: Belongs to category, Referenced in orders/carts

3. categories
   Purpose: Product organization
   Key Fields: name, slug, parent (for subcategories), order
   Indexes: slug, parent
   Relationships: Has many products

4. orders
   Purpose: Customer purchases
   Key Fields: orderNumber, user, items[], total, paymentStatus, deliveryStatus
   Indexes: orderNumber (unique), user, paymentStatus, deliveryStatus, createdAt
   Relationships: Belongs to user, References products (denormalized in items)

5. carts
   Purpose: Shopping cart (persistent)
   Key Fields: user OR sessionId, items[], expiresAt (TTL index)
   Indexes: user, sessionId, expiresAt (TTL)
   Relationships: Belongs to user OR guest session

6. transactions
   Purpose: Payment audit trail
   Key Fields: orderId, userId, amount, type, status, paystackReference
   Indexes: orderId, userId, paystackReference, createdAt
   Relationships: Belongs to order and user

7. reviews (Future)
   Purpose: Product reviews
   Key Fields: productId, userId, rating, comment, verified (purchased?)
   Indexes: productId, userId, createdAt
   Relationships: Belongs to product and user
```

---

## 🔌 **EXTERNAL INTEGRATIONS**

### **Paystack Integration (CRITICAL)**

```
1. INITIALIZATION
   Endpoint: POST https://api.paystack.co/transaction/initialize
   Headers: Authorization: Bearer sk_live_xxxxx
   Body: {
     "email": "[email protected]",
     "amount": 250000, // Kobo (₦2,500.00)
     "reference": "ORD-20260127-001", // Unique order number
     "callback_url": "https://plugng.shop/payment/verify",
     "metadata": {
       "orderId": "mongoDbOrderId",
       "userId": "mongoDbUserId"
     },
     "channels": ["card", "bank", "ussd", "bank_transfer"] // Enable bank transfer!
   }
   Response: { status: true, data: { authorization_url, access_code, reference } }

2. BANK TRANSFER FLOW
   - Customer selects "Bank Transfer" at checkout
   - Initialize transaction with channels: ["bank_transfer"]
   - Paystack returns dedicated account number (valid for 1 hour)
   - Display account number to customer
   - Customer transfers from their bank app
   - Paystack detects transfer → Sends webhook
   - Our backend verifies webhook → Confirms order

3. WEBHOOK HANDLING
   URL: https://plugng.shop/api/v1/webhooks/paystack
   Events to Handle:
   - charge.success: Payment successful (mark order as paid)
   - transfer.success: Payout to our account (if we do vendor payments later)
   - charge.failed: Payment failed (notify customer)
   
   Security:
   - Verify signature: req.headers['x-paystack-signature']
   - Hash = crypto.createHmac('sha512', SECRET).update(req.body).digest('hex')
   - If hash !== signature: Reject (possible attack)
   
   Idempotency:
   - Check if transaction already processed (reference in database)
   - If yes: Return 200 OK (acknowledge) but don't process again

4. VERIFICATION (Fallback)
   Endpoint: GET https://api.paystack.co/transaction/verify/:reference
   Use Case: If webhook fails or delayed, frontend can trigger verification
   Response: { status: true, data: { status: 'success', amount, reference } }

5. ERROR HANDLING
   - Network timeout: Retry up to 3 times with exponential backoff
   - Invalid API key: Alert admin immediately (critical)
   - Insufficient balance (customer): Show clear error message
   - Card declined: Suggest bank transfer alternative
```

---

### **Cloudflare R2 Integration (Zero-Cost Storage)**

```
1. UPLOAD FLOW
   - Admin uploads image via Dashboard
   - Backend processes image using 'Sharp' (Resize to 800px, convert to WebP)
   - Upload to R2 Bucket (via AWS S3 SDK compatibility)
   - Store R2 Public URL in MongoDB: { url, key, alt }

2. OPTIMIZATION ON THE FLY
   - Use 'Sharp' in Node.js to resize/compress BEFORE uploading to save on R2 bandwidth.
   - Future: Use Cloudflare Workers to transform images directly from the R2 bucket.

3. SECURITY
   - Use Public Bucket for products (faster access)
   - Use Private Bucket + Signed URLs for sensitive documents (e.g., identity verification)
   - Bucket Policy: Restrict uploads to Backend Server IP/Origin.

4. BUCKET LIMITS (Free Tier)
   - 10GB Total Storage
   - 1 Million Class A operations per month
   - 10 Million Class B operations per month
```

---

### **Termii Integration (SMS for OTP, Notifications)**

```
1. OTP (Phone Verification)
   Endpoint: POST https://api.ng.termii.com/api/sms/otp/send
   Body: {
     "api_key": "...",
     "message_type": "NUMERIC",
     "to": "2348012345678",
     "from": "PlugNG",
     "channel": "generic",
     "pin_attempts": 3,
     "pin_time_to_live": 5, // Minutes
     "pin_length": 6,
     "pin_placeholder": "< 1234 >",
     "message_text": "Your PlugNG verification code is < 1234 >. Valid for 5 minutes.",
     "pin_type": "NUMERIC"
   }

2. ORDER NOTIFICATIONS (Transactional SMS)
   Events: Order Confirmed, Shipped, Delivered
   Template: "Hi {name}, your order #{orderNumber} has been {status}. Track: plugng.shop/orders/{id}"
   
3. COST OPTIMIZATION
   - Use SMS only for critical events (OTP, order shipped)
   - Email for less urgent (order confirmed, promotional)
   - Nigerian SMS cost: ~₦2.50 per SMS (budget accordingly)
```

---

### **Email Service (Resend or SendGrid)**

```
1. TRANSACTIONAL EMAILS
   - Welcome email (registration)
   - Email verification
   - Order confirmation (with itemized receipt)
   - Shipping notification (with tracking link)
   - Delivery confirmation
   - Password reset

2. TEMPLATE STRUCTURE
   - Use HTML templates (responsive)
   - Plain text fallback (accessibility)
   - Include: Logo, Order summary table, CTA button, Footer (social links, unsubscribe)

3. DELIVERABILITY
   - Set up DKIM, SPF, DMARC (prevent spam folder)
   - Use verified domain: [email protected]
   - Monitor bounce rate (clean invalid emails from database)

4. RATE LIMITS
   - SendGrid free: 100 emails/day
   - Resend free: 3,000 emails/month
   - Choose based on expected volume
```

---

## 📡 **API ENDPOINTS SPECIFICATION**

### **Authentication Endpoints**

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/send-otp
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

### **User Endpoints**

```
GET    /api/v1/users/me                    # Get current user profile
PUT    /api/v1/users/me                    # Update profile
POST   /api/v1/users/me/addresses          # Add address
PUT    /api/v1/users/me/addresses/:id      # Update address
DELETE /api/v1/users/me/addresses/:id      # Delete address
GET    /api/v1/users/me/orders             # Get user orders (paginated)
GET    /api/v1/users/me/wallet             # Get wallet balance + transactions
POST   /api/v1/users/me/wallet/topup       # Initiate wallet top-up (Paystack)
```

### **Product Endpoints**

```
GET    /api/v1/products                    # List products (filter, sort, paginate)
GET    /api/v1/products/:slug              # Get single product by slug
GET    /api/v1/products/search             # Search products (text search)
POST   /api/v1/products                    # Create product (admin only)
PUT    /api/v1/products/:id                # Update product (admin only)
DELETE /api/v1/products/:id                # Delete product (admin only)
GET    /api/v1/products/:id/reviews        # Get product reviews (future)
```

### **Category Endpoints**

```
GET    /api/v1/categories                  # List all categories
GET    /api/v1/categories/:slug            # Get category + products
POST   /api/v1/categories                  # Create category (admin only)
PUT    /api/v1/categories/:id              # Update category (admin only)
DELETE /api/v1/categories/:id              # Delete category (admin only)
```

### **Cart Endpoints**

```
GET    /api/v1/cart                        # Get current cart (user or session)
POST   /api/v1/cart/items                  # Add item to cart
PUT    /api/v1/cart/items/:productId       # Update item quantity
DELETE /api/v1/cart/items/:productId       # Remove item from cart
DELETE /api/v1/cart                        # Clear entire cart
```

### **Order Endpoints**

```
POST   /api/v1/orders                      # Create order from cart
GET    /api/v1/orders/:id                  # Get order details
GET    /api/v1/orders                      # List user orders (customer sees own, admin sees all)
PATCH  /api/v1/orders/:id/cancel           # Cancel order (customer or admin)
PATCH  /api/v1/orders/:id/status           # Update order status (admin only)

Admin-only:
GET    /api/v1/admin/orders                # Advanced filters (date range, status, payment)
PATCH  /api/v1/admin/orders/:id/ship       # Mark as shipped + add tracking
PATCH  /api/v1/admin/orders/:id/deliver    # Mark as delivered
```

### **Payment Endpoints**

```
POST   /api/v1/payments/initialize         # Initialize Paystack payment
GET    /api/v1/payments/verify/:reference  # Verify payment (fallback if webhook fails)
POST   /api/v1/webhooks/paystack           # Paystack webhook (handle charge.success)
```

### **Admin Endpoints**

```
GET    /api/v1/admin/dashboard             # Stats: revenue, orders, low stock
GET    /api/v1/admin/products/low-stock    # Products below threshold
POST   /api/v1/admin/products/:id/restock  # Update stock count
GET    /api/v1/admin/analytics             # Sales by category, top products, revenue trends
```

---

## 🔒 **ENVIRONMENT VARIABLES**

```bash
# Server
NODE_ENV=production
PORT=10000                                 # Render default
API_VERSION=v1

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/plugng?retryWrites=true&w=majority

# Redis (Upstash)
REDIS_URL=rediss://default:pass@region.upstash.io:6379

# JWT
JWT_ACCESS_SECRET=min-64-chars-secret
JWT_REFRESH_SECRET=different-min-64-chars-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_WEBHOOK_SECRET=whsec_xxxxx

# Cloudflare R2
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com
R2_BUCKET_NAME=plugng-products
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# Termii (SMS)
TERMII_API_KEY=TLxxxxx
TERMII_SENDER_ID=PlugNG

# Email (Resend)
RESEND_API_KEY=re_xxxxx
FROM_EMAIL=no-reply@plugng.shop

# Frontend URL
FRONTEND_URL=https://plugng-frontend.onrender.com
```

---

## 🎨 **FRONTEND HOMEPAGE ARCHITECTURE**

### **Enhanced 14-Section Homepage**

The homepage has been redesigned as a comprehensive, conversion-optimized experience with **14 strategically ordered sections** targeting Nigerian mobile users on 3G networks.

#### **Section Order \u0026 Purpose**

```
1. Hero Banner          → First impression, featured products
2. Trust Banner         → Build credibility immediately
3. Payment Highlight    → Promote bank transfer discount
4. Delivery Info        → Address delivery concerns upfront
5. Shop by Brand        → Quick navigation by device brand
6. On Sale Products     → Create urgency with deals
7. Featured Products    → Showcase premium items
8. Category Showcase    → Visual category navigation
9. Trending Now         → Social proof through popularity
10. New Arrivals        → Fresh inventory discovery
11. Why Choose Us       → Reinforce value propositions
12. Wallet Promotion    → Encourage wallet adoption
13. Newsletter          → Capture leads with incentive
14. WhatsApp Support    → Always-visible support access
```

---

### **Component Specifications**

#### **1. TrustBanner Component**

**File**: `frontend/src/components/TrustBanner.tsx`

**Purpose**: Build immediate trust with statistics and guarantees

**Features**:
- Animated counters (50,000+ Products, 10,000+ Customers, 24/7 Support)
- Trust badges (Authentic Products, 7-Day Returns, Fast Delivery, Secure Payment)
- Glassmorphic design with gradient backgrounds
- Mobile-responsive 2-column grid

**Technical Details**:
```typescript
// Uses framer-motion for scroll-triggered animations
// Responsive: 2 columns on mobile, 4 columns on desktop
// Color scheme: Blue gradients for trust/security
```

---

#### **2. PaymentHighlight Component**

**File**: `frontend/src/components/PaymentHighlight.tsx`

**Purpose**: Promote bank transfer payment method with discount incentive

**Features**:
- ₦200 discount promotion for Bank Transfer/Wallet
- Payment method comparison table
- Animated gradient background
- Clear CTA button

**Business Logic**:
```typescript
// Discount applied automatically at checkout
// Bank Transfer: ₦200 off + 0% fees
// Card Payment: No discount + 1.5% Paystack fees
```

---

#### **3. DeliveryInfo Component**

**File**: `frontend/src/components/DeliveryInfo.tsx`

**Purpose**: Provide transparent delivery information for all Nigerian states

**Features**:
- 4-tier delivery zones with pricing
- Location examples, duration, and cost for each tier
- Free delivery banner (orders ₦5,000+)
- Glassmorphic cards with hover effects

**Delivery Tiers**:
```typescript
Tier 1: Lagos, Abuja          → 1-2 days, ₦1,200
Tier 2: PH, Ibadan, Benin     → 2-3 days, ₦1,500
Tier 3: State capitals        → 3-5 days, ₦2,000
Tier 4: Rural areas           → 5-7 days, ₦2,500
```

---

#### **4. ShopByBrand Component (DYNAMIC)**

**File**: `frontend/src/components/ShopByBrand.tsx`

**Purpose**: Dynamic brand navigation fetched from database

**Critical Implementation**:
```typescript
// Fetches Level 1 categories (brands) from API
useEffect(() => {
  const fetchBrands = async () => {
    const brandCategories = await categoryApi.getAll({ 
      level: 1, 
      featured: true, 
      active: true 
    });
    setBrands(brandCategories);
  };
  fetchBrands();
}, []);
```

**Features**:
- **Dynamic data**: No hardcoded brands
- Horizontal scrolling carousel with navigation buttons
- Brand-specific gradient colors (Apple: slate, Samsung: blue, etc.)
- Real brand logos from `/public/brands/` directory
- Links to: `/categories/{brand.slug}`

**Brand Color Mapping**:
```typescript
getBrandColor(name: string) {
  if (name.includes('apple')) return 'from-slate-400/20 to-slate-500/20';
  if (name.includes('samsung')) return 'from-blue-500/20 to-blue-600/20';
  if (name.includes('xiaomi')) return 'from-orange-500/20 to-orange-600/20';
  // ... etc
}
```

**Database Requirements**:
```typescript
// Categories must have:
{
  level: 1,              // Top-level category
  featured: true,        // Show in carousel
  active: true,          // Currently available
  icon: "📱",           // Brand emoji/icon
  slug: "apple-iphone", // URL identifier
  name: "Apple (iPhone)" // Display name
}
```

---

#### **5. WhyChooseUs Component**

**File**: `frontend/src/components/WhyChooseUs.tsx`

**Purpose**: Highlight key value propositions

**Features**:
- 4 value props: Authentic Products, Best Prices, Fast Delivery, Easy Returns
- Icon-based visual communication (lucide-react icons)
- Glassmorphic cards with hover animations
- Mobile-responsive grid (1 col mobile, 4 col desktop)

---

#### **6. WalletPromotion Component**

**File**: `frontend/src/components/WalletPromotion.tsx`

**Purpose**: Encourage wallet adoption with bonus incentives

**Features**:
- Wallet top-up bonus: ₦500 on every ₦10,000
- Zero transaction fees highlight
- Animated wallet illustration
- CTA to wallet page: `/dashboard/wallet`

**Business Rules**:
```typescript
// Bonus calculation:
// ₦10,000 top-up → ₦500 bonus (5%)
// ₦20,000 top-up → ₦1,000 bonus
// Maximum balance: ₦500,000
```

---

#### **7. Newsletter Component**

**File**: `frontend/src/components/Newsletter.tsx`

**Purpose**: Capture email leads with discount incentive

**Features**:
- Email validation (regex + real-time feedback)
- ₦500 discount coupon on signup
- Loading states and success/error handling
- API integration: `POST /api/v1/newsletter/subscribe`

**Implementation**:
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    setStatus('success');
  } catch (error) {
    setStatus('error');
  } finally {
    setIsLoading(false);
  }
};
```

**Backend Requirement**:
```typescript
// Must implement:
POST /api/v1/newsletter/subscribe
Body: { email: string }
Response: { success: boolean, couponCode?: string }
```

---

#### **8. WhatsAppSupport Component**

**File**: `frontend/src/components/WhatsAppSupport.tsx`

**Purpose**: Provide instant customer support via WhatsApp

**Features**:
- Floating button (bottom-right, fixed position)
- Pulse animation to draw attention
- Expandable info card on hover
- Direct WhatsApp link: `https://wa.me/{number}`

**Configuration**:
```typescript
// Update with actual business number:
const whatsappNumber = "+234XXXXXXXXXX";
const whatsappLink = `https://wa.me/${whatsappNumber}?text=Hi%20PlugNG%2C%20I%20need%20help%20with...`;
```

**Mobile Optimization**:
- Fixed positioning with z-index: 50
- Responsive sizing (smaller on mobile)
- Touch-friendly button size (56px × 56px)

---

### **Homepage Integration**

**File**: `frontend/src/app/(shop)/page.tsx`

**Structure**:
```typescript
export default function HomePage() {
  // Data fetching for products
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    // Fetch on-sale, featured, trending, new products
    fetchProducts();
  }, []);
  
  return (
    <main>
      <HeroBanner />
      <TrustBanner />
      <PaymentHighlight />
      <DeliveryInfo />
      <ShopByBrand />
      <OnSaleProducts products={onSaleProducts} />
      <FeaturedProducts products={featuredProducts} />
      <CategoryShowcase />
      <TrendingProducts products={trendingProducts} />
      <NewArrivals products={newArrivals} />
      <WhyChooseUs />
      <WalletPromotion />
      <Newsletter />
      <WhatsAppSupport />
    </main>
  );
}
```

---

### **Design System**

#### **Color Palette**
```css
Primary Blue: #3B82F6 (rgb(59, 130, 246))
Accent Cyan: #06B6D4
Success Green: #10B981
Warning Orange: #F59E0B
Error Red: #EF4444

Backgrounds:
- Dark: #0F172A (slate-900)
- Card: rgba(255, 255, 255, 0.05) with backdrop-blur
- Gradient: from-blue-500/20 to-cyan-500/20
```

#### **Typography**
```css
Font Family: Inter, system-ui, sans-serif
Headings: font-black, italic, uppercase, tracking-tighter
Body: text-slate-300
Labels: text-slate-400, uppercase, tracking-wider
```

#### **Glassmorphic Cards**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
}
```

---

### **Performance Optimizations**

#### **Mobile-First \u0026 3G Optimization**
```typescript
// Image optimization
- Next.js Image component with lazy loading
- WebP format with fallback
- Responsive sizes: sizes="(max-width: 768px) 100vw, 50vw"

// Code splitting
- Dynamic imports for heavy components
- Lazy load below-the-fold sections

// Animation performance
- Use transform \u0026 opacity (GPU-accelerated)
- Avoid layout thrashing
- Framer-motion with reduced motion support
```

#### **API Caching Strategy**
```typescript
// Product listings: Cache 5 minutes
// Categories/Brands: Cache 1 hour
// User cart: No cache (real-time)

// React Query configuration:
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

---

### **SEO Optimization**

#### **Metadata**
```typescript
// app/(shop)/page.tsx
export const metadata = {
  title: "PlugNG - Premium Phone Accessories | Nigeria's #1 Store",
  description: "Shop authentic phone cases, chargers, power banks \u0026 more. Fast delivery across Nigeria. Bank transfer discount available.",
  keywords: "phone accessories nigeria, iphone case lagos, samsung accessories, power bank abuja",
  openGraph: {
    title: "PlugNG - Premium Phone Accessories",
    description: "Nigeria's most trusted phone accessories store",
    images: ["/og-image.jpg"],
  },
};
```

#### **Structured Data**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "PlugNG Shop",
  "url": "https://plugng.shop",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://plugng.shop/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

---

### **Testing Checklist**

#### **Functional Testing**
- [ ] All 14 sections render correctly
- [ ] Brand carousel fetches dynamic data
- [ ] Newsletter form submits successfully
- [ ] WhatsApp button opens correct link
- [ ] All CTAs navigate to correct pages
- [ ] Payment highlight shows correct discount
- [ ] Delivery info displays all tiers

#### **Performance Testing**
- [ ] Lighthouse score \u003e 90 (mobile)
- [ ] First Contentful Paint \u003c 1.5s
- [ ] Time to Interactive \u003c 3s on 3G
- [ ] No layout shift (CLS \u003c 0.1)

#### **Responsive Testing**
- [ ] Mobile (375px - 768px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1024px+)
- [ ] All components adapt correctly

#### **Browser Testing**
- [ ] Chrome (latest)
- [ ] Safari (iOS \u0026 macOS)
- [ ] Firefox (latest)
- [ ] Edge (latest)

---

### **Future Enhancements**

1. **Progressive Image Loading**: Implement blur-up placeholders
2. **Analytics Tracking**: Track section engagement, CTA clicks
3. **A/B Testing**: Test section order, CTA copy variations
4. **Personalization**: Show relevant brands based on user device
5. **Video Content**: Add product demo videos in hero section
6. **Live Chat**: Integrate Tawk.to or Intercom
7. **Push Notifications**: Web push for order updates
8. **Dark/Light Mode**: User preference toggle

---

## 📡 **FRONTEND API INTEGRATION**

### **API Client Configuration**

**File**: `frontend/src/lib/api.ts`

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

export const categoryApi = {
  getAll: async (params?: { 
    level?: number; 
    featured?: boolean; 
    active?: boolean 
  }) => {
    const { data } = await api.get<{
      status: string;
      results: number;
      data: { categories: Category[] };
    }>('/categories', { params });
    return data.data.categories;
  },
  // ... other methods
};


# Admin
ADMIN_EMAIL=admin@plugng.shop
ADMIN_PASSWORD=InitialPassword123!
```

---

## 🚀 **DEPLOYMENT CONTEXT**

### **Render Deployment (Free Tier)**

```markdown
1. SETUP
   - Connect GitHub Repository to Render.com
   - Create Service → Web Service
   - Environment: Node
   - Build Command: npm install && npm run build
   - Start Command: npm run start
   - Port: 10000 (Render default)

2. CORE LIMITATIONS
   - Spin-down: Inactive services sleep after 15 minutes.
   - Resource Limit: 512MB RAM, 0.1 vCPU.
   - Deployment: Zero-downtime not guaranteed on Free tier.

3. OPTIMIZATION FOR FREE TIER
   - Keep-Alive: Use Uptime Robot to ping every 14 mins.
   - Memory Management: Use .lean() in Mongoose and clear Buffer/Streams quickly.
   - Sharp: Use Sharp to reduce image processing memory spike.

4. DOMAIN SETUP
   - Connect Custom Subdomain: api.plugng.shop
   - CNAME record pointing to render-url.onrender.com
   - Render handles SSL automatically.
```

---

### **Database Deployment (MongoDB Atlas)**

```markdown
1. SETUP
   - Create cluster on MongoDB Atlas (Free M0 tier)
   - Region: Choose closest to Nigeria (e.g., AWS eu-west-1 Ireland or AWS ap-south-1 Mumbai)
   - IP Whitelist: Allow access from all (0.0.0.0/0) since Render IPs change, or use a static IP service.
   - Database User: Create with readWrite permissions

2. CONNECTION STRING
   mongodb+srv://plugng_user:SecurePassword123@cluster0.xxxxx.mongodb.net/plugng_production?retryWrites=true&w=majority

3. INDEXES (Create after deployment)
   # Connect via MongoDB Compass or mongo shell
   
   users collection:
   db.users.createIndex({ email: 1 }, { unique: true })
   db.users.createIndex({ phone: 1 }, { unique: true })
   db.users.createIndex({ createdAt: -1 })
   
   products collection:
   db.products.createIndex({ slug: 1 }, { unique: true })
   db.products.createIndex({ category: 1, status: 1 })
   db.products.createIndex({ price: 1 })
   db.products.createIndex({ featured: 1, status: 1 })
   db.products.createIndex({ name: "text", description: "text" })
   
   orders collection:
   db.orders.createIndex({ orderNumber: 1 }, { unique: true })
   db.orders.createIndex({ user: 1, createdAt: -1 })
   db.orders.createIndex({ paymentStatus: 1 })
   db.orders.createIndex({ deliveryStatus: 1 })
   db.orders.createIndex({ createdAt: -1 })
   
   carts collection:
   db.carts.createIndex({ user: 1 }, { unique: true, sparse: true })
   db.carts.createIndex({ sessionId: 1 }, { sparse: true })
   db.carts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }) # TTL index

4. BACKUP STRATEGY
   - Atlas Automatic Backups: Enabled (daily snapshots, 2-day retention on free tier)
   - Manual Backup: Weekly mongodump to external storage (Google Drive, Dropbox)
   - Critical Collections: users, orders, transactions (prioritize these in manual backups)

5. MONITORING
   - Atlas Dashboard: Monitor connection count, query performance
   - Alerts: Set up for high CPU usage, slow queries (>100ms)
   - Query Profiler: Enable to identify slow queries
```

---

### **Redis Deployment (Upstash)**

```markdown
1. SETUP
   - Create database on Upstash (Free tier: 10,000 commands/day)
   - Region: Global (or choose closest edge location)
   - TLS: Enabled (secure connection)

2. CONNECTION
   REDIS_URL=rediss://default:password@region.upstash.io:6379
   
   # In code
   import Redis from 'ioredis';
   const redis = new Redis(process.env.REDIS_URL, {
     maxRetriesPerRequest: 3,
     enableReadyCheck: true,
     lazyConnect: true
   });

3. CACHE KEYS STRUCTURE
   # Product cache
   product:{productId}                    # TTL: 15 minutes
   products:page:{page}:limit:{limit}     # TTL: 5 minutes
   
   # Category cache
   categories:all                         # TTL: 1 hour
   
   # Cart
   cart:user:{userId}                     # TTL: 7 days
   cart:session:{sessionId}               # TTL: 7 days
   
   # Rate limiting
   ratelimit:{ip}:{endpoint}              # TTL: 15 minutes
   
   # JWT blacklist (logout)
   blacklist:token:{jti}                  # TTL: Match token expiry

4. CACHE INVALIDATION PATTERNS
   # Product updated
   await redis.del(`product:${productId}`);
   await redis.del('products:*'); // Delete all product listings
   
   # Category updated
   await redis.del('categories:all');
   
   # Order created (clear user's cart)
   await redis.del(`cart:user:${userId}`);

5. MONITORING
   - Upstash Dashboard: Monitor hit rate, memory usage
   - Target Hit Rate: >70% (if lower, increase TTL or cache more)
   - Memory Limit: 100MB on free tier (cleanup old keys if approaching limit)
```

---

## 🧪 **TESTING REQUIREMENTS**

### **Test Strategy**

```markdown
1. TESTING PYRAMID
   Unit Tests (70%): Individual functions, utilities
   Integration Tests (20%): API endpoints, database operations
   E2E Tests (10%): Critical flows (checkout, payment)

2. TESTING TOOLS
   Framework: Jest (with ts-jest for TypeScript)
   API Testing: Supertest (HTTP assertions)
   Mocking: jest.mock() for external services (Paystack, Termii)
   Database: mongodb-memory-server (in-memory MongoDB for tests)
   Coverage: Minimum 60% overall, 80% for critical paths (payment, order)

3. TEST STRUCTURE
   apps/api/tests/
   ├── unit/
   │   ├── utils/
   │   │   ├── formatCurrency.test.ts
   │   │   └── validation.test.ts
   │   └── services/
   │       ├── paystack.service.test.ts
   │       └── inventory.service.test.ts
   ├── integration/
   │   ├── auth.test.ts
   │   ├── products.test.ts
   │   ├── orders.test.ts
   │   └── webhooks.test.ts
   └── e2e/
       ├── checkout-flow.test.ts
       └── payment-flow.test.ts

4. CRITICAL TEST CASES (Must Have)
   
   Authentication:
   ✓ Register user with valid data → 201 Created
   ✓ Register with duplicate email → 409 Conflict
   ✓ Login with correct credentials → 200 + tokens
   ✓ Login with wrong password → 401 Unauthorized
   ✓ Access protected route without token → 401
   ✓ Access protected route with expired token → 401
   ✓ Refresh token → 200 + new access token
   
   Products:
   ✓ List products with pagination → 200 + correct page
   ✓ Get product by slug → 200 + product data
   ✓ Get non-existent product → 404
   ✓ Filter products by price range → Correct results
   ✓ Search products by name → Correct matches
   ✓ Create product as admin → 201
   ✓ Create product as customer → 403
   
   Cart:
   ✓ Add item to cart → 201 + cart updated
   ✓ Add same item twice → Quantity increased, not duplicated
   ✓ Add out-of-stock item → 409 Conflict
   ✓ Update cart item quantity → 200 + updated
   ✓ Remove item from cart → 200 + item removed
   ✓ Clear cart → 200 + empty cart
   
   Orders:
   ✓ Create order from cart → 201 + order details
   ✓ Create order with empty cart → 400 Bad Request
   ✓ Create order reserves stock → Stock decreased
   ✓ Cancel pending order → Stock restored
   ✓ Cannot cancel shipped order → 422 Unprocessable
   
   Payments:
   ✓ Initialize payment → 200 + Paystack authorization URL
   ✓ Webhook with valid signature → 200 + order marked paid
   ✓ Webhook with invalid signature → 401 Rejected
   ✓ Duplicate webhook (same reference) → 200 but not processed twice
   ✓ Verify payment fallback → 200 + correct status
   
   Inventory:
   ✓ Deduct stock after payment confirmed → Correct stock count
   ✓ Prevent overselling (concurrent orders) → Last order fails
   ✓ Low stock alert triggered → Notification sent
   ✓ Out of stock product not purchasable → 409 Conflict

5. MOCKING EXTERNAL SERVICES
   # Paystack Mock
   jest.mock('../services/paystack.service', () => ({
     initializePayment: jest.fn().mockResolvedValue({
       status: true,
       data: {
         authorization_url: 'https://paystack.test',
         access_code: 'test_access',
         reference: 'test_ref_123'
       }
     }),
     verifyPayment: jest.fn().mockResolvedValue({
       status: true,
       data: { status: 'success', reference: 'test_ref_123' }
     })
   }));

6. RUNNING TESTS
   # All tests
   $ npm test
   
   # Watch mode (development)
   $ npm test -- --watch
   
   # Coverage report
   $ npm test -- --coverage
   
   # Specific test file
   $ npm test -- auth.test.ts
   
   # Integration tests only
   $ npm test -- --testPathPattern=integration
```

---

## 📊 **MONITORING & OBSERVABILITY**

### **Logging Strategy**

```markdown
1. LOG LEVELS
   error: Exceptions, critical failures (always log in production)
   warn: Degraded performance, deprecated API usage
   info: Important business events (order created, payment received)
   debug: Detailed troubleshooting info (only in development)

2. LOG STRUCTURE (JSON Format)
   {
     "timestamp": "2026-01-27T15:30:00.123Z",
     "level": "info",
     "message": "Order created successfully",
     "context": {
       "orderId": "65b4c8f9e1234567890abcde",
       "userId": "65a1234567890abcdef12345",
       "orderNumber": "ORD-20260127-042",
       "total": 5000,
       "paymentMethod": "bank_transfer"
     },
     "requestId": "req_abc123xyz",
     "ip": "102.89.xxx.xxx"
   }

3. WHAT TO LOG
   
   Always Log:
   - User authentication (login, logout, failed attempts)
   - Order lifecycle (created, paid, shipped, delivered)
   - Payment events (initiated, success, failed, refunded)
   - Errors (with stack trace in development only)
   - Security events (invalid token, rate limit exceeded)
   
   Never Log:
   - Passwords (even hashed)
   - Full credit card numbers (PCI compliance)
   - JWT tokens (security risk)
   - API secrets (Paystack keys, etc.)

4. LOG ROTATION
   # Using winston-daily-rotate-file
   {
     filename: 'logs/plugng-%DATE%.log',
     datePattern: 'YYYY-MM-DD',
     maxSize: '20m',        # Max 20MB per file
     maxFiles: '14d',       # Keep 14 days of logs
     compress: true         # Gzip old logs
   }

5. EXTERNAL LOGGING (Production)
   Option A: Sentry (Error Tracking)
   - Captures exceptions automatically
   - Groups similar errors
   - Shows user context (browser, OS, last actions)
   - Free tier: 5,000 events/month
   
   Option B: Logtail (Centralized Logs)
   - Aggregates logs from all servers
   - Real-time search and filtering
   - Alerts on error spikes
   - Free tier: 1GB/month
   
   Option C: Self-hosted (ELK Stack - Future)
   - Elasticsearch + Logstash + Kibana
   - Full control, no data leaves your servers
   - Requires significant setup and maintenance
```

---

### **Health Checks & Uptime Monitoring**

```markdown
1. HEALTH CHECK ENDPOINT
   GET /api/v1/health
   
   Response (Healthy):
   {
     "status": "ok",
     "timestamp": "2026-01-27T15:30:00.123Z",
     "uptime": 86400,
     "services": {
       "database": "connected",
       "redis": "connected",
       "paystack": "reachable"
     },
     "memory": {
       "used": "245MB",
       "total": "512MB"
     }
   }
   
   Response (Unhealthy - 503 Status):
   {
     "status": "error",
     "timestamp": "2026-01-27T15:30:00.123Z",
     "services": {
       "database": "disconnected",
       "redis": "connected",
       "paystack": "timeout"
     }
   }

2. MONITORING TOOLS
   
   Uptime Robot (Free Tier):
   - Check /health every 5 minutes
   - Alert via email/SMS if down >2 minutes
   - Public status page: status.plugng.shop
   
   Better Stack (Formerly Better Uptime):
   - More advanced health checks
   - Incident management
   - On-call scheduling (when team grows)

3. METRICS TO TRACK
   
   Application Metrics:
   - Request rate (requests/second)
   - Response time (p50, p95, p99 percentiles)
   - Error rate (% of 5xx responses)
   - Database query time
   
   Business Metrics:
   - Orders per hour
   - Revenue per day
   - Cart abandonment rate
   - Payment success rate
   
   Infrastructure Metrics:
   - CPU usage (alert if >80%)
   - Memory usage (alert if >90%)
   - Disk space (alert if <10% free)
   - Network bandwidth

4. ALERTING RULES
   
   Critical (Immediate Action):
   - API down for >2 minutes → Call/SMS to admin
   - Database connection lost → Call/SMS
   - Payment webhook failing → Call/SMS
   - Error rate >10% → Call/SMS
   
   Warning (Check Within 1 Hour):
   - Response time >2s average
   - Memory usage >80%
   - Low stock on top 10 products
   - Cart abandonment rate >75%
   
   Info (Review Daily):
   - Slow queries (>1s)
   - New user registrations
   - Revenue vs. target
```

---

## 🔄 **BACKGROUND JOBS & CRON TASKS**

### **Job Queue (Bull + Redis)**

```markdown
1. USE CASES
   - Send email (order confirmation, shipping notification)
   - Send SMS (OTP, order updates)
   - Process refunds (Paystack API call)
   - Generate analytics reports
   - Cleanup abandoned carts (>7 days old)
   - Update product rankings (based on sales)

2. QUEUE STRUCTURE
   # Email Queue
   emailQueue.add('order-confirmation', {
     to: '[email protected]',
     orderId: '65b4c8f9e1234567890abcde',
     orderNumber: 'ORD-20260127-042'
   }, {
     attempts: 3,           # Retry up to 3 times
     backoff: {
       type: 'exponential',
       delay: 5000          # 5s, 25s, 125s
     },
     removeOnComplete: true # Clean up after success
   });
   
   # SMS Queue
   smsQueue.add('send-otp', {
     phone: '+2348012345678',
     code: '123456'
   }, {
     attempts: 2,
     priority: 1            # High priority (1 = highest)
   });

3. WORKER PROCESSES
   # Separate worker from API server (scales independently)
   
   workers/emailWorker.ts:
   import { emailQueue } from '../config/queue';
   import { sendEmail } from '../services/email.service';
   
   emailQueue.process('order-confirmation', async (job) => {
     const { to, orderId, orderNumber } = job.data;
     await sendEmail({
       to,
       subject: `Order Confirmation - ${orderNumber}`,
       template: 'order-confirmation',
       data: { orderId, orderNumber }
     });
   });
   
   # Run worker
   $ pm2 start workers/emailWorker.js --name email-worker

4. MONITORING
   # Bull Board (Web UI for queue monitoring)
   - View pending, active, completed, failed jobs
   - Retry failed jobs manually
   - View job logs and errors
   - Access: https://api.plugng.shop/admin/queues
```

---

### **Scheduled Tasks (node-cron)**

```markdown
1. DAILY TASKS
   
   # Cleanup expired carts (2am WAT daily)
   cron.schedule('0 2 * * *', async () => {
     const expiredCarts = await Cart.find({
       expiresAt: { $lt: new Date() }
     });
     await Cart.deleteMany({ _id: { $in: expiredCarts.map(c => c._id) } });
     logger.info(`Cleaned up ${expiredCarts.length} expired carts`);
   });
   
   # Send low stock alerts (9am WAT daily)
   cron.schedule('0 9 * * *', async () => {
     const lowStockProducts = await Product.find({
       stock: { $lte: '$lowStockThreshold' },
       status: 'active'
     });
     if (lowStockProducts.length > 0) {
       await sendAdminEmail({
         subject: `Low Stock Alert: ${lowStockProducts.length} products`,
         products: lowStockProducts
       });
     }
   });

2. WEEKLY TASKS
   
   # Generate weekly sales report (Monday 8am WAT)
   cron.schedule('0 8 * * 1', async () => {
     const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
     const orders = await Order.find({
       createdAt: { $gte: lastWeek },
       paymentStatus: 'paid'
     });
     const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
     await sendAdminEmail({
       subject: 'Weekly Sales Report',
       data: {
         orderCount: orders.length,
         revenue: totalRevenue,
         topProducts: /* aggregation */
       }
     });
   });

3. MONTHLY TASKS
   
   # Archive old completed orders (1st of month, 3am WAT)
   cron.schedule('0 3 1 * *', async () => {
     const threeMonthsAgo = new Date();
     threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
     
     const oldOrders = await Order.find({
       deliveryStatus: 'delivered',
       deliveredAt: { $lt: threeMonthsAgo }
     });
     
     // Move to archive collection or cold storage
     await ArchivedOrder.insertMany(oldOrders);
     logger.info(`Archived ${oldOrders.length} old orders`);
   });

4. CRITICAL CONSIDERATIONS
   - Run cron tasks on ONE server only (use Redis locking if multiple servers)
   - Handle failures gracefully (don't crash the server)
   - Log all cron executions (start time, duration, result)
   - Make tasks idempotent (safe to run multiple times)
```

---

## 🛡️ **SECURITY BEST PRACTICES**

### **Input Validation & Sanitization**

```markdown
1. VALIDATION LAYERS
   Layer 1: Schema Validation (Zod)
   - Validate request body structure
   - Type checking (string, number, email, phone)
   - Required fields
   
   Layer 2: Business Rules Validation
   - Stock availability
   - Price within acceptable range
   - User permissions
   
   Layer 3: Database Constraints
   - Unique constraints (email, phone, sku)
   - Foreign key references
   - Enum values

2. COMMON ATTACK VECTORS & PREVENTION
   
   NoSQL Injection:
   Attack: { "email": { "$gt": "" }, "password": { "$gt": "" } }
   Prevention: 
   - Use Mongoose schema validation
   - Explicitly check types: typeof email === 'string'
   - Sanitize inputs with express-mongo-sanitize
   
   XSS (Cross-Site Scripting):
   Attack: <script>alert('XSS')</script> in product description
   Prevention:
   - Sanitize HTML inputs with DOMPurify
   - Set Content-Security-Policy headers
   - Escape output in templates
   
   SQL Injection (if using SQL):
   Attack: ' OR '1'='1
   Prevention:
   - Use parameterized queries (we're using Mongoose, not raw SQL)
   
   Command Injection:
   Attack: "; rm -rf /" in user input passed to shell
   Prevention:
   - Never pass user input to child_process.exec()
   - If unavoidable, whitelist allowed characters

3. RATE LIMITING (Prevent Brute Force)
   
   # Login endpoint
   /api/v1/auth/login → 5 requests per 15 minutes per IP
   
   # Registration
   /api/v1/auth/register → 3 requests per hour per IP
   
   # OTP sending
   /api/v1/auth/send-otp → 3 requests per 15 minutes per phone number
   
   # General API
   All endpoints → 100 requests per 15 minutes per IP (guest)
   All endpoints → 500 requests per 15 minutes per user (authenticated)
```

---

### **Data Protection**

```markdown
1. SENSITIVE DATA HANDLING
   
   Passwords:
   - Hash with bcrypt (salt rounds = 10)
   - Never log or transmit in plain text
   - Enforce minimum complexity (8 chars, 1 uppercase, 1 number)
   
   JWT Tokens:
   - Access token: Memory only on frontend (XSS protection)
   - Refresh token: httpOnly cookie (XSS protection) + SameSite=Strict (CSRF protection)
   - Short expiry for access token (15 min)
   
   Payment Info:
   - NEVER store card numbers
   - Store Paystack payment reference only
   - PCI DSS compliance: Let Paystack handle card data
   
   Personal Data (GDPR/NDPR Compliance):
   - Collect only necessary data
   - Provide data export (user requests their data)
   - Provide data deletion (right to be forgotten)
   - Clear retention policy (delete inactive accounts after 2 years)

2. ENCRYPTION
   
   In Transit:
   - HTTPS/TLS for all communications (Let's Encrypt SSL)
   - Minimum TLS 1.2
   
   At Rest:
   - MongoDB Atlas encryption at rest (enabled by default)
   - Sensitive fields: Encrypt before storing (e.g., BVN if you collect it - use crypto.encrypt())
   
   Example (Encrypting BVN):
   import crypto from 'crypto';
   
   const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32 bytes
   const IV_LENGTH = 16;
   
   function encrypt(text: string): string {
     const iv = crypto.randomBytes(IV_LENGTH);
     const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
     let encrypted = cipher.update(text);
     encrypted = Buffer.concat([encrypted, cipher.final()]);
     return iv.toString('hex') + ':' + encrypted.toString('hex');
   }
   
   function decrypt(text: string): string {
     const parts = text.split(':');
     const iv = Buffer.from(parts[0], 'hex');
     const encrypted = Buffer.from(parts[1], 'hex');
     const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
     let decrypted = decipher.update(encrypted);
     decrypted = Buffer.concat([decrypted, decipher.final()]);
     return decrypted.toString();
   }
```

---

## 📦 **PACKAGE.JSON STRUCTURE**

```json
{
  "name": "plugng-backend",
  "version": "1.0.0",
  "description": "PlugNG E-Commerce Backend API",
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest --runInBand",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write \"src/**/*.ts\"",
    "migrate": "ts-node scripts/migrate.ts",
    "seed": "ts-node scripts/seed.ts"
  },
  "keywords": ["ecommerce", "api", "nodejs", "typescript", "mongodb"],
  "author": "PlugNG",
  "license": "MIT",
  "dependencies": {
    "express": "^4.19.0",
    "mongoose": "^8.1.0",
    "ioredis": "^5.3.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "dotenv": "^16.4.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "express-mongo-sanitize": "^2.2.0",
    "morgan": "^1.10.0",
    "winston": "^3.11.0",
    "winston-daily-rotate-file": "^4.7.1",
    "axios": "^1.6.5",
    "cloudinary": "^2.0.1",
    "multer": "^1.4.5-lts.1",
    "node-cron": "^3.0.3",
    "bull": "^4.12.0",
    "resend": "^3.0.0",
    "slugify": "^1.6.6"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.0",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/multer": "^1.4.11",
    "@types/node-cron": "^3.0.11",
    "@types/jest": "^29.5.11",
    "@types/supertest": "^6.0.2",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.1.1",
    "supertest": "^6.3.4",
    "mongodb-memory-server": "^9.1.6",
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.19.0",
    "@typescript-eslint/parser": "^6.19.0",
    "prettier": "^3.2.4",
    "husky": "^8.0.3",
    "lint-staged": "^15.2.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  }
}
```

---

## 📝 **TYPESCRIPT CONFIGURATION**

### **tsconfig.json**

```json
{
  "compilerOptions": {
    /* Language and Environment */
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "commonjs",
    "moduleResolution": "node",
    
    /* Emit */
    "outDir": "./dist",
    "rootDir": "./src",
    "removeComments": true,
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    
    /* Type Checking */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    
    /* Interop Constraints */
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    
    /* Completeness */
    "skipLibCheck": true,
    
    /* Path Mapping (Optional - for cleaner imports) */
    "baseUrl": "./src",
    "paths": {
      "@/models/*": ["models/*"],
      "@/controllers/*": ["controllers/*"],
      "@/services/*": ["services/*"],
      "@/middleware/*": ["middleware/*"],
      "@/utils/*": ["utils/*"],
      "@/types/*": ["types/*"],
      "@/config/*": ["config/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

---

## 🔍 **CODE QUALITY & STANDARDS**

### **ESLint Configuration (.eslintrc.json)**

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { 
      "argsIgnorePattern": "^_",
      "varsIgnorePattern": "^_" 
    }],
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "prefer-const": "error",
    "no-var": "error"
  },
  "env": {
    "node": true,
    "es2022": true,
    "jest": true
  }
}
```

---

### **Prettier Configuration (.prettierrc.json)**

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

---

### **Git Hooks (Husky + Lint-Staged)**

```json
// package.json
{
  "lint-staged": {
    "src/**/*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

```bash
# .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npm run lint-staged
npm run test
```

---

## 🗂️ **SHARED TYPES (Type Safety Across Frontend/Backend)**

### **Common Types Structure**

```markdown
packages/types/
├── product.types.ts
├── order.types.ts
├── user.types.ts
├── payment.types.ts
├── cart.types.ts
└── index.ts
```

---

### **Example: Product Types**

```typescript
// packages/types/product.types.ts

export interface IProductImage {
  url: string;
  publicId: string;
  alt: string;
  isPrimary: boolean;
}

export interface IProductSpecification {
  key: string;
  value: string;
}

export interface IProductCompatibility {
  brands: string[];
  models: string[];
}

export interface IProductOptionValue {
  value: string;
  swatchUrl?: string; // "Tiny image" for color swatches
  swatchKey?: string;
}

export interface IProductOption {
  name: string; // e.g., 'Color', 'Size'
  values: IProductOptionValue[];
}

export interface IProductVariant {
  sku: string;
  attributeValues: Record<string, string>; // e.g., { 'Color': 'Midnight Blue', 'Size': 'L' }
  costPrice: number;
  sellingPrice: number;
  compareAtPrice?: number;
  stock: number;
  image?: string; // Main image for this specific variant
}

export interface IProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category: string | ICategory; // Populated or just ID
  subCategory?: string;
  images: IProductImage[];
  options: IProductOption[];
  variants: IProductVariant[];
  specifications: IProductSpecification[];
  compatibility: IProductCompatibility;
  metaTitle?: string;
  metaDescription?: string;
  status: 'active' | 'draft' | 'out_of_stock';
  featured: boolean;
  views: number;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent?: string | ICategory;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response Types
export interface CreateProductDTO {
  name: string;
  description: string;
  category: string;
  subCategory?: string;
  options?: IProductOption[];
  variants: IProductVariant[];
  specifications?: IProductSpecification[];
  compatibility: IProductCompatibility;
  metaTitle?: string;
  metaDescription?: string;
  featured?: boolean;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  status?: 'active' | 'draft' | 'out_of_stock';
}

export interface ProductListQuery {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  model?: string;
  sort?: 'price' | '-price' | 'createdAt' | '-createdAt' | 'salesCount';
  featured?: boolean;
  status?: 'active' | 'draft' | 'out_of_stock';
}

export interface ProductListResponse {
  success: true;
  data: IProduct[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

---

### **Example: Order Types**

```typescript
// packages/types/order.types.ts

export interface IOrderItem {
  product: string; // Product ID
  name: string; // Snapshot
  sku: string;
  price: number; // Kobo (price at time of order)
  quantity: number;
  image: string;
}

export interface IShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  landmark?: string;
}

export type PaymentMethod = 'card' | 'bank_transfer' | 'wallet' | 'cash_on_delivery';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type DeliveryStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface IOrder {
  _id: string;
  orderNumber: string;
  user: string; // User ID
  items: IOrderItem[];
  subtotal: number; // Kobo
  deliveryFee: number; // Kobo
  discount: number; // Kobo
  total: number; // Kobo
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paidAt?: Date;
  shippingAddress: IShippingAddress;
  deliveryStatus: DeliveryStatus;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  customerNote?: string;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrderDTO {
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
  customerNote?: string;
}

export interface OrderListQuery {
  page?: number;
  limit?: number;
  userId?: string;
  paymentStatus?: PaymentStatus;
  deliveryStatus?: DeliveryStatus;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
  search?: string; // Search by order number
}
```

---

### **Example: User Types**

```typescript
// packages/types/user.types.ts

export interface IWalletTransaction {
  type: 'credit' | 'debit';
  amount: number; // Kobo
  description: string;
  date: Date;
}

export interface IUserAddress {
  _id?: string;
  isDefault: boolean;
  label: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  landmark?: string;
}

export type UserRole = 'customer' | 'admin';

export interface IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  wallet: {
    balance: number; // Kobo
    transactions: IWalletTransaction[];
  };
  addresses: IUserAddress[];
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Exclude password from public user type
export type PublicUser = Omit<IUser, 'password'>;

export interface RegisterDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
}

export interface LoginDTO {
  emailOrPhone: string; // Can login with email or phone
  password: string;
}

export interface AuthResponse {
  success: true;
  data: {
    user: PublicUser;
    accessToken: string;
    // refreshToken sent as httpOnly cookie
  };
  message: string;
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
}
```

---

### **Example: Payment Types**

```typescript
// packages/types/payment.types.ts

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: 'success' | 'failed' | 'abandoned';
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: {
      orderId: string;
      userId: string;
    };
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
      reusable: boolean;
      signature: string;
      account_name: string | null;
    };
  };
}

export interface PaystackWebhookEvent {
  event: 'charge.success' | 'charge.failed' | 'transfer.success' | 'transfer.failed';
  data: PaystackVerifyResponse['data'];
}

export interface InitializePaymentDTO {
  orderId: string;
  amount: number; // Kobo
  email: string;
  paymentMethod: 'card' | 'bank_transfer';
}

export interface WalletTopUpDTO {
  amount: number; // Kobo (minimum 100000 = ₦1,000)
}
```

---

### **Example: Cart Types**

```typescript
// packages/types/cart.types.ts

export interface ICartItem {
  product: string; // Product ID
  quantity: number;
  price: number; // Kobo (locked price when added)
}

export interface ICart {
  _id: string;
  user?: string; // User ID (if authenticated)
  sessionId?: string; // Session ID (if guest)
  items: ICartItem[];
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddToCartDTO {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemDTO {
  quantity: number; // New quantity
}

export interface CartResponse {
  success: true;
  data: {
    cart: ICart;
    populatedItems: {
      product: {
        _id: string;
        name: string;
        slug: string;
        images: { url: string; alt: string }[];
        sellingPrice: number;
        stock: number;
      };
      quantity: number;
      price: number;
      subtotal: number;
    }[];
    summary: {
      itemCount: number;
      subtotal: number; // Kobo
      estimatedDelivery: number; // Kobo
      estimatedTotal: number; // Kobo
    };
  };
}
```

---

## 🔐 **VALIDATION SCHEMAS (Zod)**

### **Shared Validation Rules**

```typescript
// packages/types/validations/common.ts

import { z } from 'zod';

// Nigerian phone number regex: 070, 080, 081, 090, 091, etc.
export const nigerianPhoneRegex = /^(\+234|234|0)[7-9][0-1]\d{8}$/;

// Email validation
export const emailSchema = z.string().email('Invalid email format');

// Nigerian phone validation
export const phoneSchema = z
  .string()
  .regex(nigerianPhoneRegex, 'Invalid Nigerian phone number')
  .transform((val) => {
    // Normalize to E.164 format: +2348012345678
    if (val.startsWith('0')) {
      return '+234' + val.slice(1);
    }
    if (val.startsWith('234')) {
      return '+' + val;
    }
    return val;
  });

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Price in kobo (must be positive integer)
export const priceSchema = z
  .number()
  .int('Price must be an integer (kobo)')
  .positive('Price must be positive');

// Nigerian state validation
export const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue',
  'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu',
  'FCT', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi',
  'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
] as const;

export const stateSchema = z.enum(nigerianStates);

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
```

---

### **Product Validation**

```typescript
// packages/types/validations/product.ts

import { z } from 'zod';
import { priceSchema } from './common';

export const createProductSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  category: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
  subCategory: z.string().optional(),
  costPrice: priceSchema,
  sellingPrice: priceSchema.refine(
    (val, ctx) => {
      // Ensure selling price > cost price (you can adjust this logic)
      return true; // Will validate in controller with access to costPrice
    }
  ),
  compareAtPrice: priceSchema.optional(),
  sku: z.string().min(3).max(50).toUpperCase(),
  stock: z.number().int().min(0),
  lowStockThreshold: z.number().int().min(0).default(10),
  specifications: z.array(
    z.object({
      key: z.string().min(1),
      value: z.string().min(1),
    })
  ).optional(),
  compatibility: z.object({
    brands: z.array(z.string()).min(1, 'At least one brand required'),
    models: z.array(z.string()).min(1, 'At least one model required'),
  }),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  featured: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema.partial().extend({
  status: z.enum(['active', 'draft', 'out_of_stock']).optional(),
});

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().int().positive().optional(),
  maxPrice: z.coerce.number().int().positive().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  sort: z.enum(['price', '-price', 'createdAt', '-createdAt', 'salesCount']).optional(),
  featured: z.coerce.boolean().optional(),
  status: z.enum(['active', 'draft', 'out_of_stock']).optional(),
});
```

---

### **Auth Validation**

```typescript
// packages/types/validations/auth.ts

import { z } from 'zod';
import { emailSchema, phoneSchema, passwordSchema } from './common';

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(2).max(50).regex(/^[a-zA-Z\s]+$/, 'Only letters allowed'),
  lastName: z.string().min(2).max(50).regex(/^[a-zA-Z\s]+$/, 'Only letters allowed'),
  phone: phoneSchema,
});

export const loginSchema = z.object({
  emailOrPhone: z.string().min(3),
  password: z.string().min(1, 'Password is required'),
});

export const verifyEmailSchema = z.object({
  token: z.string().length(64, 'Invalid verification token'),
});

export const sendOTPSchema = z.object({
  phone: phoneSchema,
});

export const verifyOTPSchema = z.object({
  phone: phoneSchema,
  code: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must be numeric'),
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});
```

---

### **Order Validation**

```typescript
// packages/types/validations/order.ts

import { z } from 'zod';
import { phoneSchema, stateSchema } from './common';

export const shippingAddressSchema = z.object({
  fullName: z.string().min(3).max(100),
  phone: phoneSchema,
  address: z.string().min(10).max(200),
  city: z.string().min(2).max(50),
  state: stateSchema,
  landmark: z.string().max(100).optional(),
});

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
      quantity: z.number().int().positive().max(100, 'Max 100 units per item'),
    })
  ).min(1, 'Order must have at least one item'),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(['card', 'bank_transfer', 'wallet', 'cash_on_delivery']),
  customerNote: z.string().max(500).optional(),
});

export const updateOrderStatusSchema = z.object({
  deliveryStatus: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  trackingNumber: z.string().optional(),
  adminNote: z.string().max(500).optional(),
});

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  userId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
  deliveryStatus: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  search: z.string().optional(), // Order number search
});
```

---

## 🎯 **ERROR CODES & MESSAGES**

### **Standardized Error Codes**

```typescript
// apps/api/src/utils/errorCodes.ts

export const ErrorCodes = {
  // Authentication (1000-1099)
  INVALID_CREDENTIALS: {
    code: 'AUTH_1001',
    message: 'Invalid email/phone or password',
    status: 401,
  },
  TOKEN_EXPIRED: {
    code: 'AUTH_1002',
    message: 'Token has expired. Please login again',
    status: 401,
  },
  TOKEN_INVALID: {
    code: 'AUTH_1003',
    message: 'Invalid token provided',
    status: 401,
  },
  UNAUTHORIZED: {
    code: 'AUTH_1004',
    message: 'You are not authorized to perform this action',
    status: 403,
  },
  EMAIL_EXISTS: {
    code: 'AUTH_1005',
    message: 'Email already registered',
    status: 409,
  },
  PHONE_EXISTS: {
    code: 'AUTH_1006',
    message: 'Phone number already registered',
    status: 409,
  },
  ACCOUNT_LOCKED: {
    code: 'AUTH_1007',
    message: 'Account temporarily locked due to multiple failed login attempts',
    status: 423,
  },

  // Products (2000-2099)
  PRODUCT_NOT_FOUND: {
    code: 'PROD_2001',
    message: 'Product not found',
    status: 404,
  },
  INSUFFICIENT_STOCK: {
    code: 'PROD_2002',
    message: 'Insufficient stock for this product',
    status: 409,
  },
  DUPLICATE_SKU: {
    code: 'PROD_2003',
    message: 'Product with this SKU already exists',
    status: 409,
  },
  PRODUCT_OUT_OF_STOCK: {
    code: 'PROD_2004',
    message: 'This product is currently out of stock',
    status: 409,
  },

  // Orders (3000-3099)
  ORDER_NOT_FOUND: {
    code: 'ORD_3001',
    message: 'Order not found',
    status: 404,
  },
  CANNOT_CANCEL_ORDER: {
    code: 'ORD_3002',
    message: 'Cannot cancel order that has already been shipped',
    status: 422,
  },
  EMPTY_CART: {
    code: 'ORD_3003',
    message: 'Cannot create order from empty cart',
    status: 400,
  },
  ORDER_ALREADY_PAID: {
    code: 'ORD_3004',
    message: 'This order has already been paid',
    status: 409,
  },

  // Cart (4000-4099)
  CART_NOT_FOUND: {
    code: 'CART_4001',
    message: 'Cart not found',
    status: 404,
  },
  ITEM_NOT_IN_CART: {
    code: 'CART_4002',
    message: 'Item not found in cart',
    status: 404,
  },
  INVALID_QUANTITY: {
    code: 'CART_4003',
    message: 'Quantity must be at least 1',
    status: 400,
  },

  // Payment (5000-5099)
  PAYMENT_FAILED: {
    code: 'PAY_5001',
    message: 'Payment processing failed',
    status: 422,
  },
  PAYMENT_VERIFICATION_FAILED: {
    code: 'PAY_5002',
    message: 'Could not verify payment status',
    status: 422,
  },
  INVALID_WEBHOOK_SIGNATURE: {
    code: 'PAY_5003',
    message: 'Invalid webhook signature',
    status: 401,
  },
  INSUFFICIENT_WALLET_BALANCE: {
    code: 'PAY_5004',
    message: 'Insufficient wallet balance',
    status: 422,
  },

  // Validation (6000-6099)
  VALIDATION_ERROR: {
    code: 'VAL_6001',
    message: 'Validation failed',
    status: 400,
  },
  INVALID_ID_FORMAT: {
    code: 'VAL_6002',
    message: 'Invalid ID format',
    status: 400,
  },

  // Server (9000-9099)
  INTERNAL_ERROR: {
    code: 'SRV_9001',
    message: 'An internal server error occurred',
    status: 500,
  },
  DATABASE_ERROR: {
    code: 'SRV_9002',
    message: 'Database operation failed',
    status: 500,
  },
  EXTERNAL_API_ERROR: {
    code: 'SRV_9003',
    message: 'External service unavailable',
    status: 503,
  },
} as const;

export type ErrorCode = keyof typeof ErrorCodes;
```

---

