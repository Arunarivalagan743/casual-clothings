# CasualClothings

CasualClothings is a full-stack commerce platform that delivers a polished shopping experience for apparel brands. The project combines a React storefront with an Express API, MongoDB persistence, Razorpay payments, and an operations-ready administration suite.

## Feature Coverage

### Storefront and Shopping
- Product catalogue with category navigation, bundle merchandising, and size configuration (`server/controllers/product.controller.js`, `bundle.controller.js`, `sizeConfig.controller.js`)
- Dynamic search, sorting, and filter support for large inventories
- Customer shopping cart, wishlist management, and persistent session storage (`cart.controller.js`, `wishlist.controller.js`)
- Landing page hero animations, marquee banners, and lookbook storytelling powered by GSAP, Embla Carousel, and Framer Motion (`DarkCart-app/src/components`)
- Responsive layout with Tailwind CSS 4 and accessible modals, drawers, and step flows (`@headlessui/react`)

### Checkout, Payments, and Orders
- Razorpay integration covering order creation, capture, verification, refunds, and webhook handling (`server/controllers/payment.controller.js`, `refund.controller.js`, `verify-live-mode.js`)
- Support for prepaid, UPI, wallet, and COD order flows (`order.controller.js`, `cancellation.controller.js`)
- Automated invoice and receipt generation via PDFKit, with transactional email delivery through Nodemailer and Resend (`email.controller.js`, `invoice` utilities)
- Multi-address shipping book, Pincode validation, and Indian state/district auto-complete (`address.controller.js`, `indianLocation.controller.js`, `data/indianStatesDistricts.json`)

### Post-Purchase Experience
- Self-service return, replacement, and refund workflows with audit trails (`returnProduct.controller.js`, `userRefundManagement.controller.js`)
- Cancellation window logic and Razorpay cancellation reconciliation (`test-cancellation-fix.js`, `cancellation.controller.js`)
- Real-time order tracking, status notifications, and SLA management across the order lifecycle (`orderCancellation.controller.js`, `getUserRefunds.js`)

### Customer Engagement
- Bulk order, custom t-shirt, and contact enquiry pipelines routed to Ops with email confirmations (`bulkOrder.controller.js`, `customTshirtRequest.controller.js`, `contact.controller.js`)
- Marketing-ready assets, announcement bars, and countdown interactions (React Confetti, React CountUp)
- Firebase integration for push-ready customer engagement (Firebase v11 SDK)

### Administration and Operations
- Role-based dashboard for merchandisers, support agents, and super-admins (`middleware/auth.js`, `middleware/Admin.js`, `middleware/apiKeyMiddleware.js`)
- Product, inventory, and bundle management, including media uploads through Cloudinary (`uploadImage.controller.js`)
- Revenue, refund, and customer analytics dashboards using Recharts and Chart.js (`DarkCart-app/src/pages`, `@tanstack/react-table`)
- Secure API key gating for partner integrations and rate-limited public endpoints (`middleware/rateLimitMiddleware.js`, `middleware/enhancedSecurity.js`)

### Security and Compliance
- JWT-based auth with refresh token rotation and session invalidation (`user.controllers.js`)
- Input sanitisation, validation, CSRF protection, and hardened HTTP headers via Helmet and custom middleware (`middleware/inputSanitizationFixed.js`, `middleware/csrfMiddleware.js`)
- PCI DSS aligned payment flow, secrets management guidance, and operational runbooks (`server/docs/RAZORPAY_REFUND_GUIDE.md`, `RAZORPAY_TRANSACTION_STATUS_GUIDE.js`)

## Technology Stack

- Frontend: React 18, Vite 6, Redux Toolkit, Tailwind CSS 4, Headless UI, GSAP, Framer Motion, Embla Carousel, TanStack Table, Chart.js
- Backend: Node.js 18+, Express 4, Mongoose 8, Razorpay SDK, Joi validation, JWT, Multer, Cloudinary SDK, Nodemailer, Resend
- Infrastructure & Tooling: MongoDB, PDFKit, dotenv, rate limiting, ESLint, PostCSS, Vercel configuration for SSR-friendly deployment, Vite asset pipeline

## Repository Layout

```
casual-clothings/
├── README.md                 # Project overview (this document)
├── casual-clothings/
│   └── DarkCart-app/         # React storefront (Vite)
└── server/                   # Express API service layer
```

