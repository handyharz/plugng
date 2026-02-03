[Log] 🚀 API Request: – "POST" – "/orders" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/orders" – 201 (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/orders/verify?reference=WALLET-1769821933286" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/orders/verify?reference=WALLET-1769821933286" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Log] [Fast Refresh] rebuilding (7e643_next_dist_5e34f729._.js, line 2298)
[Log] [Fast Refresh] done in 359ms (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/orders/my-orders" (7e643_next_dist_5e34f729._.js, line 2298, x2)
[Log] ✅ API Response: – "/orders/my-orders" – 200 (7e643_next_dist_5e34f729._.js, line 2298, x2)
[Log] 🚀 API Request: – "GET" – "/orders/697d56edeadbba0ef2abd05a" (7e643_next_dist_5e34f729._.js, line 2298, x2)
[Log] ✅ API Response: – "/orders/697d56edeadbba0ef2abd05a" – 200 (7e643_next_dist_5e34f729._.js, line 2298, x2)


❯ clear
❯ pnpm run dev

> plugng-backend@1.0.0 dev /Users/harz/Documents/backUps/plugng-shop/backend
> ts-node-dev --respawn --transpile-only src/server.ts

[INFO] 02:04:43 ts-node-dev ver. 2.0.0 (using ts-node ver. 10.9.2, typescript ver. 5.9.3)
✅ Connected to MongoDB
🚀 Server is running on port 8085
📡 Health check: http://localhost:8085/health
GET /api/v1/admin/notifications 304 41.218 ms - -
GET /api/v1/auth/me 304 14.949 ms - -
GET /api/v1/admin/orders?page=1&limit=20 304 77.649 ms - -
GET /api/v1/categories?level=1&featured=true 200 11.578 ms - -
GET /api/v1/auth/me 200 8.175 ms - -
GET /api/v1/orders/697d5469eae0490f58465161 200 27.151 ms - -
GET /api/v1/cart 200 31.850 ms - 39
GET /api/v1/wishlist 200 36.937 ms - 554
GET /api/v1/notifications/unread-count 200 23.747 ms - 35
GET /api/v1/notifications?page=1&limit=10 200 38.044 ms - -
📦 Product Search Query: 12ms
GET /api/v1/products?sort=newest&limit=12 200 32.843 ms - -
📦 Product Search Query: 15ms
📦 Product Search Query: 15ms
GET /api/v1/products?onSale=true&limit=8 200 27.976 ms - -
📦 Product Search Query: 21ms
GET /api/v1/products?trending=true&limit=8 200 17.442 ms - -
GET /api/v1/products?featured=true&limit=8 200 22.148 ms - -
GET /api/v1/products/697cc7ca47cdcd8480a4be05 200 10.900 ms - -
📦 Product Search Query: 11ms
GET /api/v1/products?category=apple-cases-covers-silicone-cases&limit=5 200 22.980 ms - -
POST /api/v1/cart/add 200 43.148 ms - -
GET /api/v1/coupons/validate/WELCOM20?amount=35000 200 15.870 ms - 117
POST /api/v1/orders 201 1073.285 ms - -
GET /api/v1/categories?level=1&featured=true 304 7.148 ms - -
GET /api/v1/auth/me 304 10.677 ms - -
🔍 [Verify] Started for reference: ORD-1769821534872-412
🔍 [Verify] DB Lookup: Found | Status: pending
⚠️  [Verify] Dev Mode auto-confirm for ORD-1769821534872-412
GET /api/v1/wishlist 304 27.907 ms - -
GET /api/v1/cart 304 31.652 ms - -
GET /api/v1/orders/verify?reference=ORD-1769821534872-412 200 69.421 ms - -
GET /api/v1/notifications/unread-count 200 21.853 ms - 35
GET /api/v1/notifications?page=1&limit=10 200 33.324 ms - -
📦 Product Search Query: 21ms
📦 Product Search Query: 21ms
GET /api/v1/products?sort=newest&limit=12 200 22.810 ms - -
GET /api/v1/products?sort=newest&limit=12 200 22.415 ms - -
📦 Product Search Query: 57ms
📦 Product Search Query: 60ms
📦 Product Search Query: 54ms
GET /api/v1/products?onSale=true&limit=8 200 58.234 ms - -
📦 Product Search Query: 55ms
GET /api/v1/products?trending=true&limit=8 200 61.706 ms - -
📦 Product Search Query: 72ms
GET /api/v1/products?featured=true&limit=8 304 72.747 ms - -
GET /api/v1/products?onSale=true&limit=8 200 55.663 ms - -
GET /api/v1/products?featured=true&limit=8 200 55.487 ms - -
📦 Product Search Query: 30ms
GET /api/v1/products?trending=true&limit=8 200 31.710 ms - -
GET /api/v1/orders/my-orders?page=1&limit=10 200 17.070 ms - -
GET /api/v1/orders/697d555e27c8382211fb68ae 200 8.663 ms - -
GET /api/v1/admin/notifications 304 15.670 ms - -
GET /api/v1/auth/me 304 8.724 ms - -
GET /api/v1/admin/orders?page=1&limit=20 200 24.073 ms - -
GET /api/v1/orders/my-orders?page=1&limit=10 304 14.845 ms - -
GET /api/v1/orders/697d555e27c8382211fb68ae 304 18.970 ms - -
GET /api/v1/orders/697d555e27c8382211fb68ae 200 15.778 ms - -
GET /api/v1/admin/notifications 304 5.755 ms - -
PATCH /api/v1/admin/orders/bulk-status 200 13.884 ms - 85
GET /api/v1/admin/orders?page=1&limit=20 200 14.543 ms - -
GET /api/v1/categories?level=1&featured=true 304 6.104 ms - -
GET /api/v1/auth/me 200 5.199 ms - -
GET /api/v1/orders/697d555e27c8382211fb68ae 200 11.636 ms - -
GET /api/v1/cart 304 12.652 ms - -
GET /api/v1/wishlist 304 26.710 ms - -
GET /api/v1/notifications/unread-count 200 15.513 ms - 35
GET /api/v1/notifications?page=1&limit=10 200 25.473 ms - -
PATCH /api/v1/admin/orders/bulk-status 200 22.531 ms - 85
GET /api/v1/admin/orders?page=1&limit=20 200 10.910 ms - -
GET /api/v1/auth/me 304 12.215 ms - -
GET /api/v1/auth/me 304 12.585 ms - -
GET /api/v1/admin/orders?page=1&limit=20 304 22.833 ms - -
GET /api/v1/admin/notifications 304 29.960 ms - -
GET /api/v1/categories?level=1&featured=true 304 7.805 ms - -
GET /api/v1/orders/697d555e27c8382211fb68ae 200 12.461 ms - -
GET /api/v1/auth/me 200 6.220 ms - -
GET /api/v1/cart 304 18.510 ms - -
GET /api/v1/notifications?page=1&limit=10 304 27.023 ms - -
GET /api/v1/wishlist 304 35.568 ms - -
GET /api/v1/notifications/unread-count 304 17.718 ms - -
GET /api/v1/notifications/unread-count 304 11.740 ms - -
[INFO] 02:11:14 Restarting: /Users/harz/Documents/backUps/plugng-shop/backend/src/controllers/admin.controller.ts has been modified
✅ Connected to MongoDB
🚀 Server is running on port 8085
📡 Health check: http://localhost:8085/health
📦 Product Search Query: 151ms
📦 Product Search Query: 180ms
GET /api/v1/products?sort=newest&limit=12 304 190.575 ms - -
GET /api/v1/products?sort=newest&limit=12 200 164.000 ms - -
📦 Product Search Query: 33ms
GET /api/v1/products?onSale=true&limit=8 304 35.858 ms - -
📦 Product Search Query: 55ms
GET /api/v1/products?featured=true&limit=8 304 56.567 ms - -
📦 Product Search Query: 63ms
GET /api/v1/products?trending=true&limit=8 304 64.670 ms - -
📦 Product Search Query: 78ms
GET /api/v1/products?onSale=true&limit=8 200 80.281 ms - -
📦 Product Search Query: 152ms
GET /api/v1/products?featured=true&limit=8 200 153.033 ms - -
📦 Product Search Query: 133ms
GET /api/v1/products?trending=true&limit=8 200 139.504 ms - -
GET /api/v1/products/697cc7ca47cdcd8480a4be05 200 13.149 ms - -
📦 Product Search Query: 25ms
GET /api/v1/products?category=apple-cases-covers-silicone-cases&limit=5 200 36.068 ms - -
POST /api/v1/cart/add 200 61.473 ms - -
GET /api/v1/coupons/validate/WELCOM20?amount=35000 304 7.840 ms - -
POST /api/v1/orders 201 81.690 ms - -
🔍 [Verify] Started for reference: WALLET-1769821933286
🔍 [Verify] DB Lookup: Found | Status: paid
GET /api/v1/orders/verify?reference=WALLET-1769821933286 200 18.616 ms - -
GET /api/v1/orders/my-orders?page=1&limit=5 200 20.427 ms - -
GET /api/v1/admin/notifications 304 23.474 ms - -
GET /api/v1/auth/me 304 34.398 ms - -
GET /api/v1/auth/me 304 33.205 ms - -
GET /api/v1/admin/orders?page=1&limit=20 200 65.420 ms - -
GET /api/v1/orders/697d56edeadbba0ef2abd05a 200 9.432 ms - -
GET /api/v1/admin/notifications 304 10.346 ms - -
PATCH /api/v1/admin/orders/bulk-status 200 11.547 ms - 85
GET /api/v1/admin/orders?page=1&limit=20 200 13.393 ms - -
GET /api/v1/notifications/unread-count 200 13.306 ms - 35


[Log] [HMR] connected (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/categories" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/orders/697d56edeadbba0ef2abd05a" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/auth/me" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/categories" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/auth/me" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/orders/697d56edeadbba0ef2abd05a" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/cart" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/wishlist" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/notifications" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/notifications/unread-count" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/cart" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Debug] 🛒 Fetch Cart: 48.857ms (src_f6b1be7b._.js, line 106)
[Log] ✅ API Response: – "/wishlist" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/notifications/unread-count" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/notifications" – 200 (7e643_next_dist_5e34f729._.js, line 2298)



[Log] 🚀 API Request: – "GET" – "/admin/notifications" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/admin/notifications" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "PATCH" – "/admin/orders/bulk-status" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/admin/orders/bulk-status" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/admin/orders?page=1&limit=20" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/admin/orders?page=1&limit=20" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "PATCH" – "/admin/orders/bulk-status" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/admin/orders/bulk-status" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/admin/orders?page=1&limit=20" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/admin/orders?page=1&limit=20" – 200 (7e643_next_dist_5e34f729._.js, line 2298)


[Log] [HMR] connected (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/categories" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/orders/697d56edeadbba0ef2abd05a" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/auth/me" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/categories" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/auth/me" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/orders/697d56edeadbba0ef2abd05a" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/cart" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/wishlist" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/notifications" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] 🚀 API Request: – "GET" – "/notifications/unread-count" (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/cart" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Debug] 🛒 Fetch Cart: 28.885ms (src_f6b1be7b._.js, line 106)
[Log] ✅ API Response: – "/notifications" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/wishlist" – 200 (7e643_next_dist_5e34f729._.js, line 2298)
[Log] ✅ API Response: – "/notifications/unread-count" – 200 (7e643_next_dist_5e34f729._.js, line 2298)


❯ clear
❯ pnpm run dev

> plugng-backend@1.0.0 dev /Users/harz/Documents/backUps/plugng-shop/backend
> ts-node-dev --respawn --transpile-only src/server.ts

[INFO] 02:04:43 ts-node-dev ver. 2.0.0 (using ts-node ver. 10.9.2, typescript ver. 5.9.3)
✅ Connected to MongoDB
🚀 Server is running on port 8085
📡 Health check: http://localhost:8085/health
GET /api/v1/admin/notifications 304 41.218 ms - -
GET /api/v1/auth/me 304 14.949 ms - -
GET /api/v1/admin/orders?page=1&limit=20 304 77.649 ms - -
GET /api/v1/categories?level=1&featured=true 200 11.578 ms - -
GET /api/v1/auth/me 200 8.175 ms - -
GET /api/v1/orders/697d5469eae0490f58465161 200 27.151 ms - -
GET /api/v1/cart 200 31.850 ms - 39
GET /api/v1/wishlist 200 36.937 ms - 554
GET /api/v1/notifications/unread-count 200 23.747 ms - 35
GET /api/v1/notifications?page=1&limit=10 200 38.044 ms - -
📦 Product Search Query: 12ms
GET /api/v1/products?sort=newest&limit=12 200 32.843 ms - -
📦 Product Search Query: 15ms
📦 Product Search Query: 15ms
GET /api/v1/products?onSale=true&limit=8 200 27.976 ms - -
📦 Product Search Query: 21ms
GET /api/v1/products?trending=true&limit=8 200 17.442 ms - -
GET /api/v1/products?featured=true&limit=8 200 22.148 ms - -
GET /api/v1/products/697cc7ca47cdcd8480a4be05 200 10.900 ms - -
📦 Product Search Query: 11ms
GET /api/v1/products?category=apple-cases-covers-silicone-cases&limit=5 200 22.980 ms - -
POST /api/v1/cart/add 200 43.148 ms - -
GET /api/v1/coupons/validate/WELCOM20?amount=35000 200 15.870 ms - 117
POST /api/v1/orders 201 1073.285 ms - -
GET /api/v1/categories?level=1&featured=true 304 7.148 ms - -
GET /api/v1/auth/me 304 10.677 ms - -
🔍 [Verify] Started for reference: ORD-1769821534872-412
🔍 [Verify] DB Lookup: Found | Status: pending
⚠️  [Verify] Dev Mode auto-confirm for ORD-1769821534872-412
GET /api/v1/wishlist 304 27.907 ms - -
GET /api/v1/cart 304 31.652 ms - -
GET /api/v1/orders/verify?reference=ORD-1769821534872-412 200 69.421 ms - -
GET /api/v1/notifications/unread-count 200 21.853 ms - 35
GET /api/v1/notifications?page=1&limit=10 200 33.324 ms - -
📦 Product Search Query: 21ms
📦 Product Search Query: 21ms
GET /api/v1/products?sort=newest&limit=12 200 22.810 ms - -
GET /api/v1/products?sort=newest&limit=12 200 22.415 ms - -
📦 Product Search Query: 57ms
📦 Product Search Query: 60ms
📦 Product Search Query: 54ms
GET /api/v1/products?onSale=true&limit=8 200 58.234 ms - -
📦 Product Search Query: 55ms
GET /api/v1/products?trending=true&limit=8 200 61.706 ms - -
📦 Product Search Query: 72ms
GET /api/v1/products?featured=true&limit=8 304 72.747 ms - -
GET /api/v1/products?onSale=true&limit=8 200 55.663 ms - -
GET /api/v1/products?featured=true&limit=8 200 55.487 ms - -
📦 Product Search Query: 30ms
GET /api/v1/products?trending=true&limit=8 200 31.710 ms - -
GET /api/v1/orders/my-orders?page=1&limit=10 200 17.070 ms - -
GET /api/v1/orders/697d555e27c8382211fb68ae 200 8.663 ms - -
GET /api/v1/admin/notifications 304 15.670 ms - -
GET /api/v1/auth/me 304 8.724 ms - -
GET /api/v1/admin/orders?page=1&limit=20 200 24.073 ms - -
GET /api/v1/orders/my-orders?page=1&limit=10 304 14.845 ms - -
GET /api/v1/orders/697d555e27c8382211fb68ae 304 18.970 ms - -
GET /api/v1/orders/697d555e27c8382211fb68ae 200 15.778 ms - -
GET /api/v1/admin/notifications 304 5.755 ms - -
PATCH /api/v1/admin/orders/bulk-status 200 13.884 ms - 85
GET /api/v1/admin/orders?page=1&limit=20 200 14.543 ms - -
GET /api/v1/categories?level=1&featured=true 304 6.104 ms - -
GET /api/v1/auth/me 200 5.199 ms - -
GET /api/v1/orders/697d555e27c8382211fb68ae 200 11.636 ms - -
GET /api/v1/cart 304 12.652 ms - -
GET /api/v1/wishlist 304 26.710 ms - -
GET /api/v1/notifications/unread-count 200 15.513 ms - 35
GET /api/v1/notifications?page=1&limit=10 200 25.473 ms - -
PATCH /api/v1/admin/orders/bulk-status 200 22.531 ms - 85
GET /api/v1/admin/orders?page=1&limit=20 200 10.910 ms - -
GET /api/v1/auth/me 304 12.215 ms - -
GET /api/v1/auth/me 304 12.585 ms - -
GET /api/v1/admin/orders?page=1&limit=20 304 22.833 ms - -
GET /api/v1/admin/notifications 304 29.960 ms - -
GET /api/v1/categories?level=1&featured=true 304 7.805 ms - -
GET /api/v1/orders/697d555e27c8382211fb68ae 200 12.461 ms - -
GET /api/v1/auth/me 200 6.220 ms - -
GET /api/v1/cart 304 18.510 ms - -
GET /api/v1/notifications?page=1&limit=10 304 27.023 ms - -
GET /api/v1/wishlist 304 35.568 ms - -
GET /api/v1/notifications/unread-count 304 17.718 ms - -
GET /api/v1/notifications/unread-count 304 11.740 ms - -
[INFO] 02:11:14 Restarting: /Users/harz/Documents/backUps/plugng-shop/backend/src/controllers/admin.controller.ts has been modified
✅ Connected to MongoDB
🚀 Server is running on port 8085
📡 Health check: http://localhost:8085/health
📦 Product Search Query: 151ms
📦 Product Search Query: 180ms
GET /api/v1/products?sort=newest&limit=12 304 190.575 ms - -
GET /api/v1/products?sort=newest&limit=12 200 164.000 ms - -
📦 Product Search Query: 33ms
GET /api/v1/products?onSale=true&limit=8 304 35.858 ms - -
📦 Product Search Query: 55ms
GET /api/v1/products?featured=true&limit=8 304 56.567 ms - -
📦 Product Search Query: 63ms
GET /api/v1/products?trending=true&limit=8 304 64.670 ms - -
📦 Product Search Query: 78ms
GET /api/v1/products?onSale=true&limit=8 200 80.281 ms - -
📦 Product Search Query: 152ms
GET /api/v1/products?featured=true&limit=8 200 153.033 ms - -
📦 Product Search Query: 133ms
GET /api/v1/products?trending=true&limit=8 200 139.504 ms - -
GET /api/v1/products/697cc7ca47cdcd8480a4be05 200 13.149 ms - -
📦 Product Search Query: 25ms
GET /api/v1/products?category=apple-cases-covers-silicone-cases&limit=5 200 36.068 ms - -
POST /api/v1/cart/add 200 61.473 ms - -
GET /api/v1/coupons/validate/WELCOM20?amount=35000 304 7.840 ms - -
POST /api/v1/orders 201 81.690 ms - -
🔍 [Verify] Started for reference: WALLET-1769821933286
🔍 [Verify] DB Lookup: Found | Status: paid
GET /api/v1/orders/verify?reference=WALLET-1769821933286 200 18.616 ms - -
GET /api/v1/orders/my-orders?page=1&limit=5 200 20.427 ms - -
GET /api/v1/admin/notifications 304 23.474 ms - -
GET /api/v1/auth/me 304 34.398 ms - -
GET /api/v1/auth/me 304 33.205 ms - -
GET /api/v1/admin/orders?page=1&limit=20 200 65.420 ms - -
GET /api/v1/orders/697d56edeadbba0ef2abd05a 200 9.432 ms - -
GET /api/v1/admin/notifications 304 10.346 ms - -
PATCH /api/v1/admin/orders/bulk-status 200 11.547 ms - 85
GET /api/v1/admin/orders?page=1&limit=20 200 13.393 ms - -
GET /api/v1/notifications/unread-count 200 13.306 ms - 35
GET /api/v1/categories?level=1&featured=true 304 6.661 ms - -
GET /api/v1/auth/me 200 9.848 ms - -
GET /api/v1/orders/697d56edeadbba0ef2abd05a 200 16.160 ms - -
GET /api/v1/cart 304 35.488 ms - -
GET /api/v1/wishlist 304 32.974 ms - -
GET /api/v1/notifications/unread-count 200 30.055 ms - 35
GET /api/v1/notifications?page=1&limit=10 200 46.465 ms - -
PATCH /api/v1/admin/orders/bulk-status 200 27.451 ms - 85
GET /api/v1/admin/orders?page=1&limit=20 200 14.674 ms - -
GET /api/v1/categories?level=1&featured=true 304 9.061 ms - -
GET /api/v1/auth/me 200 10.225 ms - -
GET /api/v1/orders/697d56edeadbba0ef2abd05a 200 19.933 ms - -
GET /api/v1/cart 304 18.033 ms - -
GET /api/v1/notifications?page=1&limit=10 200 24.843 ms - -
GET /api/v1/wishlist 304 33.268 ms - -
GET /api/v1/notifications/unread-count 304 16.741 ms - -
