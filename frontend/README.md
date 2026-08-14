# Pet Shop Management System - Frontend Architecture (Sprint 0)

This frontend repository structure isolates UI components and API service modules for each of the 4 team members.

## Team Member Directory Allocation:

### Member 1: Pet Registry & Customer Pet Portal
- `src/components/pet/` - Pet cards, pet registration form, pet profile views
- `src/services/petService.js` - API calls to `/api/pets`

### Member 2: Inventory & Stock Control System
- `src/components/inventory/` - Product tables, stock management, add item forms
- `src/services/inventoryService.js` - API calls to `/api/inventory`

### Member 3: Service & Appointment Booking System
- `src/components/booking/` - Calendar view, appointment booking forms, status badges
- `src/services/bookingService.js` - API calls to `/api/bookings`

### Member 4: Order Processing & POS Billing System
- `src/components/billing/` - POS register interface, cart summary, invoice generator
- `src/services/billingService.js` - API calls to `/api/billing`

### Shared / Global Components
- `src/components/common/` - Navbar, Footer, Sidebar, Alert Modal, Protected Route wrappers
- `src/context/AuthContext.jsx` - Global authentication & user token state
