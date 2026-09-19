# Airbnb Production-Grade Clone Application

> Full-Stack, Pixel-Perfect Airbnb Clone recreating the complete property listing experience, full-screen Photo Tour, Lightbox modal with keyboard navigation, dynamic booking and pricing engine, Host inventory and device photo uploads, and dedicated Admin governance panel.

---

## 🌟 Key Features & Views

### 1. Listing Page (Property Detail Page - PDP)
- **Header & Title**: Property title, location badge, guest favorite badge, ratings summary, and save-to-wishlist trigger.
- **5-Photo Bento Showcase**: Pixel-perfect gallery grid with hover zoom effects, rounded corners, and "Show all photos" trigger.
- **Overview & Amenities**: Host info avatar, property specs (guests, bedrooms, beds, bathrooms), highlights, and categorized amenities.
- **Dual-Month Calendar**: Interactive check-in and checkout date picker with real-time availability checking and cancellation dates.
- **Guest Favourite 5.0 Laurel Banner**: Authentic badge styling recreating the Airbnb 5.0 rating laurel wreath banner.
- **Detailed Reviews & Sub-Ratings**: Cleanliness, accuracy, communication, location, check-in, and value breakdown cards.
- **Where you'll be (Map)**: Interactive Leaflet map with custom Airbnb pin marker.
- **Sticky Booking Widget**: Floating card computing stay totals, weekly discounts, cleaning fees, 12% service fees, 18% GST taxes, and check-in date locks.

### 2. Photo Tour & Lightbox Overlay
- **Full-Screen Photo Tour**: Immersive high-resolution gallery opened from "Show all photos" or clicking any image.
- **Interactive Lightbox Viewer**: Single-photo viewing mode with previous/next arrows, counter (`x / N`), and sharing/wishlist sync.
- **Full Keyboard Accessibility**:
  - `←` (Left Arrow): Previous photo
  - `→` (Right Arrow): Next photo
  - `Escape`: Close viewer modal

### 3. Booking Engine & Checkout Modal
- **Multi-Night Dynamic Calculator**: Automatically computes stays across any selected date range with discount rules.
- **Payment Gateway Simulation**: Credit/Debit card validation, expiry/CVV masking, UPI ID payments, and idempotency protection against duplicate charges.
- **Async Confirmation Receipts**: Automated booking confirmation with transaction receipts and email notifications via Nodemailer.

### 4. RBAC & Host Management
- **Role-Based Access Control**: Strict access separation between Guest (`user`), Host (`host`), and Administrator (`admin`).
- **Become a Host Onboarding**: Multi-step host agreement and instant verification workflow.
- **Host Dashboard**: Metric overview (Active Listings, Total Reservations, Total Earnings).
- **Per-Listing Bookings & Inventory Management**: Dedicated modal showing every guest reservation for that property, rates adjustment, capacity settings, and photo management.
- **Device Photo Uploads**: Drag-and-drop file upload zone and file browser (`FileReader.readAsDataURL`) supporting local device image selection + URL links.

### 5. Admin Governance & Operations
- **Platform Analytics**: Total registered users, active hosts, live listings, and gross volume tracker.
- **User RBAC Switcher**: Instant role promotion/demotion between `user`, `host`, and `admin`.
- **Listing Moderation**: Live toggles to publish, unpublish, and feature properties on the homepage.
- **All Platform Bookings Log**: Unified transaction monitor displaying all reservations platform-wide.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, Vanilla CSS (Design Token System), Framer Motion, Lucide Icons, Leaflet / React-Leaflet |
| **State & Data** | React Context API (`AuthContext`, `WishlistContext`, `SearchContext`, `ToastContext`), Axios Interceptors |
| **Backend** | Node.js (v24), Express.js (Modular Domain Architecture), CORS, Helmet, Morgan, Cookie-Parser, Compression |
| **Database** | MongoDB Atlas / Mongoose (Compound Indexes, Aggregations, Atomic Collision Checking) |
| **Security & Auth**| JWT (Access + Refresh Tokens), Bcrypt.js, Express-Validator, Redlock Concurrency Pattern |
| **Communications** | Nodemailer (HTML Email Invoices & Booking Confirmations) |

---

## 🚀 Quickstart & Setup

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
# Server will start on http://localhost:8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Dev server will run on http://localhost:5173
```

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@airbnb.com` | `Password123!` | Full Admin Panel (`/admin`), User RBAC, Global Bookings |
| **Super Host** | `aarav.host@airbnb.com` | `Password123!` | Host Dashboard (`/host`), Inventory, Device Uploads, Payouts |
| **Verified Guest**| `rohan.guest@airbnb.com`| `Password123!` | Stays, Search, Wishlists, My Trips (`/trips`) |

---

## 📚 Documentation Deliverables

- 📄 **[SYSTEM_DESIGN.md](file:///Users/sayan-dev731/Code/Work/Airbnb/SYSTEM_DESIGN.md)**: High-Level Design (HLD) & Low-Level Design (LLD) with complete Mermaid architecture diagrams, ERDs, distributed locking concurrency strategy, and API contracts.
- 📄 **[AI_PROMPTS_AND_WORKFLOW.md](file:///Users/sayan-dev731/Code/Work/Airbnb/AI_PROMPTS_AND_WORKFLOW.md)**: Structured chronological log of AI prompts, agentic workflows, subagent capabilities, and refinement cycles.
