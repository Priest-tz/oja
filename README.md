# ỌJÀ — E-Commerce Storefront

A fully functional, customer-facing e-commerce storefront built with Next.js 15, featuring dynamic product discovery, persistent cart management, and live payment processing via the Paystack gateway.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack & Justification](#tech-stack--justification)
- [Features](#features)
- [Payment Flow](#payment-flow)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Deployment](#deployment)

---

## Project Overview

ỌJÀ is a production-grade e-commerce storefront that allows users to browse a live product catalog, manage a persistent shopping cart, and complete purchases securely through Paystack. The project demonstrates real-world frontend engineering practices including server-side API orchestration, client-side state persistence, form validation, and third-party payment SDK integration.

---

## Tech Stack & Justification

| Layer                | Choice                         | Reason                                                                                                                                                                        |
| -------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**        | Next.js 15 (App Router)        | Provides file-based routing, server components, and API route handlers in a single project — ideal for keeping the Paystack secret key server-side without a separate backend |
| **State Management** | Zustand + `persist` middleware | Lightweight, boilerplate-free, and natively supports `localStorage` persistence. Far less overhead than Redux for a cart store of this scope                                  |
| **Validation**       | Zod                            | Schema-first validation with TypeScript inference. Pairs cleanly with React's uncontrolled inputs and produces structured per-field error messages                            |
| **Styling**          | Tailwind CSS                   | Utility-first approach enables fast, consistent UI iteration without context-switching between stylesheets                                                                    |
| **Payment**          | Paystack V2 Inline JS          | Nigerian-first payment gateway with excellent naira (₦) support, a reliable inline modal, and a secure server-side initialization pattern                                     |
| **Language**         | TypeScript                     | Full type safety across components, store, and API boundaries reduces runtime errors and improves maintainability                                                             |

### Why Next.js over React SPA?

The Paystack integration requires a server-side step to initialize a transaction — this prevents exposing the secret key in client-side code. Next.js App Router API routes handle this elegantly without needing a separate Express or Node backend, making the architecture simpler to deploy and reason about.

---

## Features

### Product Discovery

- Fetches live products from `https://api.oluwasetemi.dev/products`
- Paginated grid (12 products per page) with a "Load More" control
- Client-side category filtering via a slide-out filter sidebar
- Search by product name via URL query parameters (`?search=...`)
- Skeleton loading states during all fetch operations
- Out-of-stock items visually disabled with an "Out of Stock" badge
- User-facing error state with a retry option if the API fetch fails

### Shopping Cart

- Add to cart from the product grid with instant visual feedback ("Added to Bag ✓")
- Duplicate detection — re-adding an existing item increments its quantity
- Adjust quantity or remove items from the cart page
- Real-time price calculations: subtotal, 7.5% VAT, and total
- Cart data persists across browser sessions via `localStorage` (Zustand `persist`)
- Empty cart state with a "Continue Shopping" redirect

### Checkout & Payment

- Multi-step validated form: contact info + delivery address
- All 37 Nigerian states available in the state dropdown
- Zod schema validation with inline per-field error messages
- Secure payment via Paystack (see [Payment Flow](#payment-flow) below)
- Order confirmation page with a printable receipt and unique transaction reference

---

## Payment Flow

This section documents the complete lifecycle of a payment transaction in this application.

```
User fills checkout form
        ↓
Client-side Zod validation runs
        ↓  (if valid)
POST /api/paystack  ← Next.js API Route (server-side)
        ↓
Server calls Paystack /transaction/initialize
with secret key (never exposed to client)
        ↓
Server returns access_code to client
        ↓
Client calls PaystackPop.resumeTransaction(access_code)
        ↓
Paystack Inline modal opens (card / bank transfer / USSD)
        ↓
    [User pays]              [User closes modal]
        ↓                          ↓
  onSuccess fires             onCancel fires
        ↓                          ↓
  Cart cleared              isLoading reset
  Redirect to /confirmation  User stays on checkout
        ↓
  Reference, name, email,
  total passed as URL params
        ↓
  Confirmation page renders receipt
```

### Key Security Decisions

- **Secret key is server-only.** `PAYSTACK_SECRET_KEY` lives in `.env.local` and is only accessed inside the Next.js API route. It is never bundled into client JavaScript.
- **Only `access_code` is returned** from the API route — the full Paystack initialization response (which contains sensitive transaction metadata) is never forwarded to the client.
- **`onCancel` vs `onClose`:** This project uses Paystack V2 Inline JS (`https://js.paystack.co/v2/inline.js`). In V2's `resumeTransaction` API, the callback for user-initiated exits is named `onCancel` — this is the direct V2 equivalent of `onClose` in the V1 Popup API referenced in the project spec.
- **`paymentSuccessRef`:** A `useRef` flag prevents the "redirect to cart if empty" effect from firing during the brief window between a successful payment and the cart being cleared, avoiding a false redirect.

---

## Project Structure

```
quickserve/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Home / product catalog
│   │   ├── product/
│   │   │   └── [id]/page.tsx         # Product detail page
│   │   ├── cart/
│   │   │   └── page.tsx              # Shopping cart
│   │   ├── checkout/
│   │   │   └── page.tsx              # Checkout form + Paystack
│   │   ├── confirmation/
│   │   │   └── page.tsx              # Order confirmation / receipt
│   │   └── api/
│   │       └── paystack/
│   │           └── route.ts          # Server-side Paystack initializer
│   ├── components/
│   │   ├── FilterSidebar.tsx         # Category filter drawer
│   │   ├── ProductCard.tsx           # Individual product tile
│   │   └── ProductSkeleton.tsx       # Loading placeholder
│   ├── services/
│   │   └── api.ts                    # fetchProducts() — API abstraction
│   └── store/
│       └── useCartStore.ts           # Zustand cart store with persistence
├── .env.local                        # Environment variables (not committed)
├── .env.example                      # Safe template for env vars
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Paystack account (free) — [register at paystack.com](https://paystack.com)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/quickserve.git
cd quickserve
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

Copy the example env file and fill in your Paystack keys:

```bash
cp .env.example .env.local
```

Then edit `.env.local` (see [Environment Variables](#environment-variables) below).

**4. Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```env
# Paystack Public Key (safe to expose — used client-side for the inline modal)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Paystack Secret Key (server-side ONLY — never expose this in client code)
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Important:** Never commit `.env.local` to version control. The `.gitignore` generated by `create-next-app` excludes it by default. Use test keys during development; switch to live keys only on your production deployment.

You can obtain both keys from your [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer) under **Settings → API Keys & Webhooks**.

---

## API Reference

### External: Product Catalog

**Base URL:** `https://api.oluwasetemi.dev/products`

| Parameter  | Type     | Description                  |
| ---------- | -------- | ---------------------------- |
| `page`     | `number` | Page number (default: 1)     |
| `limit`    | `number` | Items per page (default: 12) |
| `category` | `string` | Filter by category slug      |
| `name`     | `string` | Search by product name       |

**Example request:**

```
GET https://api.oluwasetemi.dev/products?page=1&limit=12&category=electronics
```

**Response shape:**

```json
{
	"data": [
		{
			"id": "string",
			"name": "string",
			"price": 15000,
			"quantity": 5,
			"images": "[\"https://...\"]",
			"category": "string"
		}
	],
	"meta": {
		"hasNextPage": true,
		"total": 120
	}
}
```

### Internal: Paystack Initializer

**Route:** `POST /api/paystack`  
**Description:** Server-side proxy that initializes a Paystack transaction. Accepts cart and customer data, calls the Paystack API with the secret key, and returns only the `access_code` needed to open the inline modal.

**Request body:**

```json
{
	"email": "customer@example.com",
	"amount": 1750000,
	"ref": "QS-ABC123-XYZ456",
	"firstname": "Amara",
	"lastname": "Okafor",
	"phone": "08012345678",
	"metadata": {}
}
```

**Success response:**

```json
{ "access_code": "xyz_access_code_from_paystack" }
```

**Error response:**

```json
{ "error": "email and a positive amount are required" }
```

---

## Deployment

This project is deployed on **Vercel** with Paystack running in **test mode**.

### Deploy to Vercel

**1. Push your repository to GitHub** (ensure `.env.local` is in `.gitignore`)

**2. Import the project on Vercel**

- Go to [vercel.com/new](https://vercel.com/new)
- Select your repository
- Vercel will auto-detect Next.js — no build configuration needed

**3. Add environment variables in the Vercel dashboard**

- Go to **Project Settings → Environment Variables**
- Add `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` and `PAYSTACK_SECRET_KEY`
- Use your **test keys** for the test deployment

**4. Deploy**

Every push to `main` triggers an automatic redeployment.

> **Note:** The Paystack public key is prefixed with `NEXT_PUBLIC_` so Next.js bundles it for client-side use. The secret key has no `NEXT_PUBLIC_` prefix and remains server-side only — Vercel's serverless functions handle it safely.

---
