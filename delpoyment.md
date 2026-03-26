2026-02-04T00:42:11.11315952Z ==> Downloading cache...
2026-02-04T00:42:11.157433724Z ==> Cloning from https://github.com/handyharz/plugng
2026-02-04T00:42:12.389142507Z ==> Checking out commit 3bb5f23035ef0837d3298ec370435e2fd9453915 in branch main
2026-02-04T00:42:16.235623946Z ==> Downloaded 141MB in 4s. Extraction took 0s.
2026-02-04T00:42:23.571927989Z #1 [internal] load build definition from Dockerfile
2026-02-04T00:42:23.57195923Z #1 transferring dockerfile: 739B done
2026-02-04T00:42:23.57196234Z #1 DONE 0.0s
2026-02-04T00:42:23.57196454Z 
2026-02-04T00:42:23.57196705Z #2 [internal] load metadata for docker.io/library/node:20-alpine
2026-02-04T00:42:23.791472781Z #2 ...
2026-02-04T00:42:23.791486682Z 
2026-02-04T00:42:23.791490052Z #3 [auth] library/node:pull render-prod/docker-mirror-repository/library/node:pull token for us-west1-docker.pkg.dev
2026-02-04T00:42:23.791493192Z #3 DONE 0.0s
2026-02-04T00:42:23.941770574Z 
2026-02-04T00:42:23.941795525Z #2 [internal] load metadata for docker.io/library/node:20-alpine
2026-02-04T00:42:24.070509581Z #2 DONE 0.6s
2026-02-04T00:42:24.174664562Z 
2026-02-04T00:42:24.174686822Z #4 [internal] load .dockerignore
2026-02-04T00:42:24.174690372Z #4 transferring context: 226B done
2026-02-04T00:42:24.174692843Z #4 DONE 0.0s
2026-02-04T00:42:24.174695132Z 
2026-02-04T00:42:24.174698152Z #5 importing cache manifest from local:9126711896588969819
2026-02-04T00:42:24.174701133Z #5 inferred cache manifest type: application/vnd.oci.image.manifest.v1+json done
2026-02-04T00:42:24.174704003Z #5 DONE 0.0s
2026-02-04T00:42:24.174706113Z 
2026-02-04T00:42:24.174709003Z #6 [builder 1/6] FROM docker.io/library/node:20-alpine@sha256:09e2b3d9726018aecf269bd35325f46bf75046a643a66d28360ec71132750ec8
2026-02-04T00:42:24.174711163Z #6 resolve docker.io/library/node:20-alpine@sha256:09e2b3d9726018aecf269bd35325f46bf75046a643a66d28360ec71132750ec8 0.0s done
2026-02-04T00:42:24.174713433Z #6 DONE 0.0s
2026-02-04T00:42:24.174715493Z 
2026-02-04T00:42:24.174717593Z #7 [internal] load build context
2026-02-04T00:42:24.174731693Z #7 transferring context: 495.15kB 0.0s done
2026-02-04T00:42:24.174734153Z #7 DONE 0.0s
2026-02-04T00:42:24.358878671Z 
2026-02-04T00:42:24.358897611Z #8 [stage-1 5/6] RUN pnpm install --prod --frozen-lockfile
2026-02-04T00:42:24.358900702Z #8 CACHED
2026-02-04T00:42:24.358902982Z 
2026-02-04T00:42:24.358905352Z #9 [builder 3/6] COPY . .
2026-02-04T00:42:24.358907522Z #9 CACHED
2026-02-04T00:42:24.358909492Z 
2026-02-04T00:42:24.358911642Z #10 [builder 5/6] RUN pnpm install --frozen-lockfile
2026-02-04T00:42:24.358913832Z #10 CACHED
2026-02-04T00:42:24.358915782Z 
2026-02-04T00:42:24.358918042Z #11 [stage-1 3/6] RUN npm install -g pnpm
2026-02-04T00:42:24.358920212Z #11 CACHED
2026-02-04T00:42:24.358922162Z 
2026-02-04T00:42:24.358924352Z #12 [stage-1 4/6] COPY pnpm-lock.yaml package.json ./
2026-02-04T00:42:24.358926552Z #12 CACHED
2026-02-04T00:42:24.358928512Z 
2026-02-04T00:42:24.358930603Z #13 [builder 4/6] RUN npm install -g pnpm
2026-02-04T00:42:24.358932712Z #13 CACHED
2026-02-04T00:42:24.358934683Z 
2026-02-04T00:42:24.358936723Z #14 [builder 6/6] RUN pnpm build
2026-02-04T00:42:24.358938853Z #14 CACHED
2026-02-04T00:42:24.358940793Z 
2026-02-04T00:42:24.358942833Z #15 [builder 2/6] WORKDIR /app
2026-02-04T00:42:24.358944933Z #15 CACHED
2026-02-04T00:42:24.358946853Z 
2026-02-04T00:42:24.358948873Z #16 [stage-1 6/6] COPY --from=builder /app/dist ./dist
2026-02-04T00:42:24.358951333Z #16 sha256:589002ba0eaed121a1dbf42f6648f29e5be55d5c8a6ee0f8eaa0285cc21ac153 3.86MB / 3.86MB 0.0s done
2026-02-04T00:42:24.358953693Z #16 extracting sha256:589002ba0eaed121a1dbf42f6648f29e5be55d5c8a6ee0f8eaa0285cc21ac153 0.1s done
2026-02-04T00:42:24.532895897Z #16 sha256:ad6d96c196e3198e14ea37df8bba4f54bf92fb525eb65e49fa4027c7dee13f80 33.55MB / 42.78MB 0.2s
2026-02-04T00:42:24.781972913Z #16 sha256:ad6d96c196e3198e14ea37df8bba4f54bf92fb525eb65e49fa4027c7dee13f80 42.78MB / 42.78MB 0.2s done
2026-02-04T00:42:24.782003373Z #16 extracting sha256:ad6d96c196e3198e14ea37df8bba4f54bf92fb525eb65e49fa4027c7dee13f80
2026-02-04T00:42:28.592685478Z #16 extracting sha256:ad6d96c196e3198e14ea37df8bba4f54bf92fb525eb65e49fa4027c7dee13f80 4.0s done
2026-02-04T00:42:28.803454814Z #16 sha256:eb87f4721c91769ed5206f34a9ab6ec98fc1d5235c12c2fc956665b1155e9ecb 1.26MB / 1.26MB 0.0s done
2026-02-04T00:42:28.803476995Z #16 extracting sha256:eb87f4721c91769ed5206f34a9ab6ec98fc1d5235c12c2fc956665b1155e9ecb
2026-02-04T00:42:30.763966397Z #16 extracting sha256:eb87f4721c91769ed5206f34a9ab6ec98fc1d5235c12c2fc956665b1155e9ecb 2.1s done
2026-02-04T00:42:30.959962371Z #16 sha256:e31b2016552274339ed88ed4a438d78bf37e0f6bdf328d02207b2a598c1ef86d 445B / 445B done
2026-02-04T00:42:30.959983332Z #16 extracting sha256:e31b2016552274339ed88ed4a438d78bf37e0f6bdf328d02207b2a598c1ef86d
2026-02-04T00:42:33.176484899Z #16 extracting sha256:e31b2016552274339ed88ed4a438d78bf37e0f6bdf328d02207b2a598c1ef86d 2.4s done
2026-02-04T00:42:34.205247629Z #16 sha256:5ddf2cc0ee18d36ee54043b28dfcfb8da86cb80455d71ad63594618d9b37799c 90B / 90B done
2026-02-04T00:42:34.205268309Z #16 extracting sha256:5ddf2cc0ee18d36ee54043b28dfcfb8da86cb80455d71ad63594618d9b37799c
2026-02-04T00:42:35.477296454Z #16 extracting sha256:5ddf2cc0ee18d36ee54043b28dfcfb8da86cb80455d71ad63594618d9b37799c 1.4s done
2026-02-04T00:42:35.585285615Z #16 sha256:f6568009cf216e77e497defc216d1261f40ee33c40d0970c943a5336ffcd5000 9.28MB / 9.28MB 0.1s done
2026-02-04T00:42:35.739308544Z #16 extracting sha256:f6568009cf216e77e497defc216d1261f40ee33c40d0970c943a5336ffcd5000
2026-02-04T00:42:36.003285414Z #16 extracting sha256:f6568009cf216e77e497defc216d1261f40ee33c40d0970c943a5336ffcd5000 0.4s done
2026-02-04T00:42:36.212663484Z #16 sha256:7c077838619cdeac67c5437f769bd3bedeb06aca687a861410fcfd00bf197deb 85.74kB / 85.74kB done
2026-02-04T00:42:36.212686454Z #16 extracting sha256:7c077838619cdeac67c5437f769bd3bedeb06aca687a861410fcfd00bf197deb 0.0s done
2026-02-04T00:42:36.217607812Z #16 sha256:9912e194c38b09521d7157a1d4d7eb6c10c5a2f7c6eec927de0f53e2b7e7810b 30.30MB / 30.30MB 0.2s
2026-02-04T00:42:36.406061441Z #16 sha256:9912e194c38b09521d7157a1d4d7eb6c10c5a2f7c6eec927de0f53e2b7e7810b 30.30MB / 30.30MB 0.2s done
2026-02-04T00:42:36.406081141Z #16 extracting sha256:9912e194c38b09521d7157a1d4d7eb6c10c5a2f7c6eec927de0f53e2b7e7810b
2026-02-04T00:42:41.167808779Z #16 extracting sha256:9912e194c38b09521d7157a1d4d7eb6c10c5a2f7c6eec927de0f53e2b7e7810b 4.9s done
2026-02-04T00:42:41.279956136Z #16 sha256:28f4787f5797f359623fe52bb8bb4df0c7c77de8be16a74214e1e0bfb9ab32c9 84.03kB / 84.03kB done
2026-02-04T00:42:41.279977267Z #16 extracting sha256:28f4787f5797f359623fe52bb8bb4df0c7c77de8be16a74214e1e0bfb9ab32c9 0.1s done
2026-02-04T00:42:41.279981607Z #16 CACHED
2026-02-04T00:42:41.447063834Z 
2026-02-04T00:42:41.447093295Z #17 exporting to docker image format
2026-02-04T00:42:41.447099335Z #17 exporting layers done
2026-02-04T00:42:41.447104555Z #17 exporting manifest sha256:96441ea7f0fb736652db3f0c7542df622ea176cee769715dcccbbbd87afaca13 done
2026-02-04T00:42:41.447111945Z #17 exporting config sha256:e6915daca030d3efc39907ae580f4327de413cb0a323d0b9d6bfa7139f206f96 done
2026-02-04T00:42:41.747401704Z #17 DONE 0.5s
2026-02-04T00:42:41.953502518Z 
2026-02-04T00:42:41.953515489Z #18 exporting cache to client directory
2026-02-04T00:42:41.953519099Z #18 preparing build cache for export
2026-02-04T00:42:41.953522689Z #18 sha256:8c84f53ef8513357d052e7f6225410265c13359fbc724ebdbad26fff44b12777 133.84kB / 133.84kB done
2026-02-04T00:42:41.953526049Z #18 extracting sha256:8c84f53ef8513357d052e7f6225410265c13359fbc724ebdbad26fff44b12777
2026-02-04T00:42:41.984856199Z #18 extracting sha256:8c84f53ef8513357d052e7f6225410265c13359fbc724ebdbad26fff44b12777 0.2s done
2026-02-04T00:42:42.202349418Z #18 sha256:2dc7d85b8bf99bf0ae6996258806a3f326b9c344e59f1cc47afbf57321d9c6e6 9.28MB / 9.28MB 0.1s done
2026-02-04T00:42:42.202370228Z #18 extracting sha256:2dc7d85b8bf99bf0ae6996258806a3f326b9c344e59f1cc47afbf57321d9c6e6
2026-02-04T00:42:42.527017426Z #18 extracting sha256:2dc7d85b8bf99bf0ae6996258806a3f326b9c344e59f1cc47afbf57321d9c6e6 0.5s done
2026-02-04T00:42:42.689074054Z #18 sha256:46af8d019961e802d77d490f0f338cf0fb2a0ce62c087885927bdc7527bb26ab 40.89MB / 49.71MB 0.2s
2026-02-04T00:42:42.815085029Z #18 sha256:46af8d019961e802d77d490f0f338cf0fb2a0ce62c087885927bdc7527bb26ab 49.71MB / 49.71MB 0.3s done
2026-02-04T00:42:42.968908213Z #18 extracting sha256:46af8d019961e802d77d490f0f338cf0fb2a0ce62c087885927bdc7527bb26ab
2026-02-04T00:42:54.548258179Z #18 extracting sha256:46af8d019961e802d77d490f0f338cf0fb2a0ce62c087885927bdc7527bb26ab 11.7s done
2026-02-04T00:42:54.728072555Z #18 sha256:3a5921e0ee89484c151072049817c63295c937532741aa8fc1751c8cf977a312 84.03kB / 84.03kB done
2026-02-04T00:42:54.728092626Z #18 extracting sha256:3a5921e0ee89484c151072049817c63295c937532741aa8fc1751c8cf977a312 0.1s done
2026-02-04T00:42:54.789861791Z #18 writing cache image manifest sha256:580d2481c029dfb4abc31705fe7e21bf8e319682011f545c8e5c6e133a566703 done
2026-02-04T00:42:54.789887552Z #18 DONE 13.0s
2026-02-04T00:42:55.457726837Z Pushing image to registry...
2026-02-04T00:42:56.051621511Z Upload succeeded
2026-02-04T00:43:00.264636167Z ==> Deploying...
2026-02-04T00:43:00.324129767Z ==> Setting WEB_CONCURRENCY=1 by default, based on available CPUs in the instance
2026-02-04T00:43:16.44769934Z ✅ Connected to MongoDB
2026-02-04T00:43:16.450233985Z 🚀 Server is running on port 8085
2026-02-04T00:43:16.450249866Z 📡 Health check: http://localhost:8085/health
2026-02-04T00:43:17.295211849Z HEAD / 200 16.820 ms - 21
2026-02-04T00:43:21.154501925Z ==> Your service is live 🎉
2026-02-04T00:43:21.252630323Z GET / 200 1.096 ms - 21
2026-02-04T00:43:21.262859071Z ==> 
2026-02-04T00:43:21.26569501Z ==> ///////////////////////////////////////////////////////////
2026-02-04T00:43:21.268595233Z ==> 
2026-02-04T00:43:21.271016037Z ==> Available at your primary URL https://plugng.onrender.com
2026-02-04T00:43:21.273724148Z ==> 
2026-02-04T00:43:21.275987122Z ==> ///////////////////////////////////////////////////////////



