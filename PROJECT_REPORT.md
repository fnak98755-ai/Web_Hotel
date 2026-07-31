# Hotel Booking System — Project Report

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Analysis & Requirements](#2-analysis--requirements)
3. [Implementation (Features Built)](#3-implementation-features-built)
4. [Developer Environment Setup](#4-developer-environment-setup)
5. [System Architecture (MVC)](#5-system-architecture-mvc)
6. [Database Design](#6-database-design)
7. [API Endpoints](#7-api-endpoints)
8. [Version Control (GitHub)](#8-version-control-github)
9. [How to Run the System](#9-how-to-run-the-system)
10. [Default Accounts](#10-default-accounts)
11. [Known Issues & Future Work](#11-known-issues--future-work)

---

## 1. Project Overview

The **Hotel Booking System** improves the hotel reservation process by allowing customers to book rooms easily, quickly, and conveniently. It also helps hotel staff manage bookings, customer information, room availability, and daily operations more efficiently while reducing manual work and errors.

### Advantages of This Software
- Makes room reservation and booking easier.
- Allows customers to check room availability and make reservations anytime and anywhere.
- Reduces paperwork and minimizes human errors.
- Improves the efficiency of hotel management and daily operations.
- Provides a faster and more convenient service for customers.

### Who Is This Software Designed For?
- **Customers** — browse rooms, check availability, book online, view booking history.
- **Receptionists / Cashiers (Front Desk Staff)** — manage bookings, update booking statuses, record payments.
- **Hotel Managers** — manage rooms, services, employees, customers, and reports.
- **System Administrators** — full system control: users, hotel settings, reports.

### Problems Solved by This Software
| Problem (before) | Solution (after) |
|---|---|
| Manual recording of customer info & reservations — time-consuming, error-prone | Digital booking records stored in MongoDB |
| Hard to know if a room is available | Real-time room availability check |
| Duplicate room bookings | Server-side conflict check prevents double booking |
| Hard to search customers / booking history | Search & filter on all lists, per-customer records |
| Price/payment calculation errors | Automatic total calculation + discounts, receipt generation |
| Slow booking & revenue reports | Daily / weekly / monthly report generation with CSV/JSON export |

---

## 2. Analysis & Requirements

### 2.1 Functional Requirements

| Module | Features |
|---|---|
| **Login** | Cashier login (view bookings, update status: Confirmed / Checked-in / Checked-out / Cancelled). Admin login (full system management). |
| **Booking Management** | Create booking, cancel booking, view booking history, add/remove hotel services. |
| **Room Management** | Add/update/delete rooms, update status (Available, Under Maintenance). |
| **Customer Management** | Register customer, update info, view booking history, manage status. |
| **Service Management** | Add hotel services, update service status. |
| **Employee Management** | Add/update employees, deactivate accounts. |
| **Payment Management** | Cash / Credit-Debit Card / QR Code payment, discounts (fixed & percentage), payment receipts (printable). |
| **Booking Reports** | Generate reports daily, weekly, monthly (+ CSV/JSON export). |
| **System Settings** | Manage hotel information (name, address, contact details, check-in/out times). |
| **Public Website** | Room browsing, availability check, customer registration, online booking, "My Bookings" page. |

### 2.2 Non-Functional Requirements
- **Security**: JWT authentication, bcrypt password hashing, role-based access control.
- **Usability**: Simple responsive web UI with a clean admin dashboard.
- **Reliability**: Server-side validation prevents double booking and invalid dates.
- **Maintainability**: Clean MVC separation of concerns.

---

## 3. Implementation (Features Built)

### 3.1 Backend (Node.js + Express + MongoDB)
| Feature | Status | Notes |
|---|---|---|
| Login with JWT + roles (`admin` / `staff` / `customer`) | ✅ Done | Passwords hashed with bcrypt |
| Booking CRUD + status + cancel | ✅ Done | Conflict check prevents double booking |
| Add / remove services on a booking | ✅ Done | Recalculates total amount |
| Room management + maintenance toggle | ✅ Done | Real-time status (available / booked / maintenance) |
| Customer management | ✅ Done | Duplicate email prevented |
| Service management | ✅ Done | Categories: food, transport, spa, laundry, other |
| Employee management | ✅ Done | Activate / deactivate |
| Payment (cash / card / QR, discounts, receipts) | ✅ Done | Auto receipt number, QR code generation |
| Booking reports (daily / weekly / monthly) | ✅ Done | Revenue + booking counts |
| Hotel settings | ✅ Done | Single-document settings |
| Public: register, browse rooms, availability, online booking | ✅ Done | Auto-creates customer + pending payment |

### 3.2 Frontend (Angular 18)
| Page | Purpose |
|---|---|
| `/` (Public Home) | Hero + room browsing with date availability search |
| `/room/:id` | Room detail + online booking form |
| `/login`, `/register` | Authentication pages |
| `/my-bookings` | Customer's own booking history |
| `/bookings` | Booking management (create, cancel, services) |
| `/bookings/report` | Daily / weekly / monthly reports + export |
| `/rooms` | Room CRUD + status toggle |
| `/customers` | Customer CRUD |
| `/services` | Service CRUD |
| `/employees` | Employee CRUD + activate/deactivate |
| `/payments` | Record payments, receipts, QR display |
| `/settings` | Hotel information settings |
| `/user` | User management (admin only) |

---

## 4. Developer Environment Setup

### 4.1 Required Software
| Software | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org) | v18+ (tested on v20+) | JavaScript runtime |
| [npm](https://www.npmjs.com) | v9+ (comes with Node.js) | Package manager |
| [MongoDB](https://www.mongodb.com) | v6+ (Community Server) | Database |
| [MongoDB Compass](https://www.mongodb.com/products/compass) | Latest (optional) | Visual database manager |
| [Angular CLI](https://angular.io/cli) | 18.x | Frontend scaffolding & dev server |
| [Visual Studio Code](https://code.visualstudio.com) | Latest (optional) | Code editor |
| [Git](https://git-scm.com) | v2.5x | Version control |

### 4.2 Installation Steps

#### 1) Install Node.js
Download and install from https://nodejs.org (LTS version). Verify:
```bash
node --version
npm --version
```

#### 2) Install MongoDB
- Download **MongoDB Community Server** from https://www.mongodb.com/try/download/community.
- Install with default settings (runs as a Windows service).
- Optional: install MongoDB Compass for visual browsing.
- Verify the database is running:
```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

#### 3) Install Angular CLI (globally)
```bash
npm install -g @angular/cli
ng version
```

#### 4) Install Git
Download from https://git-scm.com and verify:
```bash
git --version
```

### 4.3 Project Dependencies (already installed in this project)

**Backend** (`Backend/package.json`):
- `express` 4.18 — HTTP server / routing
- `mongoose` 7.6 — MongoDB ODM
- `jsonwebtoken` 9.0 — JWT authentication
- `bcryptjs` 2.4 — password hashing
- `cors` 2.8 — cross-origin access
- `dotenv` 17.4 — environment variables
- `nodemon` 3.0 — auto-restart during development

**Frontend** (`Frontend/package.json`):
- Angular 18.2 (core, common, forms, router, animations, platform-browser)
- `qrcode` 1.5 — QR code generation for payments
- `rxjs` 7.8, `zone.js`, `tslib` — Angular runtime deps

Install all dependencies:
```bash
# Backend
cd Backend
npm install

# Frontend
cd ../Frontend
npm install
```

---

## 5. System Architecture (MVC)

The system follows the **Model-View-Controller (MVC)** architecture.

### 5.1 Architecture Diagram

```
┌──────────────────────────┐        ┌──────────────────────────────┐
│       CLIENT (View)      │  HTTP  │       SERVER (Backend)       │
│   Angular 18 Frontend    │<──────>│   Node.js + Express          │
│                          │  JSON  │                              │
│  Pages/Components        │        │  Routes (Controller)         │
│  - Public pages          │        │  ── Controllers (Logic)      │
│  - Admin dashboard       │        │      │                       │
│  Services (HTTP calls)   │        │      ▼                       │
│                          │        │  Models (Mongoose Schema)    │
│  ┌──────────────┐        │        │      │                       │
│  │  UI / HTML   │        │        │      ▼                       │
│  │  CSS / SCSS  │        │        │  MongoDB Database            │
│  └──────────────┘        │        │  (hotel_booking)             │
└──────────────────────────┘        └──────────────────────────────┘
```

### 5.2 MVC Breakdown

#### Backend (Node.js/Express)

| Layer | Folder | Responsibility | Files |
|---|---|---|---|
| **Model** | `Backend/models/` | MongoDB schemas & data shapes | `User`, `Room`, `Booking`, `Customer`, `Payment`, `Service`, `Employee`, `Hotel` |
| **View** | (frontend serves this role) | JSON responses returned by controllers | — |
| **Controller** | `Backend/controllers/` | Business logic, validation, DB operations | one controller per model |
| **Routes** | `Backend/routes/` | URL mapping → controller methods | `user.routes.js`, `room.routes.js`, `booking.routes.js`, etc. |
| **Middleware** | `Backend/middleware/` | Auth (JWT verify), role checks | `auth.js`, `role.js` |
| **Config** | `Backend/config/` | Database connection | `db.js` |
| **Entry** | `server.js` / `app.js` | Start server, mount routes | — |

Example request flow:
```
GET /api/rooms
   │
   ▼
routes/room.routes.js  ──►  middleware/auth.js (verify JWT)
   │
   ▼
controllers/room.controller.js  (getAll: query DB, compute status)
   │
   ▼
models/Room.js  ──►  MongoDB
   │
   ▼
JSON response → Angular component (room list table)
```

#### Frontend (Angular)
| Layer | Folder | Responsibility |
|---|---|---|
| **View** | `src/app/pages/` | HTML templates & SCSS styles per page |
| **Controller (Component)** | `src/app/pages/*.ts` | Data binding, user interactions, state |
| **Service (Model bridge)** | `src/app/services/` | HTTP calls to backend API |
| **Routing** | `src/app/app-routing.module.ts` | Route map + guards |
| **Layout** | `src/app/layout/` | Admin sidebar + dashboard shell |

### 5.3 Request/Response Flow Example (Booking)

```
Customer clicks "Book Now" on /room/5
        │
        ▼
RoomDetailComponent → BookingService.post('/api/bookings/online')
        │
        ▼
routes/booking.routes.js → auth → booking.controller.createOnline()
        │  ├─ validates dates & room availability
        │  ├─ finds/creates Customer by email
        │  └─ creates Booking (status: confirmed) + pending Payment
        ▼
MongoDB (bookings, customers, payments collections)
        │
        ▼
JSON response { booking, payment } → frontend success message
```

---

## 6. Database Design

Database name: `hotel_booking` (MongoDB — no tables, uses collections/documents)

| Collection | Key Fields |
|---|---|
| **users** | username, email, password (bcrypt), role (`admin`/`staff`/`customer`) |
| **rooms** | roomNumber, type (single/double/suite/deluxe), pricePerNight, capacity, amenities, isAvailable |
| **customers** | name, email, phone, address, idType (passport/national_id/drivers_license), idNumber |
| **bookings** | customer (ref), room (ref), checkIn, checkOut, status (confirmed/checked_in/checked_out/cancelled), totalAmount, services[] |
| **payments** | booking (ref), amount, discount, discountType, finalAmount, method (cash/card/qr), status, receiptNumber |
| **services** | name, description, price, category (food/transport/spa/laundry/other) |
| **employees** | name, email, phone, position, department, salary, hireDate, isActive |
| **hotel** | hotelName, address, phone, email, website, checkInTime, checkOutTime (single document) |

Relationships: `Booking → Customer` (many-to-one), `Booking → Room` (many-to-one), `Payment → Booking` (one-to-one), `Booking → Services` (many-to-many via line items).

---

## 7. API Endpoints

Base URL: `http://localhost:3000/api`

### Public (no login)
| Method | Path | Purpose |
|---|---|---|
| POST | `/users/login` | Login → JWT token |
| POST | `/public/register` | Customer self-registration |
| GET | `/public/rooms?checkIn&checkOut` | Room list + availability |
| GET | `/public/rooms/:id` | Room detail |
| GET | `/public/hotel` | Hotel information |

### Authenticated (admin / staff)
| Method | Path | Purpose |
|---|---|---|
| GET/POST | `/rooms` | List / create rooms |
| PUT/DELETE | `/rooms/:id` | Update / delete room |
| PATCH | `/rooms/:id/status` | Toggle maintenance |
| GET/POST | `/bookings` | List / create booking |
| PATCH | `/bookings/:id/cancel` | Cancel booking |
| POST | `/bookings/:id/services` | Add service to booking |
| DELETE | `/bookings/:id/services/:itemId` | Remove service |
| GET | `/bookings/report?range=daily|weekly|monthly` | Reports |
| GET/POST/PUT/DELETE | `/customers` | Customer CRUD |
| GET/POST/PUT/DELETE | `/services` | Service CRUD |
| GET/POST/PUT/DELETE | `/employees` | Employee CRUD |
| PATCH | `/employees/:id/status` | Activate/deactivate |
| GET/POST/PUT/DELETE | `/payments` | Payment CRUD |
| GET/PUT | `/hotel` | Hotel settings |

### Customer (any authenticated user)
| Method | Path | Purpose |
|---|---|---|
| GET | `/bookings/my` | My bookings |
| POST | `/bookings/online` | Book a room online |
| GET | `/users/me` | My profile |

### Admin only
| Method | Path | Purpose |
|---|---|---|
| GET/POST/PUT/DELETE | `/users` | User management |
| PUT | `/hotel` | Update hotel settings |
| DELETE | (rooms/bookings/customers/payments/services/employees) | Delete operations |

---

## 8. Version Control (GitHub)

### 8.1 Git Configuration (first time only)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 8.2 Initialize Repository (done for this project)
```bash
git init
```

### 8.3 `.gitignore` (protects sensitive/auto-generated files)
The project ignores:
- `node_modules/` (dependencies — reinstalled via `npm install`)
- `.env` (contains JWT_SECRET & DB URL — NEVER commit secrets)
- `dist/` (build output)
- `.angular/` (Angular cache)
- `.vscode/`, `*.log`

### 8.4 First Commit
```bash
git add .
git commit -m "Initial commit: Hotel Booking System (Angular 18 + Express + MongoDB)"
```

### 8.5 Push to GitHub

**Option A — Create repo on GitHub website:**
1. Go to https://github.com and sign in (create an account if you don't have one).
2. Click **New repository** → name it `hotel-booking-system` → **Public** or **Private** → **Create repository**.
3. Connect local repo to GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/hotel-booking-system.git
git branch -M main
git push -u origin main
```

**Option B — Using GitHub CLI (`gh`):**
```bash
# Install GitHub CLI first: https://cli.github.com
gh auth login
gh repo create hotel-booking-system --public --source . --remote origin --push
```

### 8.6 Daily Workflow
```bash
# Check what changed
git status

# Stage + commit changes
git add .
git commit -m "Describe what you changed"

# Upload to GitHub
git push

# Download latest from GitHub
git pull
```

### 8.7 Branching (recommended for larger teams)
```bash
git checkout -b feature/booking-lifecycle   # new branch
# ... work ...
git push -u origin feature/booking-lifecycle
git checkout main                           # switch back to main
git merge feature/booking-lifecycle         # merge changes
```

---

## 9. How to Run the System

### Step 1 — Start MongoDB
Make sure MongoDB service is running (installed as a Windows service by default).

### Step 2 — Configure the Backend
1. Copy/check `Backend/.env`:
```
PORT=3000
MONGO_URI=mongodb://localhost:27017/hotel_booking
JWT_SECRET=your_secret_key
```
2. Install dependencies: `cd Backend && npm install`
3. (Optional) Seed default admin/cashier users: `npm run seed`

### Step 3 — Start the Backend Server
```bash
cd Backend
npm run dev        # development (auto-restart)  → http://localhost:3000
# or
npm start          # production
```

### Step 4 — Start the Frontend
```bash
cd Frontend
npm install
npm start          # → http://localhost:4200
```

Open **http://localhost:4200** in your browser.

---

## 10. Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@hotel.com` | `admin123` |
| Cashier (Staff) | `cashier@hotel.com` | `cashier123` |

Customer accounts are created via the **Register** page on the public website.

---

## 11. Known Issues & Future Work

### Known Issues
- `GET /api/users` returns password hashes — must be fixed (security).
- Report revenue counts cancelled bookings — should exclude cancelled.
- Room "booked" status logic flags future bookings as booked today.
- No check-in / check-out transition endpoints (only via generic update).

### Future Work
- Add check-in / check-out workflow buttons.
- Add "Occupied" room status.
- Allow customers to cancel their own bookings.
- Show per-customer booking history on the Customers page.
- Generate printable PDF receipts.
- Add pagination for large lists.
- Deploy to production (Vercel / Railway / Render + MongoDB Atlas).

---

*Report generated for the Hotel Booking System project (Web Develop III).*
