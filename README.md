# Raahi Café Management System ☕🍰

A modern, production-grade café management system and customer web experience built with the MERN + Next.js stack.

---

## 🌟 Highlights & Architecture

- **Customer Website (`/frontend-website`)**: Next.js 14, React 18, Tailwind CSS, luxury artisanal café UI, interactive live menu with dietary filters, table reservation system with immediate confirmation, events & contact.
- **Admin & POS Portal (`/frontend-admin`)**: Vite + React 18 SPA with Tailwind CSS, role-based navigation (Admin, POS Billing, Kitchen Display System / KDS, Inventory, Payroll, Reports).
- **Backend REST API (`/backend`)**: Node.js & Express, MongoDB with Mongoose ODM, JWT authentication, role-based access control (RBAC), automatic recipe-based stock deduction, audit logging.
- **API Versioning**: Standardized under `/api/v1`.

---

## 🚀 Quick Start Guide (For You & Your Friends)

Follow these steps to run the complete project locally on your machine.

### 1. Prerequisites
- **Node.js**: v18 or newer ([Download](https://nodejs.org/))
- **MongoDB**: Local MongoDB community service running at `mongodb://localhost:27017` OR a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster URI.

---

### 2. Setup & Run Backend (Port 5000)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# (Optional) Check or customize .env
# Copy example if not present:
# cp .env.example .env

# Start the backend server
npm run dev
```
> The backend runs at `http://localhost:5000`. On first run, it automatically seeds initial artisanal coffee, tea, and bakery menu items into your MongoDB database!

---

### 3. Setup & Run Customer Website (Port 3000)

In a new terminal window:
```bash
# Navigate to customer website
cd frontend-website

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```
> Open [http://localhost:3000](http://localhost:3000) in your browser to browse the luxury customer website, view menu items, and book tables.

---

### 4. Setup & Run Admin / POS Portal (Port 5173)

In a third terminal window:
```bash
# Navigate to admin portal
cd frontend-admin

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
> Open [http://localhost:5173](http://localhost:5173) to view the Admin Dashboard and POS systems.

---

## 📁 Repository Structure

```text
├── backend/               # Express.js REST API & Mongoose models
│   ├── src/
│   │   ├── config/        # Database & environment configuration
│   │   ├── middleware/    # Auth, RBAC, and audit log middleware
│   │   ├── models/        # Category, MenuItem, Order, Inventory, Recipe, etc.
│   │   ├── modules/       # Domain controllers and routes
│   │   └── seeds/         # Auto-seeding default menu data
│   └── server.js          # API server entrypoint
│
├── frontend-website/      # Customer-facing Next.js 14 web application
│   ├── app/
│   │   ├── menu/          # Dynamic menu with real-time categories
│   │   ├── reservation/   # Interactive reservation booking
│   │   ├── events/        # Café workshop & event showcases
│   │   └── contact/       # Location & hours
│   └── globals.css        # Luxury café styling & custom themes
│
├── frontend-admin/        # Staff & management dashboard (Vite + React)
│   └── src/
│       ├── components/    # Layout, Sidebar, Navbar
│       └── pages/         # POS, KDS, Inventory, Payroll, Reports, Login
│
└── docs/                  # Architecture, SRS, and API documentation
```

---

## 🛠️ Testing

To run the automated test suite for the backend:
```bash
cd backend
npm test
```
