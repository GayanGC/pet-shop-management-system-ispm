# 🐾 PetCare Pro - Enterprise Pet Shop Management System

> **Academic Context**: SLIIT Year 3 Semester 1 Integrated Project  
> **Course Modules**: Information Systems Project Management (IE3151) | Enterprise Architecture (IE3121) | Enterprise Network & Information Security (IE3101)  
> **Architecture Pattern**: Decoupled Modular Monolith REST API Backend + Single Page Application Frontend  

---

## 📌 Executive Project Overview

**PetCare Pro** is an enterprise-grade full-stack web application designed to streamline pet shop operations, inventory stock control, veterinary and grooming service scheduling, and point-of-sale (POS) billing processing. 

Built using an **Agile Scrum methodology** across **Sprint 0 (Foundation)** and **Sprint 1 (Core CRUD & UI)**, the architecture strictly isolates modules across 4 student team members to eliminate code conflicts and ensure maximum maintainability.

---

## 👥 Agile Team Scope Allocation Matrix

| Team Member | System Module & Responsibilities | Core Technical Deliverables |
| :--- | :--- | :--- |
| **Shared Base** | **Authentication & Security** | JWT Authentication, Bcrypt Password Hashing, RBAC Middleware (`Admin`, `Staff`, `Customer`), User Model |
| **Member 1** | **Pet Registry & Customer Portal** | Auto PIN generation (`PET-XXXX`), multi-criteria species/search filters, pet health profiles, soft deletion |
| **Member 2** | **Inventory & Stock Control** | Product catalog, low-stock threshold triggers (`≤ 5 units`), supplier management, stock adjustment |
| **Member 3** | **Service & Appointment Booking** | Vet checkup/grooming scheduler, double-booking slot conflict validation, booking lifecycle status management |
| **Member 4** | **Order Processing & POS Billing** | POS checkout terminal, item subtotal calculation, automated inventory deduction, invoice generation (`INV-2026-XXXX`) |

---

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js (Modular Router Architecture)
- **Database**: MongoDB with Mongoose ODM
- **Security & Auth**: JSON Web Tokens (JWT), Bcrypt.js Password Encryptor, Custom RBAC Guards
- **Frontend**: React 18, Tailwind CSS, Async Fetch/Axios API Clients
- **Tools & Utilities**: Dotenv, CORS, Nodemon, Git Version Control

---

## 📂 Repository Directory Layout

```text
pet-shop-management-system/
├── backend/
│   ├── config/
│   │   └── db.js                         # Mongoose MongoDB Connection helper
│   ├── controllers/
│   │   ├── authController.js             # Shared Authentication Controller
│   │   ├── petController.js              # Member 1 Controller (Pets)
│   │   ├── inventoryController.js        # Member 2 Controller (Products)
│   │   ├── bookingController.js          # Member 3 Controller (Appointments)
│   │   └── billingController.js          # Member 4 Controller (Invoices)
│   ├── middleware/
│   │   └── authMiddleware.js             # JWT Verification & RBAC Guards
│   ├── models/
│   │   ├── User.js                       # Shared User Schema (Admin, Staff, Customer)
│   │   ├── Pet.js                        # Member 1 Pet Schema
│   │   ├── Product.js                    # Member 2 Inventory Product Schema
│   │   ├── Appointment.js                # Member 3 Service Appointment Schema
│   │   └── Invoice.js                    # Member 4 Billing Invoice Schema
│   ├── routes/
│   │   ├── authRoutes.js                 # Shared Auth Endpoints (/api/auth)
│   │   ├── petRoutes.js                  # Member 1 Endpoints (/api/pets)
│   │   ├── inventoryRoutes.js            # Member 2 Endpoints (/api/inventory)
│   │   ├── bookingRoutes.js              # Member 3 Endpoints (/api/bookings)
│   │   └── billingRoutes.js              # Member 4 Endpoints (/api/billing)
│   ├── .env.example                      # Environment variables template
│   ├── package.json                      # Backend dependencies & scripts
│   └── server.js                         # Main Express Server Entrypoint
└── frontend/
    ├── README.md                         # Frontend component layout documentation
    └── src/
        ├── components/
        │   ├── pet/                      # Member 1 React UI Components
        │   ├── inventory/                # Member 2 React UI Components
        │   ├── booking/                  # Member 3 React UI Components
        │   └── billing/                  # Member 4 React UI Components
        ├── services/                     # Member API Clients (pet, inventory, booking, billing)
        └── App.jsx                       # Main Interactive Full-Stack React Dashboard
```

---

## ⚡ Quick Start Guide

### Prerequisites
- Node.js (v18.0 or higher)
- MongoDB installed locally (`mongodb://127.0.0.1:27017`) or a valid MongoDB Atlas Connection URI.

### 1. Backend Server Setup
```bash
# Navigate to backend directory
cd backend

# Install Node dependencies
npm install

# Start development server
npm run dev
```
The Express server will start on **`http://localhost:5000`**.

### 2. Environment Configuration (`backend/.env`)
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/pet_shop_db
JWT_SECRET=super_secret_jwt_key_pet_shop_2026
```

### 3. API Health Verification
- `GET http://localhost:5000/api/pets/health`
- `GET http://localhost:5000/api/inventory/health`
- `GET http://localhost:5000/api/bookings/health`
- `GET http://localhost:5000/api/billing/health`

---

## 📜 License & Academic Integrity Notice
This repository is developed for university assessment purposes at SLIIT. Unauthorized copying or plagiarizing for commercial release without attribution is strictly prohibited.
