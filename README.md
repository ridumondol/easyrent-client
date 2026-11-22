# Rentora Client

Rentora is a responsive equipment-rental marketplace connecting customers with local equipment owners.

- **Live URL:** Not deployed yet.
- **Client:** Next.js App Router, React, TypeScript, Tailwind CSS, HeroUI, Framer Motion
- **API:** Express server in `../rentora-server`

## Features

- Public home, equipment search/filtering/sorting/pagination, equipment details, About, Contact, and How It Works pages.
- Email/password and Google sign-in, persistent JWT session, forgot/reset password flows, authenticated password changes, and role-based customer, owner, and admin dashboards.
- Equipment favorites and booking requests; payment continues to Stripe Checkout.
- Customer booking and payment history, owner inventory and rental tools, admin management dashboards.
- Local light/dark theme preference, responsive navigation, loading skeletons, a custom error page, and 404 page.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Marketplace home and featured equipment |
| `/equipment` | Searchable, filterable equipment catalog |
| `/equipment/[id]` | Equipment details, favorites, and booking |
| `/about`, `/contact`, `/how-it-works` | Public information and contact form |
| `/login`, `/register` | Account access |
| `/forgot-password`, `/reset-password` | Request and complete a password reset |
| `/payment/success` | Stripe Checkout return |
| `/customer/*` | Customer dashboard |
| `/owner/*` | Owner dashboard |
| `/admin/*` | Admin dashboard |

Change passwords from the Profile page in the customer, owner, or admin dashboard.

## Local setup

Run each command in **Terminal: client**, with the working folder `rentora-client`.

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Configure `.env.local` before starting:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

> **Important**: Next.js inlines `NEXT_PUBLIC_*` variables at build time and on dev server initialization. The Next.js development server (`npm run dev`) must be restarted whenever any `NEXT_PUBLIC_*` variable is added, removed, or modified in `.env.local`.

The client also lists the requested Better Auth, MongoDB, and imgbb placeholders in `.env.example`; server-side authentication and equipment image URLs are provided through the Rentora Express API.

## Production Configuration & Deployment

### Environment Configuration

When deploying the frontend (e.g., on Vercel) and the backend API (e.g., on Render, Railway, or Heroku):

1. **Client Deployment (Vercel)**:
   - In your Vercel Project Settings > **Environment Variables**, set:
     ```env
     NEXT_PUBLIC_API_URL=https://your-rentora-api.onrender.com/api
     NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_oauth_client_id
     ```
   - **Crucial**: Whenever `NEXT_PUBLIC_*` environment variables are added or changed in Vercel, you **must trigger a new deployment** (redeploy without cache). Because Next.js statically inlines `NEXT_PUBLIC_*` variables into the JavaScript bundle during compilation, changing environment variables on Vercel without redeploying will not update the live client bundle.

2. **Server Deployment (Render / Railway / Heroku)**:
   - Set the following backend environment variables:
     ```env
     PORT=5000
     CLIENT_URL=https://your-rentora-client.vercel.app
     CORS_ORIGIN=https://your-rentora-client.vercel.app
     MONGODB_URI=your_production_mongodb_connection_string
     MONGODB_DB_NAME=rentora
     JWT_SECRET=your_production_jwt_secret
     SMTP_HOST=your_smtp_host
     SMTP_PORT=587
     SMTP_USER=your_smtp_username
     SMTP_PASS=your_provider_issued_smtp_password
     EMAIL_FROM=Rentora <noreply@your-domain.example>
     ```
   - Use the actual HTTPS API origin for `NEXT_PUBLIC_API_URL` (including `/api`),
     and configure SMTP values from your mail provider. `EMAIL_FROM` must be a
     sender authorized by that provider. Keep these SMTP credentials in the
     backend environment, never in `NEXT_PUBLIC_*` variables.

### Verifying the Production Connection

To verify that the client and server communicate properly in production:
1. Open the backend health endpoint directly in the browser: `https://your-rentora-api.onrender.com/api/health`. It must return `{"success": true, "message": "Server is healthy", ...}` with HTTP status `200 OK`.
2. Open the frontend URL: `https://your-rentora-client.vercel.app`. Verify the Featured Equipment and Customer Reviews load live data without error banners or fallback indicators.
3. Open Browser DevTools > Console and Network tabs to verify requests to `/api/equipment` and `/api/reviews` return status `200` with the correct CORS headers (`Access-Control-Allow-Origin`).

### Troubleshooting Common Connection Errors

1. **CORS Misconfiguration (`Access to fetch at ... from origin ... has been blocked by CORS policy`)**:
   - *Cause*: The server's `CLIENT_URL` / `CORS_ORIGIN` environment variable does not match the exact frontend URL (including protocol and no trailing slash, e.g., `https://rentora.vercel.app`).
   - *Resolution*: Ensure the backend environment specifies the exact client domain in `CLIENT_URL` / `CORS_ORIGIN`. In development, use `http://localhost:3000`.

2. **Mixed Content (`Blocked loading mixed active content ...`)**:
   - *Cause*: A production frontend hosted on HTTPS attempts to fetch from an HTTP backend URL (e.g., `http://api.rentora.com/api`). Browsers block unencrypted HTTP requests from secure HTTPS pages.
   - *Resolution*: Always use `https://` for `NEXT_PUBLIC_API_URL` in production. Ensure the backend server has a valid SSL certificate.

3. **Missing or Incomplete Environment Variables (`NEXT_PUBLIC_API_URL is not configured`)**:
   - *Cause*: In development, `.env.local` is missing or the dev server was not restarted after editing `.env.local`. In production, `NEXT_PUBLIC_API_URL` was not added to the deployment platform's environment settings or was added without redeploying.
   - *Resolution*: Add `NEXT_PUBLIC_API_URL=https://.../api` to environment settings, then trigger a clean build/redeploy.

## Packages

`next`, `react`, `react-dom`, `typescript`, `tailwindcss`, `@heroui/react`, `framer-motion`, `lucide-react`, and `react-hot-toast`.

## Validation

## UI/UX Design Decisions

- Uses a centralized light/dark token system with a warm primary accent, semantic status colors, 16px minimum body text, consistent 8px-based spacing, and a Noto Sans Bengali-compatible font stack.
- Public, dashboard, and authentication screens share the same radius, border, shadow, focus, loading, empty, error, and status patterns.
- Navigation includes a skip link, active-page markers, keyboard-safe mobile menus, role-specific dashboard navigation, and breadcrumbs.
- Equipment discovery keeps filters and pagination in the URL, supports removable filter chips, mobile bottom-sheet filters, explicit empty states, and consistent 4:3 catalog imagery.
- Booking prioritizes rental terms and owner information, uses clear date and quantity controls, live pricing and availability feedback, and a keyboard-managed modal.
- Status information combines text with icons, while responsive layouts preserve large touch targets and readable stacked content on small screens.

Run in **Terminal: client**, working folder `rentora-client`:

```powershell
npm run lint
npm run build
```


## Features
- User Authentication
- Equipment Marketplace
- Customer Dashboard
- Owner Dashboard
- Admin Dashboard
- Equipment Booking
- Payment Management

## Getting Started

Run npm install to install dependencies.
Run npm run dev to start the development server.

## Project Information

Rentora is an equipment rental marketplace built with Next.js and React.

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS

## Installation

1. Clone the repository.
2. Run npm install.
3. Run npm run dev.

## Usage

Users can browse equipment, book rental items, and manage their rental activities.

## License

This project is developed for educational purposes.
