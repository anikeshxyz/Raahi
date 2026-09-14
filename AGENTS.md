# AGENTS.md — Raahi Café Management System

## Stack
- Backend: Node.js (LTS), Express.js
- Database: MongoDB (Mongoose ODM)
- Frontend (customer website): Next.js (React), Tailwind CSS
- Admin dashboard: React (Vite), Tailwind CSS
- Auth: JWT-based, role-based access control (see roles below)
- API style: REST, versioned under /api/v1
- Validation: Zod or Joi on all request bodies
- Testing: Jest + Supertest for backend, React Testing Library for frontend

## Project structure
- /backend — Express app, modular by domain (routes/controllers/models per module:
  pos, inventory, kot, employee, payroll, reports, website-cms)
- /frontend-website — customer-facing Next.js site
- /frontend-admin — POS/admin/KDS dashboard (React)
- /docs — architecture notes, ER/schema diagrams, API contracts

## Non-negotiables
- Every module that touches money (billing, payroll, refunds) must be covered by
  unit tests before being marked done.
- All sensitive actions (bill cancellation, refund, stock adjustment, salary change)
  must write to an audit_log collection with actor, timestamp, before/after values.
- Roles: Owner/Admin, Manager, Cashier, Kitchen Staff, HR, Accountant — enforce with
  Express middleware checked on every protected route, not just UI hiding.
- Inventory stock must deduct automatically via recipe mapping on every POS sale —
  this is the core "interconnected" requirement of the whole system. Use MongoDB
  transactions (multi-document ACID) for the order-creation + stock-deduction flow
  so a failed deduction can't leave a bill charged with no matching stock change.
- Don't invent scope beyond what's asked in a given phase prompt. If something in
  the SRS is ambiguous, ask before assuming.

## Workflow
- Work in small, reviewable commits. One commit per completed sub-task.
- After implementing a module, write a short summary of what was built and what
  was intentionally deferred.
- Run and show test output before declaring a task done.
