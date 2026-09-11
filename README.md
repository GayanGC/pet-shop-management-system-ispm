# 🐾 4 Paw Animal Clinic - Enterprise Veterinary Care & Hospital Management Platform

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-8.3-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-3.10-22C55E?style=for-the-badge)](https://recharts.org/)
[![Tests](https://img.shields.io/badge/E2E_Tests-12%2F12%20Passed-brightgreen?style=for-the-badge)](https://github.com/GayanGC/pet-shop-management-system-ispm)
[![Currency](https://img.shields.io/badge/Currency-LKR%20(Rs.)-blue?style=for-the-badge)](https://github.com/GayanGC/pet-shop-management-system-ispm)

> **Enterprise Mission Statement**:  
> **4 Paw Animal Clinic** is a full-stack veterinary hospital management and clinical operating system engineered to digitize small-animal clinical workflows. It features microchip patient PIN indexing, real-time pharmacy inventory controls with batch expiry countdown, conflict-free clinician appointment scheduling, POS checkout with atomic stock deductions, and executive financial business intelligence with RFC-4180 CSV export streaming.

---

## 🏛️ System Architecture

```text
                                      4 PAW ANIMAL CLINIC - SYSTEM ARCHITECTURE
                                     
   +----------------------------------------------------------------------------------------------------+
   |                                 PRESENTATION LAYER (React 18 + Vite SPA)                           |
   |                                                                                                    |
   |  +---------------------+  +---------------------+  +---------------------+  +--------------------+ |
   |  |   Module 1: PETS    |  | Module 2: PHARMACY  |  | Module 3: SCHEDULE  |  |   Module 4: POS    | |
   |  |  - Microchip PIN    |  |  - Stock Adjustment |  |  - Calendar Matrix  |  |  - POS Checkout    | |
   |  |  - Medical Logs     |  |  - Batch Expiry     |  |  - Clinician Chips  |  |  - Thermal Receipt | |
   |  |  - Health Passport  |  |  - Supplier Catalog |  |  - 409 Guard Dialog |  |  - BI Analytics    | |
   |  +----------+----------+  +----------+----------+  +----------+----------+  +---------+----------+ |
   +-------------|------------------------|------------------------|-----------------------|------------+
                 |                        |                        |                       |
                 +------------------------+-----------+------------+-----------------------+
                                                      |
                                         HTTPS / JSON REST API Calls
                                                      |
   +--------------------------------------------------v-------------------------------------------------+
   |                             APPLICATION & API ROUTING LAYER (Express.js)                           |
   |                                                                                                    |
   |  [cors]  [express.json]  [authMiddleware: Dev-Fallback / Bearer JWT]  [Logging & Error Interceptor] |
   |                                                                                                    |
   |    /api/pets              /api/inventory           /api/suppliers        /api/bookings   /api/billing
   |   (PetController)      (InventoryController)     (SupplierController)  (BookingCtrl)   (BillingCtrl)
   +--------------------------------------------------+-------------------------------------------------+
                                                      |
                                            Mongoose ODM Data Access
                                                      |
   +--------------------------------------------------v-------------------------------------------------+
   |                           CROSS-MODULE INTEGRITY & REAL-TIME EVENT LOOPS                           |
   |                                                                                                    |
   |   1. PIN Link Loop: Auto-indexes PET-XXXX microchip identifier into Appointment & Invoicing schemas|
   |   2. Double-Booking Guard: Checks [doctor + date + timeSlot] !== 'Cancelled' -> HTTP 409 Conflict  |
   |   3. Atomic POS Auto-Deduction: Bulk stock deduction on sale; triggers low-stock & out-of-stock flags|
   |   4. Financial BI Aggregation: 7-day revenue timelines, payment breakdown & streaming CSV exports  |
   +--------------------------------------------------+-------------------------------------------------+
                                                      |
                                          MongoDB Wire Protocol
                                                      |
   +--------------------------------------------------v-------------------------------------------------+
   |                               DATABASE STORAGE & PERSISTENCE LAYER                                 |
   |                                                                                                    |
   |            Primary: MongoDB Atlas Cloud Cluster  <== (Auto-Fallback) ==>  Local MongoDB            |
   |            (cluster0.2xk0lxp.mongodb.net)                                 (127.0.0.1:27017)        |
   +----------------------------------------------------------------------------------------------------+
```

---

## 👥 4-Module Functional Breakdown (Group Roles & Responsibilities)

The application adheres to high-cohesion, decoupled domain boundaries mapped across four core team member modules:

### 🐕 Module 1: Patient Registration, Clinical Logs & Official Health Passport
- **Microchip Patient PIN Registry**: Auto-generates unique, non-colliding human-readable patient identifiers (`PET-XXXX`) upon registration with species, breed, age, and weight tracking.
- **Chronological Clinical Diagnosis**: Maintains timestamped medical logs (diagnoses, treatments administered, vaccines given, and attending veterinary surgeon).
- **Printable Patient Health Passport**: Generates an official, print-optimized document styled with specialized print rules (`@media print`) for physical pet passports and travel clearance.
- **Patient Archival Management**: Provides clinical archival toggling (`Active` vs `Archived`) with reason tracking (e.g. Relocated, Deceased) without corrupting historic invoices or medical records.

---

### 💊 Module 2: Pharmacy Inventory, Expiry Lifecycle & Supplier Directory
- **Veterinary Pharmaceutical Catalog**: Real-time tracking of medications, vaccines, surgical consumables, and retail items in Sri Lankan Rupees (LKR / Rs.).
- **Dynamic Stock Thresholds**: Visual indicators for healthy stock, low-stock warnings (`<= 5 units`), and out-of-stock emergency alerts.
- **Batch Expiry Lifecycle Protocol**: Automatic calculation of days remaining per pharmaceutical batch. Batches within `<= 30 days` are flagged in the Expiry Tracker.
- **Audit Batch Write-Off & Disposal**: Secure write-off workflow that marks expired or contaminated batches as disposed with mandatory audit remarks.
- **Supplier & Distributor Directory**: Comprehensive directory of registered pharmaceutical vendors with supplied categories, contact persons, and operational status.

---

### 📅 Module 3: Clinical Appointments & Double-Booking Prevention
- **Interactive Clinician Schedule**: Calendar date selection paired with dynamic time-slot chips (`09:00 AM` through `04:30 PM`) and doctor selection.
- **Strict HTTP 409 Conflict Guard**: Backend prevents double-booking the same clinician for the same date and time slot (`409 Conflict`), preventing operational scheduling collisions.
- **Live Slot Availability**: Frontend dynamically reflects occupied slots in red and disables duplicate bookings in real time.
- **Rescheduling Workflow**: Full lifecycle support to reschedule, cancel, or confirm appointments with instant status updates.

---

### 💳 Module 4: POS Invoicing, Financial BI & CSV Reporting
- **Point-of-Sale Terminal**: Interactive counter billing terminal supporting multi-item orders, custom discounts, and automatic tax calculations formatted in Sri Lankan Rupees (Rs.).
- **Real-Time Stock Auto-Deduction**: Completing an invoice atomically decrements inventory quantities from the database and prevents overselling.
- **Printable Thermal Receipts**: Generates clean, printable transaction receipts with item breakdowns, customer details, and invoice tags (`INV-YYYY-XXXX`).
- **Financial Business Intelligence & Analytics**: Aggregates 7-day revenue timelines, average order value (AOV), total sales volume, and payment method distribution using interactive Recharts.
- **RFC-4180 CSV Export Streaming**: High-speed, streaming CSV export endpoint allowing clinic managers to download full invoice records into Excel or BI software.

---

## 🔌 RESTful API Endpoints Reference

All endpoints are hosted under `http://localhost:5000/api` and communicate via standard JSON:

| Module | Method | Endpoint | Description | Status Codes |
| :--- | :---: | :--- | :--- | :---: |
| **Pets** | `GET` | `/pets` | Retrieve all registered pet patients | `200 OK` |
| **Pets** | `POST` | `/pets` | Register new pet with auto-generated PIN | `201 Created`, `400` |
| **Pets** | `GET` | `/pets/:id/health-passport` | Retrieve aggregated clinical health passport | `200 OK`, `404` |
| **Pets** | `POST` | `/pets/:id/medical-history` | Append medical diagnosis/treatment log | `200 OK`, `400` |
| **Pets** | `PATCH` | `/pets/:id/archive` | Toggle pet archival status | `200 OK`, `404` |
| **Pets** | `DELETE` | `/pets/:id` | Soft-delete / remove pet record | `200 OK`, `404` |
| **Pharmacy** | `GET` | `/inventory` | Retrieve all products & stock levels | `200 OK` |
| **Pharmacy** | `POST` | `/inventory` | Create new product or pharmaceutical batch | `201 Created`, `400` |
| **Pharmacy** | `PUT` | `/inventory/:id/stock` | Quick-adjust stock level delta (+/-) | `200 OK`, `400` |
| **Pharmacy** | `GET` | `/inventory/expiring-soon` | List items with batches expiring in `<=30` days | `200 OK` |
| **Pharmacy** | `POST` | `/inventory/dispose-batch/:id` | Write off and dispose expired medicine batch | `200 OK`, `404` |
| **Suppliers** | `GET` | `/suppliers` | List all registered pharmaceutical suppliers | `200 OK` |
| **Suppliers** | `POST` | `/suppliers` | Register new medical vendor / supplier | `201 Created`, `400` |
| **Suppliers** | `PUT` | `/suppliers/:id` | Update supplier details & supplied categories | `200 OK`, `404` |
| **Appointments** | `GET` | `/bookings` | Retrieve all appointments | `200 OK` |
| **Appointments** | `POST` | `/bookings` | Schedule appointment with 409 Conflict Guard | `201 Created`, `409 Conflict` |
| **Appointments** | `GET` | `/bookings/schedule` | Query doctor availability for a given date | `200 OK` |
| **Appointments** | `PUT` | `/bookings/:id/reschedule` | Reschedule date/slot with conflict validation | `200 OK`, `409 Conflict` |
| **Appointments** | `PUT` | `/bookings/:id/cancel` | Cancel appointment and free up time slot | `200 OK` |
| **POS Billing** | `POST` | `/billing` | Process POS checkout & auto-deduct stock | `201 Created`, `400` |
| **POS Billing** | `GET` | `/billing` | Retrieve historic invoices list | `200 OK` |
| **POS Billing** | `GET` | `/billing/analytics` | Aggregate 7-day sales metrics & payment splits | `200 OK` |
| **POS Billing** | `GET` | `/billing/export-csv` | Stream RFC-4180 compliant CSV sales ledger | `200 OK` |

---

## 🧪 Quality Assurance & Automated Integration Testing

The platform includes a dedicated, standalone integration test suite (`backend/test_e2e.js`) verifying database consistency, business logic guards, and cross-module transactions against live endpoints.

Execute the test suite with:
```bash
node backend/test_e2e.js
```

### 📊 E2E Integration Test Suite Results (12/12 Passed)

| Suite | Assertion ID | Test Case Description | Verified Behavior | Status |
| :--- | :---: | :--- | :--- | :---: |
| **Suite 1: Patients & Medical** | `1.1` | Register Pet Patient | Returns HTTP 201 with unique auto-generated `PET-XXXX` PIN | ✅ **PASS** |
| **Suite 1: Patients & Medical** | `1.2` | Append Diagnosis Log | Appends clinical notes, treatment, and vet to medical history array | ✅ **PASS** |
| **Suite 1: Patients & Medical** | `1.3` | Health Passport Aggregation | Returns demographic info, full clinical log history & vaccinations | ✅ **PASS** |
| **Suite 2: Pharmacy & Expiry** | `2.1` | Product Batch Creation | Creates medication item with batch number & expiry date in LKR | ✅ **PASS** |
| **Suite 2: Pharmacy & Expiry** | `2.2` | Expiring-Soon Query | Detects batches with `daysRemaining <= 30` or status 'Expired' | ✅ **PASS** |
| **Suite 2: Pharmacy & Expiry** | `2.3` | Write-off Batch Disposal | Sets `stockQuantity: 0` and records audit disposal reason | ✅ **PASS** |
| **Suite 3: Appointments** | `3.1` | Valid Slot Booking | Books clinician slot with HTTP 201 and assigns patient PIN | ✅ **PASS** |
| **Suite 3: Appointments** | `3.2` | Strict Double-Booking Guard | Blocks identical doctor/date/timeSlot with **HTTP 409 Conflict** | ✅ **PASS** |
| **Suite 4: POS & Stock** | `4.1` | POS Invoice Creation | Generates invoice `INV-YYYY-XXXX` with tax, discount & LKR total | ✅ **PASS** |
| **Suite 4: POS & Stock** | `4.2` | Atomic Stock Deduction | Database stock immediately decrements by purchased quantity | ✅ **PASS** |
| **Suite 5: Analytics & CSV** | `5.1` | Financial BI Aggregation | Aggregates total revenue, AOV, daily trend, & payment split | ✅ **PASS** |
| **Suite 5: Analytics & CSV** | `5.2` | RFC-4180 CSV Streaming | Streams `text/csv` download containing full sales records | ✅ **PASS** |

```text
=======================================================================
📊 E2E INTEGRATION TEST RESULTS SUMMARY
-----------------------------------------------------------------------
  Total Tests Executed : 12
  Passed Assertions    : 12
  Failed Assertions    : 0
=======================================================================
 🎉 ALL 5 MODULE END-TO-END INTEGRATION TESTS PASSED CLEANLY!
```

---

## ⚡ Quick Start & Developer Guide

### Prerequisites
- **Node.js**: `>= 18.0.0` (Tested on v22.18.0 LTS)
- **MongoDB**: Active MongoDB Atlas cluster or local MongoDB service running on `127.0.0.1:27017`
- **npm**: `>= 9.0.0`

---

### Installation & Launch in 4 Steps

#### 1. Clone Repository & Install All Dependencies
Execute the single-command installer to configure dependencies across root, backend, and frontend:
```bash
npm run install:all
```

#### 2. Configure Environment Variables
Verify or create `backend/.env`:
```ini
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.2xk0lxp.mongodb.net/pet_shop_db?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=super_secret_jwt_key_pet_shop_2026
```
*(Note: If MongoDB Atlas network access is unavailable, the backend automatically falls back to local MongoDB on `127.0.0.1:27017/pet_shop_db`)*.

#### 3. Populate Sample Clinical Records (LKR Currency)
Seed the database with high-quality sample patients, pharmacy inventory, doctor appointments, and POS sales invoices:
```bash
node backend/seed.js
```

#### 4. Concurrently Run Full-Stack System
Start both the Express API and Vite React frontend concurrently with a single command:
```bash
npm run dev:all
```

- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:5000](http://localhost:5000)

---

### Run Automated Integration Tests
Verify end-to-end system health and data integrity against the live server:
```bash
node backend/test_e2e.js
```

---

## 📜 Academic Integrity & Project Licensing

Developed as part of the **SLIIT Year 3 Semester 1 Integrated Project (ISPM)**.  
Licensed under the [ISC License](LICENSE).