01:41:50.856 Running build in Washington, D.C., USA (East) – iad1
01:41:50.857 Build machine configuration: 2 cores, 8 GB
01:41:50.878 Cloning github.com/handyharz/plugng (Branch: main, Commit: 3bb5f23)
01:41:50.880 Skipping build cache, deployment was triggered without cache.
01:41:51.753 Cloning completed: 874.000ms
01:41:52.615 Running "vercel build"
01:41:54.222 Vercel CLI 50.9.6
01:41:54.565 Detected `pnpm-lock.yaml` 9 which may be generated by pnpm@9.x or pnpm@10.x
01:41:54.566 Using pnpm@10.x based on project creation date
01:41:54.566 To use pnpm@9.x, manually opt in using corepack (https://vercel.com/docs/deployments/configure-a-build#corepack)
01:41:54.571 Running "install" command: `pnpm install`...
01:41:55.486 Lockfile is up to date, resolution step is skipped
01:41:55.559 Progress: resolved 1, reused 0, downloaded 0, added 0
01:41:55.601 Packages: +419
01:41:55.601 ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
01:41:56.561 Progress: resolved 419, reused 0, downloaded 14, added 0
01:41:57.561 Progress: resolved 419, reused 0, downloaded 38, added 10
01:41:58.563 Progress: resolved 419, reused 0, downloaded 47, added 14
01:41:59.564 Progress: resolved 419, reused 0, downloaded 54, added 14
01:42:00.570 Progress: resolved 419, reused 0, downloaded 89, added 34
01:42:01.572 Progress: resolved 419, reused 0, downloaded 102, added 38
01:42:02.572 Progress: resolved 419, reused 0, downloaded 107, added 38
01:42:03.573 Progress: resolved 419, reused 0, downloaded 108, added 38
01:42:04.573 Progress: resolved 419, reused 0, downloaded 132, added 47
01:42:05.578 Progress: resolved 419, reused 0, downloaded 167, added 58
01:42:06.578 Progress: resolved 419, reused 0, downloaded 286, added 107
01:42:07.579 Progress: resolved 419, reused 0, downloaded 309, added 118
01:42:08.578 Progress: resolved 419, reused 0, downloaded 404, added 155
01:42:09.580 Progress: resolved 419, reused 0, downloaded 419, added 371
01:42:10.001 Progress: resolved 419, reused 0, downloaded 419, added 419, done
01:42:10.239 
01:42:10.239 dependencies:
01:42:10.239 + @tanstack/react-query 5.90.20
01:42:10.239 + @types/react-datepicker 7.0.0
01:42:10.239 + axios 1.13.3
01:42:10.239 + clsx 2.1.1
01:42:10.239 + date-fns 4.1.0
01:42:10.240 + framer-motion 12.29.2
01:42:10.240 + lucide-react 0.562.0
01:42:10.240 + next 16.1.1
01:42:10.240 + react 19.2.3
01:42:10.240 + react-datepicker 9.1.0
01:42:10.240 + react-dom 19.2.3
01:42:10.240 + react-icons 5.5.0
01:42:10.240 + recharts 3.7.0
01:42:10.240 + tailwind-merge 3.4.0
01:42:10.240 
01:42:10.240 devDependencies:
01:42:10.240 + @tailwindcss/postcss 4.1.18
01:42:10.244 + @types/node 20.19.30
01:42:10.244 + @types/react 19.2.9
01:42:10.244 + @types/react-dom 19.2.3
01:42:10.244 + eslint 9.39.2
01:42:10.244 + eslint-config-next 16.1.1
01:42:10.244 + tailwindcss 4.1.18
01:42:10.244 + typescript 5.9.3
01:42:10.244 
01:42:10.268 Done in 15.3s using pnpm v10.28.0
01:42:10.302 Detected Next.js version: 16.1.1
01:42:10.303 Running "pnpm build"
01:42:10.584 
01:42:10.586 > sample-ecom@0.1.0 build /vercel/path0/frontend
01:42:10.586 > next build
01:42:10.586 
01:42:11.483 Attention: Next.js now collects completely anonymous telemetry regarding usage.
01:42:11.483 This information is used to shape Next.js' roadmap and prioritize features.
01:42:11.484 You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
01:42:11.484 https://nextjs.org/telemetry
01:42:11.484 
01:42:11.496 ▲ Next.js 16.1.1 (Turbopack)
01:42:11.496 
01:42:11.533   Creating an optimized production build ...
01:42:38.611 ✓ Compiled successfully in 26.6s
01:42:38.617   Running TypeScript ...
01:42:48.330   Collecting page data using 1 worker ...
01:42:48.867   Generating static pages using 1 worker (0/34) ...
01:42:49.188   Generating static pages using 1 worker (8/34) 
01:42:49.368   Generating static pages using 1 worker (16/34) 
01:42:49.516   Generating static pages using 1 worker (25/34) 
01:42:49.592 ✓ Generating static pages using 1 worker (34/34) in 725.0ms
01:42:49.599   Finalizing page optimization ...
01:42:49.914 
01:42:49.918 Route (app)
01:42:49.918 ┌ ○ /
01:42:49.918 ├ ○ /_not-found
01:42:49.918 ├ ○ /admin/login
01:42:49.918 ├ ƒ /api/admin/orders
01:42:49.918 ├ ƒ /api/checkout
01:42:49.918 ├ ƒ /api/verify
01:42:49.919 ├ ○ /categories
01:42:49.919 ├ ƒ /categories/[slug]
01:42:49.919 ├ ○ /checkout
01:42:49.919 ├ ○ /checkout/success
01:42:49.919 ├ ○ /dashboard
01:42:49.919 ├ ○ /dashboard/activity
01:42:49.919 ├ ○ /dashboard/admins
01:42:49.919 ├ ○ /dashboard/analytics
01:42:49.919 ├ ○ /dashboard/categories
01:42:49.919 ├ ○ /dashboard/customers
01:42:49.920 ├ ƒ /dashboard/customers/[id]
01:42:49.920 ├ ○ /dashboard/inventory
01:42:49.920 ├ ○ /dashboard/moderation
01:42:49.920 ├ ○ /dashboard/orders
01:42:49.920 ├ ƒ /dashboard/orders/[id]
01:42:49.920 ├ ○ /dashboard/products
01:42:49.920 ├ ƒ /dashboard/products/[id]/edit
01:42:49.924 ├ ○ /dashboard/products/new
01:42:49.924 ├ ○ /dashboard/promotions
01:42:49.924 ├ ○ /dashboard/settings
01:42:49.925 ├ ○ /dashboard/support
01:42:49.925 ├ ƒ /dashboard/support/[id]
01:42:49.925 ├ ○ /dashboard/wallet
01:42:49.925 ├ ○ /login
01:42:49.925 ├ ○ /orders
01:42:49.925 ├ ƒ /orders/[id]
01:42:49.925 ├ ƒ /products/[id]
01:42:49.925 ├ ○ /profile
01:42:49.925 ├ ƒ /profile/support/[id]
01:42:49.925 ├ ○ /register
01:42:49.925 ├ ○ /shop
01:42:49.925 ├ ○ /track
01:42:49.926 ├ ƒ /track/[orderNumber]
01:42:49.926 ├ ○ /verify-otp
01:42:49.926 └ ○ /wallet
01:42:49.926 
01:42:49.926 
01:42:49.926 ○  (Static)   prerendered as static content
01:42:49.927 ƒ  (Dynamic)  server-rendered on demand
01:42:49.927 
01:42:50.468 Traced Next.js server files in: 35.275ms
01:42:50.746 Created all serverless functions in: 278.023ms
01:42:50.782 Collected static files (public/, static/, .next/static): 14.219ms
01:42:51.198 Build Completed in /vercel/output [57s]
01:42:51.579 Deploying outputs...
01:42:58.757 Deployment completed
01:42:59.650 Creating build cache...