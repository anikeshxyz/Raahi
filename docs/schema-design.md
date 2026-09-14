# Raahi Café — Architecture & Schema Documentation

## System Architecture

Raahi Café uses a modular domain-driven REST API powered by Node.js & Express, connected to MongoDB via Mongoose ODM.

```
                  ┌──────────────────────────────┐
                  │    Next.js Customer Web      │
                  │   (/about, /menu, /res...)   │
                  └──────────────┬───────────────┘
                                 │ HTTP (REST)
                                 ▼
┌─────────────────────────┐  /api/v1  ┌──────────────────────────────┐
│  React (Vite) Admin/POS ├──────────►│    Express Backend API       │
│  (/pos, /kot, /inv...)  │           │   Modular Subsystems (/v1)   │
└─────────────────────────┘           └──────────────┬───────────────┘
                                                     │
                                                     ▼
                                      ┌──────────────────────────────┐
                                      │   MongoDB Multi-Doc ACID     │
                                      │   (14 Core Collections)      │
                                      └──────────────────────────────┘
```

## Entity Relationship & Schema Details

### 1. Embedded OrderItem Rationale
- Orders store items as embedded documents (`Order.items: [orderItemSchema]`).
- Guarantees point-in-time pricing immutability (custom modifiers, unit prices, tax rates are fixed at checkout).
- Atomically updatable in a single write operation.

### 2. Core Collections
1. **`User`**: Authentication credentials, role-based authorization (`Owner/Admin`, `Manager`, `Cashier`, `Kitchen Staff`, `HR`, `Accountant`).
2. **`Employee`**: Staff personnel record, department, base salary, joining date.
3. **`Category`**: Hierarchical menu classifications.
4. **`MenuItem`**: Dish / beverage listing, price, tax percentage, vegetarian flag, recipe pointer.
5. **`Table`**: Floor layout, seating capacity, current occupancy, assigned order ID.
6. **`Order`**: Comprehensive billing record, payment method (`cash`, `card`, `upi`, `split`), tax totals, embedded line items.
7. **`InventoryItem`**: Raw ingredients, packaging materials, current stock, reorder thresholds.
8. **`Recipe`**: Ingredient breakdown per menu item for automated stock deduction on POS sale.
9. **`Supplier`**: Vendor profiles, contact information, GSTIN.
10. **`PurchaseOrder`**: Restocking requests, quantities, unit costs, fulfillment status.
11. **`Attendance`**: Staff check-in/check-out timestamps and hours worked.
12. **`LeaveRequest`**: Leave applications, approval states, date ranges.
13. **`PayrollRun`**: Monthly salary computation, deductions, additions, disbursement tracking.
14. **`AuditLog`**: Immutable record of sensitive actions (cancellations, refunds, salary adjustments, inventory write-offs).
