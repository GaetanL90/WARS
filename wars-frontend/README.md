# WARS Frontend (Current Progress)

This document summarizes what has been implemented so far in the frontend reset effort, so collaborators can quickly understand the current baseline.

## Project Status

- Frontend rebuilt from a clean slate with React + TypeScript + Vite.
- Focus area so far: authentication UX and foundational app routing.
- Backend APIs are not yet available, so auth flows currently run in mock mode.

## Tech Stack

- React
- TypeScript
- React Router
- Vite

## Implemented So Far

### 1) Website + Branding

- Public landing page focused on citizen-facing messaging:
  - reporting damaged public water infrastructure
  - reporting contaminated tap water
  - community rewards for frequent valid reports
- Responsive layout for desktop/tablet/mobile.
- WARS branding integrated:
  - main logo usage in landing page
  - favicon uses `WARS_Logo_title` (`public/favicon.png`)

### 2) Login

- Login form with auth background image style.
- Mock login enabled.
- Success feedback after registration verification and password reset.
- Links to registration and forgot-password flows.

### 3) Registration (Multi-Step + OTP)

- Multi-step registration wizard:
  1. Identity + contact (`first/middle/last`, phone, email)
  2. Location (`district/sector/cell/village`)
  3. Security (password + confirm password + eye toggle)
  4. OTP verification
- Dependent location dropdowns:
  - sectors depend on selected district
  - cells depend on selected sector
  - villages depend on selected cell
- OTP resend with escalating cooldown:
  - 30s, then 60s, then 5 minutes
- Cooldown is persisted; refresh does not reset active countdown.

### 4) Forgot Password (Sequential + OTP)

- End-to-end forgot-password flow:
  1. Submit email
  2. Verify OTP
  3. Set new password + confirmation
- Sequential gating is enforced in-page (cannot jump directly to reset step by typing URL).
- OTP resend available here as well with same escalating cooldown behavior.

### 5) Routing / Access

- Public routes:
  - `/` (landing page)
  - `/login`
  - `/register`
  - `/forgot-password`
- Protected routes scaffolded:
  - `/portal`
  - `/analytics` (manager/admin restricted)
- Unauthorized fallback page exists.

## Mock Mode Notes

- Mock auth is enabled by default using:
  - `VITE_USE_MOCK_AUTH=true` (default behavior in current code)
- Seeded mock users (password: `123456`):
  - `admin@wars.local`
  - `manager@wars.local`
  - `technician@wars.local`
  - `citizen@wars.local`
- OTP values are exposed as debug text in UI for local testing until email service is integrated.

## Useful Commands

```bash
npm install
npm run dev
npm run build
```

## Key Files

- App entry and routing:
  - `src/main.tsx`
  - `src/router.tsx`
- Auth state and API layer:
  - `src/auth/AuthContext.tsx`
  - `src/auth/types.ts`
  - `src/api/authApi.ts`
- Auth pages:
  - `src/pages/LoginPage.tsx`
  - `src/pages/RegisterPage.tsx`
  - `src/pages/ForgotPasswordPage.tsx`
- Landing page and styles:
  - `src/pages/HomePage.tsx`
  - `src/styles.css`
- Contract reference:
  - `WARS API CONTRACT.md`

## Next Recommended Steps

1. Replace mock auth endpoints with real backend integration.
2. Replace OTP debug display with real email delivery and production-safe UX.
3. Add tests for auth step transitions and cooldown logic.
4. Build role-specific dashboards/modules (Citizen, Technician, Manager, Admin).

