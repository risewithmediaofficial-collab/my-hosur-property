# MyHosurProperty - Full-Stack Real Estate Platform

A production-style full-stack real estate application inspired by MagicBricks, with role-based workflows for buyers/tenants, owners, agents, and admins.

## Tech Stack

### Frontend (Vite + React + Tailwind)
- React 19 + React Router
- Tailwind CSS (minimalist responsive UI)
- Axios for API calls
- React Hot Toast for notifications
- Reusable UI components and protected routes

### Backend (Node.js + Express + MongoDB)
- Express REST APIs
- MongoDB with Mongoose models
- JWT auth + role-based authorization
- Validation via `express-validator`
- Security middleware (`helmet`, `cors`)
- Caching (`node-cache`) for property search
- Simulated mail notification for leads

## Folder Structure

```txt
frontend (root)
  src/
    components/
      Navbar, Footer, PropertyCard, FilterSidebar,
      ImageGallery, ContactModal, PlanCard, ProtectedRoute
    pages/
      HomePage, ListingPage, PropertyDetailPage, AuthPage,
      UserDashboardPage, AgentDashboardPage, AdminDashboardPage,
      PostPropertyPage, DashboardRouterPage, NotFoundPage
    hooks/
      useAuth, useDebounce
    services/api/
      client, authApi, propertyApi, leadApi, planApi,
      paymentApi, userApi, adminApi
    context/
      AuthContext
    utils/
      format

backend/
  src/
    config/
      db, cache, mail
    controllers/
      auth, property, lead, plan, payment, user, admin
    middleware/
      auth, role, validate, errorHandler, notFound
    models/
      User, Property, Lead, Plan, Payment
    routes/
      auth, properties, leads, plans, payments, users, admin
    seed/
      seedPlans
    app.js
    server.js
```

## Database Schema (Core Collections)

### Users
- `name`, `email`, `phone`, `password`
- `role`: `buyer | seller | agent | admin`
- `savedProperties[]`
- `activePlan { planId, expiresAt, listingLimit, listingsUsed, isBoosted }`

### Properties
- `title`, `description`, `price`, `propertyType`, `bhk`, `listingType`
- `location { city, area, address, lat, lng }`
- `amenities[]`, `images[]`
- `ownerId`, `ownerType`
- `status`: `pending | approved | rejected`
- `featuredUntil`

### Leads
- `userId`, `propertyId`, `ownerId`
- `contactInfo { name, email, phone, message }`
- timestamps

### Plans
- `name`, `price`, `listingLimit`, `durationDays`, `featuredBoost`, `isActive`

### Payments
- `userId`, `planId`, `amount`, `transactionId`
- `status`: `created | paid | failed`
- `gateway`

## API Structure

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/otp/request`
- `POST /api/auth/otp/verify`
- `GET /api/auth/me`

### Properties
- `GET /api/properties` (filters: city, area, price range, type, bhk, amenities, search)
- `GET /api/properties/featured`
- `GET /api/properties/:id` (with similar recommendations)
- `GET /api/properties/mine`
- `POST /api/properties`
- `PUT /api/properties/:id`
- `DELETE /api/properties/:id`

### Leads
- `POST /api/leads`
- `GET /api/leads/mine`

### Plans/Payments
- `GET /api/plans`
- `POST /api/payments/create-intent`
- `POST /api/payments/verify`
- `GET /api/payments/mine`

### Users/Admin
- `GET /api/users/saved`
- `POST /api/users/saved/toggle`
- `GET /api/admin/metrics`
- `GET /api/admin/users`
- `GET /api/admin/payments`
- `PATCH /api/admin/properties/:id/status`

## End-to-End Workflow

### Buyer/Tenant
1. Search from homepage (location, budget, property type).
2. Backend returns filtered + paginated listings.
3. User opens detail page with gallery, amenities, map, similar properties.
4. User clicks contact.
5. If authenticated, lead is stored and owner/agent is notified (mail simulation/log).
6. User can save properties into wishlist.

### Owner/Agent
1. Login/signup with seller/agent role.
2. Open post-property flow.
3. Select plan and complete payment (simulated verification endpoint).
4. Active plan gets assigned to user.
5. Submit property via form.
6. Listing enters moderation (`pending`) and appears after admin approval.
7. Agent dashboard shows listings and incoming leads.

### Admin
1. Login as admin.
2. Review dashboard metrics (users, properties, pending listings, leads, paid payments).
3. Approve/reject pending property listings.
4. Manage users/agents and inspect payment records.

## Key Features Implemented
- Role-based route access and API authorization
- Featured listing support (model + API sorting flow)
- Saved properties (wishlist)
- Similar recommendations on detail page
- Debounced search and lazy loading behavior
- SEO-friendly readable property URL (`/property/:id/:slug`)
- Google Maps embed integration (location-based)
- Reusable component architecture
- Security baseline: JWT, validation, helmet, CORS, error middleware
- Performance baseline: response cache for listing queries, pagination, lazy image loading

## Setup

### 1) Frontend env
Create `.env` from root `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2) Backend env
Create `backend/.env` from `backend/.env.example` and set real values.

### 3) Install
```bash
npm install
npm --prefix backend install
```

### 4) Seed plans
```bash
npm --prefix backend run seed
```

### 5) Run both frontend and backend
```bash
npm run dev:full
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

## Notes for Production Hardening
- Replace simulated OTP/payment with real providers (Twilio/Razorpay/Stripe).
- Configure SMTP for live lead alerts.
- Add Redis for distributed caching.
- Add rate limiting, CSRF strategy, audit logs.
- Move image uploads to object storage (S3/Cloudinary).
- Add test suites (unit + integration + e2e).
