# 🍔 Food Delivery Ecosystem

A production-grade, enterprise food ordering and delivery ecosystem built with **Node.js, Express, PostgreSQL, Prisma ORM, and React 18 / Vite**. 

Organized into a clean, modern full-stack architecture with a unified **Backend** and a single **Frontend** application (housing customer storefront, admin dashboard, and delivery driver portals with **one `node_modules`**).

---

## 🌟 Architecture & Directory Structure

```
Food-Delivery/
├── backend/                  # REST API & Relational Database (Express 5, Prisma ORM, PostgreSQL)
│   ├── prisma/
│   │   ├── schema.prisma     # Relational schema (13 models, PostgreSQL)
│   │   └── seed.js           # Database seeder (Admin, Driver, Customer, Menu items)
│   ├── src/
│   │   ├── config/           # Prisma client, Cloudinary, Stripe, Env configuration
│   │   ├── controllers/      # Slim HTTP controllers
│   │   ├── middleware/       # Auth, Admin role verification, Validation, Error handlers
│   │   ├── routes/           # Express REST routes
│   │   ├── services/         # Transaction-safe business domain services
│   │   ├── utils/            # Shared constants, formatters, tokens, logger
│   │   ├── validations/      # Express-validator schemas
│   │   ├── app.js            # Express application setup
│   │   └── server.js         # Entry point & HTTP listener
│   ├── tests/                # Jest unit & PostgreSQL integration test suites
│   └── package.json
│
├── frontend/                 # ONE Unified Frontend Application (Single node_modules)
│   ├── src/
│   │   ├── portals/
│   │   │   ├── client/       # Customer Storefront (browse menus, cart, checkout, tracking)
│   │   │   ├── admin/        # Admin Management Dashboard (catalog, orders, reports, settings)
│   │   │   └── driver/       # Delivery Driver Portal (active jobs, order pickup, delivery completion)
│   │   ├── shared/           # Cross-portal domain constants, formatters, and status badges
│   │   ├── App.jsx           # Master multi-portal router (/, /admin/*, /driver/*)
│   │   ├── main.jsx          # React 18 createRoot & BrowserRouter
│   │   └── index.css         # Tailwind CSS v4 & theme variables
│   ├── index.html            # Vite HTML template
│   ├── vite.config.js        # Vite + Tailwind + React configuration
│   └── package.json          # Single package.json for all frontend dependencies
│
├── package.json              # Root workspace orchestrator
├── .gitignore                # Unified gitignore
└── README.md
```

---

## 🛠️ Tech Stack

* **Database**: PostgreSQL with Prisma ORM v6 (ACID transactions, relational schemas, typed client)
* **Backend**: Node.js, Express 5.x, JWT Authentication, Multer, Cloudinary, Stripe
* **Frontend**: React 18, Vite, Tailwind CSS v4, React Router v7, Framer Motion, Recharts
* **Testing**: Jest, Supertest, PostgreSQL integration test suites
* **Workspaces**: npm workspaces (`backend`, `frontend`)

---

## 🏁 Quick Start

### Prerequisites

* **Node.js** (v18 or higher)
* **PostgreSQL** (v14 or higher) running locally or remotely

### 1. Configure Database Connection

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://postgres:1234@localhost:5432/food_delivery?schema=public
JWT_SECRET=supersecretkey_foodiehub_2026
PORT=5000
```

### 2. Push Schema & Seed Database

```bash
# Push Prisma schema to PostgreSQL (creates 13 tables, keys, indexes)
npm run db:push

# Seed default accounts and menu items
npm run db:seed
```

### 3. Run Applications

```bash
# Start Backend API server (port 5000)
npm run dev:backend

# Start Unified Frontend (port 5173 - covers Customer, Admin, and Driver portals)
npm run dev:frontend
```

### 4. Run Test Suite

```bash
npm test
```

---

## 👥 Seed Accounts & Portals

| Portal | URL Path | Seed Email | Seed Password | Role |
| :--- | :--- | :--- | :--- | :--- |
| **Customer Storefront** | `/` | `user@foodiehub.com` | `User@123456` | `user` |
| **Admin Dashboard** | `/admin` | `admin@foodiehub.com` | `Admin@123456` | `admin` |
| **Driver Portal** | `/driver` | `driver@foodiehub.com` | `Driver@123456` | `driver` |
