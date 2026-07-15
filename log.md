backend log

❯ clear
❯ npm start

> plugng-backend@1.0.0 start
> node dist/server.js

✅ Connected to MongoDB
🚀 Server is running on port 8085
📡 Health check: http://localhost:8085/health
GET /api/v1/auth/me 401 4.544 ms - 81
GET /api/v1/categories?level=1&featured=true 200 413.603 ms - -
GET /api/v1/search/trending 200 405.648 ms - -
GET /api/v1/categories?level=1&active=true 200 401.378 ms - -
📦 Product Search Query: 431ms
GET /api/v1/products?sort=newest&limit=12 200 436.419 ms - -
📦 Product Search Query: 33ms
📦 Product Search Query: 39ms
📦 Product Search Query: 46ms
GET /api/v1/products?trending=true&limit=8 200 35.182 ms - -
GET /api/v1/products?featured=true&limit=8 200 43.317 ms - -
GET /api/v1/products?onSale=true&limit=8 200 49.497 ms - -
🔑 Auth Login Query: 19.537ms
❌ Login failed: User not found [harzjunior1993@gmail.com]
POST /api/v1/auth/login 401 43.311 ms - 57
🔑 Auth Login Query: 6.35ms
📡 Login Attempt: harzkane@gmail.com | Match: false
POST /api/v1/auth/login 401 99.333 ms - 57
🔑 Auth Login Query: 2.389ms
📡 Login Attempt: harzkane@gmail.com | Match: false
POST /api/v1/auth/login 401 85.381 ms - 57
🔑 Auth Login Query: 2.251ms
📡 Login Attempt: harzkane@gmail.com | Match: false
POST /api/v1/auth/login 401 84.559 ms - 57
🔑 Auth Login Query: 2.49ms
📡 Login Attempt: harzkane@gmail.com | Match: true
POST /api/v1/auth/login 200 91.770 ms - -
GET /api/v1/cart 200 28.105 ms - 39
GET /api/v1/notifications/unread-count 200 21.027 ms - 35
GET /api/v1/notifications?page=1&limit=10 200 31.141 ms - 75
GET /api/v1/wishlist 200 37.949 ms - 207
GET /api/v1/search/trending 304 7.704 ms - -
GET /api/v1/categories?level=1&active=true 304 9.931 ms - -
📦 Product Search Query: 14ms
GET /api/v1/products?sort=newest&limit=12 304 18.238 ms - -
📦 Product Search Query: 16ms
GET /api/v1/products?onSale=true&limit=8 304 18.129 ms - -
📦 Product Search Query: 26ms
GET /api/v1/products?featured=true&limit=8 304 27.882 ms - -
📦 Product Search Query: 21ms
GET /api/v1/products?trending=true&limit=8 304 22.887 ms - -
POST /api/v1/cart/add 200 57.265 ms - -
AfriExchange payment request error: {
  success: false,
  message: 'Invalid or expired authentication credential'
}
POST /api/v1/orders 500 2342.391 ms - 73



frontent log:

❯ clear
❯ npm run dev

> sample-ecom@0.1.0 dev
> next dev -p 3005

▲ Next.js 16.1.1 (Turbopack)
- Local:         http://localhost:3005
- Network:       http://172.20.10.2:3005
- Environments: .env

✓ Starting...
✓ Ready in 4.7s
 GET / 200 in 2.2s (compile: 1719ms, render: 439ms)
 GET /login 200 in 282ms (compile: 244ms, render: 37ms)
 GET / 200 in 35ms (compile: 8ms, render: 27ms)
 GET /products/redmi-buds.png 200 in 1526ms (compile: 1020ms, render: 506ms)
 GET /products/earbuds.png 200 in 1535ms (compile: 1026ms, render: 508ms)
 GET /products/samsung-charger.png 200 in 1524ms (compile: 1014ms, render: 510ms)
 GET /products/travel-bundle.png 200 in 1557ms (compile: 1046ms, render: 512ms)
 GET /products/bluetooth-speaker.png 200 in 718ms (compile: 204ms, render: 514ms)
 GET /products/magsafe-charger.png 200 in 1529ms (compile: 1008ms, render: 521ms)
 GET /checkout 200 in 159ms (compile: 129ms, render: 31ms)
 GET /logo.png 404 in 226ms (compile: 119ms, render: 107ms)
 GET /logo.png 404 in 70ms (compile: 7ms, render: 63ms)
 GET /logo.png 404 in 65ms (compile: 15ms, render: 49ms)