Key documentation lives under `server/docs/` (payment setup, refund playbooks) and `server/ENV_SETUP.md` for environment configuration.

## Getting Started

### Prerequisites
- Node.js 18 or newer
- MongoDB 6.x (local or hosted)
- Razorpay test keys and webhook signing secret
- Cloudinary account for media storage (optional but recommended)

### Clone and Install

```bash
git clone https://github.com/Ranjith-casual/casual-clothings.git
cd casual-clothings

# Backend dependencies
cd server
npm install

# Frontend dependencies
cd ../casual-clothings/DarkCart-app
npm install
```

### Environment Configuration

Create `server/.env` using `server/ENV_SETUP.md` as reference. Required variables include:

```
MONGODB_URI=
PORT=
JWT_SECRET_KEY=
JWT_REFRESH_SECRET_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=
EMAIL_PASS=
FRONTEND_URL=
PRODUCTION_URL=
```

Optional per-feature settings (Resend API key, admin API keys, queue providers) are documented in `server/ENV_SETUP.md` and module-specific README files inside `server/docs/`.

### Run the Platform Locally

```bash
# Backend (from server/)
npm run dev

# Frontend (from casual-clothings/DarkCart-app/)
npm run dev
```

Default URLs:
- Storefront: http://localhost:5173
- API: http://localhost:8080

## Developer Tooling

- Frontend scripts: `npm run dev`, `npm run build`, `npm run preview`, `npm run lint`
- Backend scripts: `npm run dev` (nodemon), `npm start`
- Testing aids: address, refund, and payment scenario scripts in `server/` beginning with `test-*.js`
- Code quality: ESLint 9 with React hooks rules, Tailwind intelligent tooling

## API Surface Overview

| Domain | Highlights |
| --- | --- |
| Authentication & Users | Registration, login, refresh, profile updates, role administration (`user.controllers.js`, `userManagement.controller.js`) |
| Catalogue | Product CRUD, category hierarchy, bundle assembly, size grids (`product.controller.js`, `category.controller.js`, `bundle.controller.js`) |
| Cart & Wishlist | Add/update/remove cart items, wishlist storage, cart analytics |
| Orders | COD and prepaid order creation, order list filtering, status transitions, cancellation flows |
| Payments | Razorpay order creation, webhook verification, refund orchestration, reconciliation utilities |
| Fulfilment | Address book, return merchandise authorisations, refund payouts, shipment updates |
| Communications | Automated transactional email, contact form intake, bulk order funnel, custom design requests |

Detailed endpoint references are available in the controller files and associated route definitions under `server/route/`.

## Security Posture

- Rate limiting, API key guards, CSRF shields, and sanitisation middleware
- Strong password hashing via bcrypt and strict validation with Joi/express-validator
- CORS enforcement with dynamic origin safelists for multi-environment deployment
- Extensive Razorpay guides covering live-mode cutover, refund exceptions, and transaction status reconciliation (`server/docs/RAZORPAY_LIVE_MODE_SETUP.md`, `RAZORPAY_REFUND_GUIDE.md`)

## Deployment Notes

- Frontend is Vercel-ready (`vercel.json`) and can be promoted using `npm run build` with static hosting or serverless adapters
- Backend specifies `vercel.json` for serverless deployment; also compatible with traditional Node hosts (Railway, Render, DigitalOcean) using `npm start`
- Payment webhooks require HTTPS public endpoints; use ngrok or Cloudflare Tunnel during development
- Production MongoDB should enable TLS and IP safelists; see `server/config/connectdb.js` for connection configuration

## Documentation and Operations

- `server/docs/` contains live-mode checklists, API key rotation procedures, and refund troubleshooting guides
- `server/setup-payment-settings.js` and the collection of `test-*.js` utilities provide scripted validation for address import, refund calculations, and payment status edge cases

## Contribution Guidelines

1. Fork the repository and create a feature branch
2. Run linting before committing (`npm run lint` in the frontend)
3. Align changes with the documented API contracts and update docs when behaviour changes
4. Submit a pull request with testing evidence and deployment considerations

## License

No SPDX license file is published in this repository. Review package manifests or contact the maintainers for licensing details prior to redistribution.

## Support

- Open a GitHub issue for bugs or feature requests
- Refer to `server/docs/` for payment and operations FAQs
- Coordinate production credentials using the runbooks in `ENV_SETUP.md` and `KEYS_BACKUP.md`
