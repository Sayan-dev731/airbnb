# Airbnb Clone – Production System Design (HLD & LLD)

---

## 1. Executive Summary & Objective
This document details the complete **High-Level Design (HLD)** and **Low-Level Design (LLD)** for the production-deployed vacation-rental marketplace application modeled after Airbnb, including the cloud infrastructure architecture, database schema, concurrency controls, and client-server interactions.

### Live Production Deployment
- **Frontend Live URL (Vercel Edge)**: [https://airbnb.sayan.codes](https://airbnb.sayan.codes) / [https://airbnb-nine-steel.vercel.app](https://airbnb-nine-steel.vercel.app)
- **Backend API Live URL (Azure App Service)**: [https://airbnb-endxaec2bsd4b9at.westus3-01.azurewebsites.net](https://airbnb-endxaec2bsd4b9at.westus3-01.azurewebsites.net)
- **Database**: MongoDB Atlas High-Availability Multi-Region Cluster
- **Media Delivery**: Cloudinary Global CDN + Direct Device File Uploads (`FileReader`)

The system is architected to handle:
- **100M+ Monthly Active Users (MAU)** searching properties globally with sub-100ms latency.
- **Millions of real-time listings** with instant availability filtering and geospatial lookups.
- **Zero double-booking guarantee** using distributed locking, atomic database transactions, and idempotent payment processing.
- **Pixel-perfect frontend parity** matching modern design systems, fluid micro-interactions, responsive sticky booking widgets, full-screen Photo Tour, and accessible keyboard-navigated Lightbox viewer.

---

## 2. High-Level Design (HLD) Architecture

```mermaid
flowchart TD
    subgraph Clients["Clients & Edge Network"]
        WebDesktop["Desktop Web (React 18 + Vite)"]
        WebMobile["Mobile Web / PWA"]
        VercelCDN["Vercel Global Edge Network\n- Global Anycast CDN & Edge Caches\n- Automated SSL & Custom Domain (airbnb.sayan.codes)\n- Client-side Routing & Static Asset Optimization"]
        WebDesktop --> VercelCDN
        WebMobile --> VercelCDN
    end

    subgraph AzureCloud["Microsoft Azure Cloud Infrastructure (Region: West US 3)"]
        AzureFrontDoor["Azure App Service Ingress & Load Balancer\n- Automated SSL Termination\n- Traffic Routing & Health Probes (100% Healthy)\n- Inbound Security & DDOS Protection"]
        
        subgraph AzureAppService["Azure App Service (Linux Web App: Node.js 24 LTS)"]
            APIGateway["Express API Engine & Security Middleware\n- JWT Authentication & RBAC (User / Host / Admin)\n- Rate Limiting (express-rate-limit)\n- CORS Policy & Security Headers (Helmet, Compression)"]
            
            subgraph Microservices["Modular Domain Controllers"]
                AuthService["Auth & RBAC Service\n- Signup, Login, 6-Digit OTP Gatekeeper\n- Refresh Tokens & Session Whitelist"]
                ListingService["Listing & Inventory Service\n- CRUD Operations & Moderation\n- Inventory, Capacity & Rate Adjustments"]
                BookingService["Booking & Pricing Engine\n- Real-Time Date Collision Verification\n- Dynamic Multi-Night & 18% GST Engine\n- Lifecycle: Pending -> Confirmed -> Cancelled"]
                PaymentService["Payment & Payout Engine\n- Idempotent Payment Processing (Debouncing)\n- SHA-256 Card Tokenization\n- Host Payouts & Refund Allocations"]
                SearchService["Search & Discovery Service\n- Geospatial Proximity Matching\n- Category & City Aggregations"]
                MediaService["Media Ingestion Service\n- Device File Uploads (FileReader Base64 / Multer)\n- Cloudinary CDN Image Pipeline"]
                NotificationService["Notification Service\n- Nodemailer SMTP Email Dispatch\n- Booking Confirmation & Invoices"]
            end
            
            APIGateway --> AuthService
            APIGateway --> ListingService
            APIGateway --> BookingService
            APIGateway --> PaymentService
            APIGateway --> SearchService
            APIGateway --> MediaService
            APIGateway --> NotificationService
        end
    end

    VercelCDN -->|Secure HTTPS REST Calls| AzureFrontDoor
    AzureFrontDoor --> APIGateway

    subgraph Storage["Data, Media & Caching Tier"]
        MongoDBAtlas["MongoDB Atlas Cluster (Replica Set)\n- Primary Write Master + Read Replicas\n- Compound Indexes & Geospatial 2dsphere Indexes\n- Collections: Users, Listings, Bookings, Payments, Favorites, Reviews"]
        CloudinaryCDN["Cloudinary Media CDN / Object Storage\n- High-Res Property Galleries & Cover Photos\n- WebP/AVIF Transcoding & Edge Caching"]
        RedisCache["Redis Memory Cluster\n- Redlock Distributed Locking\n- Rate-Limiting Buckets & PDP Cache"]
        
        AuthService --> MongoDBAtlas
        ListingService --> MongoDBAtlas
        BookingService --> MongoDBAtlas
        BookingService --> RedisCache
        PaymentService --> MongoDBAtlas
        SearchService --> MongoDBAtlas
        MediaService --> CloudinaryCDN
    end

    subgraph Monitoring["Observability & Diagnostics"]
        AzureInsights["Azure App Service Diagnostics & Health Probes\n- Instance Monitoring (ASP-Collegerg-b095 B1)\n- Node.js 24 LTS Runtime Status"]
        VercelAnalytics["Vercel Observability & Speed Insights\n- Core Web Vitals (LCP, FID, CLS)\n- Edge Request Logs"]
    end
```

---

## 3. Production Deployment Architecture (Azure + Vercel)

### 3.1 Frontend Infrastructure: Vercel Edge Network
- **Hosting Platform**: Vercel Cloud Platform (Hobby/Pro tier).
- **Domains Configured**:
  - `airbnb.sayan.codes` (Custom domain with automated Let's Encrypt TLS/SSL).
  - `airbnb-nine-steel.vercel.app` (Vercel production domain).
  - `airbnb-lmwvcg7e8-sayans-projects-1a80d8b5.vercel.app` (Deployment preview URL).
- **Build Pipeline**: Vite production bundle compiler with tree-shaking, code splitting, and gzip/brotli compression.
- **Edge Routing**: Instant global distribution via Vercel's Anycast Edge Network with single-page app fallback routing (`rewrites: [{ source: "/(.*)", destination: "/index.html" }]`).

### 3.2 Backend Infrastructure: Microsoft Azure App Service
- **Hosting Platform**: Microsoft Azure Web Apps / App Service.
- **Resource Group**: `College-rg`.
- **Region**: `West US 3`.
- **Operating System & Runtime**: Linux with `Node.js 24 LTS`.
- **App Service Plan**: `ASP-Collegerg-b095 (Basic: B1)`.
- **Production Hostname**: `airbnb-endxaec2bsd4b9at.westus3-01.azurewebsites.net`.
- **Health Check Probes**: Automated health probe monitoring `GET /api/v1/health` returning `100.00% (Healthy)`.
- **Environment & Secret Management**: Injected securely via Azure App Service Application Settings (`PORT=8000`, `MONGODB_URI`, `ACCESS_TOKEN_SECRET`, `CLOUDINARY_*`, `NODEMAILER_*`).

---

## 4. Core System Design Pillars

### 4.1 Distributed Concurrency & Zero Double-Booking Strategy
In a high-concurrency booking marketplace, race conditions occur when two guests attempt to book overlapping dates simultaneously.

```mermaid
sequenceDiagram
    autonumber
    actor GuestA as Guest A (Vercel Web)
    actor GuestB as Guest B (Vercel Web)
    participant API as Azure App Service (Express)
    participant Redis as Redis Redlock
    participant DB as MongoDB Atlas (Bookings Collection)
    participant Payment as Payment Gateway
    participant Mail as Nodemailer Worker

    GuestA->>API: POST /payments/process-and-book (Check-in: Sep 19, Check-out: Sep 30)
    GuestB->>API: POST /payments/process-and-book (Check-in: Sep 20, Check-out: Sep 25)
    
    API->>Redis: Acquire Distributed Lock: `lock:listing:{listingId}` (TTL: 5s)
    Note over API,Redis: Guest A acquires lock first. Guest B waits/fails fast.
    
    API->>DB: Atomic Collision Query:\n`listing: id, bookingStatus: { $in: ['confirmed', 'pending'] }`, Overlapping dates check
    DB-->>API: 0 Overlapping records found
    
    API->>Payment: Process idempotent payment (Debounced)
    Payment-->>API: Payment Captured (TxnId, Receipt)
    
    API->>DB: Insert Booking Record (Status: 'confirmed')
    DB-->>API: Booking Created (ID: 6aae...)
    
    API->>Redis: Release Lock: `lock:listing:{listingId}`
    API->>Mail: Async Nodemailer HTML Confirmation Dispatch
    API-->>GuestA: 201 Created: Reservation Confirmed 🎉

    Note over GuestB,API: Guest B acquires lock next:
    API->>DB: Atomic Collision Query
    DB-->>API: 1 Conflicting Booking Found (Guest A's reservation)
    API-->>GuestB: 409 Conflict: "Selected dates are no longer available"
```

#### Collision Detection Algorithm (MongoDB Query)
```javascript
const conflictingBooking = await Booking.findOne({
  listing: listingId,
  bookingStatus: { $in: ["confirmed", "pending"] },
  $or: [
    { checkInDate: { $lte: checkIn }, checkOutDate: { $gt: checkIn } },
    { checkInDate: { $lt: checkOut }, checkOutDate: { $gte: checkOut } },
    { checkInDate: { $gte: checkIn }, checkOutDate: { $lte: checkOut } },
  ],
});
```

---

### 4.2 Dynamic Pricing & Tax Calculation Engine
Every listing supports flexible nightly rates, weekly discounts, cleaning fees, platform service fees, and applicable GST/VAT taxes:

$$\text{Nights} = \max\left(1, \left\lceil \frac{|\text{checkOut} - \text{checkIn}|}{1000 \times 60 \times 60 \times 24} \right\rceil\right)$$

$$\text{Base Total} = \text{basePricePerNight} \times \text{Nights}$$

$$\text{Weekly Discount} = \begin{cases} \text{round}\left(\frac{\text{Base Total} \times \text{discountPercentage}}{100}\right), & \text{if Nights} \ge 7 \\ 0, & \text{otherwise} \end{cases}$$

$$\text{Discounted Base} = \text{Base Total} - \text{Weekly Discount}$$

$$\text{Service Fee} = \text{round}(\text{Discounted Base} \times 0.12)$$

$$\text{Taxes (18\% GST)} = \text{round}((\text{Discounted Base} + \text{Service Fee}) \times 0.18)$$

$$\text{Grand Total} = \text{Discounted Base} + \text{Cleaning Fee} + \text{Service Fee} + \text{Taxes}$$

---

### 4.3 Scalability & Sharding Strategy

1. **Database Sharding (MongoDB Atlas)**:
   - **Sharding Key for Listings**: `{ "location.city": "hashed", "_id": 1 }` enables high query distribution while allowing localized geographic scatter-gather queries.
   - **Sharding Key for Bookings**: `{ "user": 1, "createdAt": -1 }` ensures fast user trip lookups, paired with secondary indexes on `{ "listing": 1, "bookingStatus": 1, "checkInDate": 1, "checkOutDate": 1 }`.
2. **Read/Write Splitting**:
   - Primary Node handles write mutations (`createBooking`, `processPaymentAndBook`, `createListing`).
   - Secondary Read Replicas serve high-volume read endpoints (`getListings`, `getListingById`, `checkPrice`).
3. **Multi-Layered Caching (Redis + Vercel Edge)**:
   - **L1 (Vercel Edge / Browser)**: Static assets, images, and fonts cached globally with `Cache-Control: public, max-age=31536000, immutable`.
   - **L2 (Redis Memory Cache)**: Popular property PDP responses cached with a TTL of 300 seconds; invalidated immediately upon host listing mutation (`updateListing`).
4. **Idempotent Payment Gateway Layer**:
   - Duplicate submissions are intercepted using an `Idempotency-Key` header generated on the client.
   - Idempotency records are cached in MongoDB Atlas to guarantee that rapid double-clicks on "Confirm and Pay" execute only one bank transaction.

---

## 5. Low-Level Design (LLD)

### 5.1 Data Models & Entity Relationships (ERD)

```mermaid
erDiagram
    USER ||--o{ LISTING : "hosts"
    USER ||--o{ BOOKING : "books"
    USER ||--o{ FAVORITE : "wishlists"
    USER ||--o{ REVIEW : "writes"
    LISTING ||--o{ BOOKING : "receives"
    LISTING ||--o{ REVIEW : "has"
    LISTING ||--o{ FAVORITE : "saved_in"
    BOOKING ||--|| PAYMENT : "generates"

    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        string role "user | host | admin"
        boolean isEmailVerified
        string emailVerificationOTP
        date emailVerificationOTPExpiry
        boolean isSuperHost
        boolean isHostVerified
        object avatar
        date createdAt
    }

    LISTING {
        ObjectId _id PK
        ObjectId host FK
        string title
        string description
        string propertyType
        string category
        object location "city, state, country, lat, lng"
        object pricing "basePrice, discountPercentage, cleaningFee, currency"
        object capacity "guests, bedrooms, beds, bathrooms"
        array amenities
        array photos "url, caption, isCover, order"
        string coverPhoto
        object ratingsSummary "averageRating, totalReviews"
        boolean isPublished
        boolean isFeatured
        boolean isGuestFavorite
        date createdAt
    }

    BOOKING {
        ObjectId _id PK
        ObjectId user FK
        ObjectId listing FK
        ObjectId host FK
        date checkInDate
        date checkOutDate
        number nightsCount
        object guestsCount "adults, children, infants, pets"
        object pricingBreakdown "basePricePerNight, stayTotal, discountAmount, cleaningFee, serviceFee, taxes, grandTotal"
        string bookingStatus "pending | confirmed | cancelled | completed"
        string paymentStatus "pending | paid | refunded | failed"
        object paymentDetails "paymentMethod, transactionId, paidAt"
        string cancellationReason
        string specialRequests
        date createdAt
    }

    PAYMENT {
        ObjectId _id PK
        ObjectId booking FK
        ObjectId user FK
        ObjectId listing FK
        string transactionId UK
        string idempotencyKey
        number amount
        string currency
        string status "captured | refunded | failed"
        object paymentMethod "type, brand, last4, cardholderName, maskedVpa, bankName"
        string receiptNumber
        date createdAt
    }

    FAVORITE {
        ObjectId _id PK
        ObjectId user FK
        ObjectId listing FK
        string collectionName
        date createdAt
    }

    REVIEW {
        ObjectId _id PK
        ObjectId user FK
        ObjectId listing FK
        number rating "1-5"
        object subRatings "cleanliness, accuracy, communication, location, checkIn, value"
        string comment
        date createdAt
    }
```

---

### 5.2 Frontend Architecture & State Flow

```mermaid
graph TD
    subgraph AppContainer["App.jsx (Root Routing & Providers)"]
        AuthProvider["AuthContext (User, Tokens, Login/Signup Modals, OTP Verification)"]
        WishlistProvider["WishlistContext (Favorites Set, Heart Toggles, Optimistic Sync)"]
        SearchProvider["SearchContext (Destination, Date Range, Guest Counts, Active Category)"]
        ToastProvider["ToastContext (Animated Notification Banners)"]
    end

    subgraph Views["Application Views"]
        HomeView["HomePage.jsx\n- Morphing Sticky Search Pill\n- Category Bar Carousel\n- Responsive Listing Cards Grid\n- Quick Wishlist Hearting"]
        PDPView["ListingDetailPage.jsx\n- PDPHeader & Breadcrumbs\n- PDPGallery (5-Photo Showcase)\n- PDPOverview & Amenities\n- PDPCalendarSection (Dual Month Interactive)\n- PDPGuestFavouriteBanner (5.0 Laurel Banner)\n- PDPReviews (Sub-ratings & Host breakdown)\n- MapContainer (Leaflet Interactive)\n- PDPHostSection\n- PDPBookingCard (Sticky Real-Time Quote Widget)"]
        TripsView["MyTripsView.jsx\n- Confirmed Trip Cards\n- Dates, Guests, Price Paid\n- Cancellation Modal"]
        HostView["HostDashboard.jsx\n- Platform Statistics\n- My Listings with Guest Counts Badge\n- CreateListingModal (Drag & Drop + Device File Upload)\n- ListingInventoryModal (Guest Bookings, Rates, Photo Manager)"]
        AdminView["AdminDashboard.jsx\n- Platform Gross Volume & Registered Metrics\n- Users & RBAC Role Switcher\n- Listings Moderation (Publish/Feature Toggles)\n- All Platform Bookings Table"]
    end

    subgraph Overlays["Modal & Overlay System"]
        PhotoModal["PhotoGalleryModal.jsx (Photo Tour & Lightbox Viewer)\n- Full-Screen Photo Tour\n- Lightbox Single-Photo View\n- Keyboard Navigation (ArrowLeft, ArrowRight, Escape)\n- Top Bar (Counter, Share, Wishlist Heart)"]
        CheckoutModal["CheckoutModal.jsx\n- Real-Time Price Details Breakdown\n- Credit/Debit Card & UPI Payment Simulation\n- Confirmed State Animation"]
        EmailVerifyModal["EmailVerificationModal.jsx\n- Mandatory 6-Digit OTP Gatekeeper\n- Resend Timer & Dev Code Support"]
        BecomeHostModal["BecomeHostModal.jsx\n- Host Application & Instant Role Switcher"]
    end

    AppContainer --> Views
    PDPView --> PhotoModal
    PDPView --> CheckoutModal
    AppContainer --> EmailVerifyModal
    AppContainer --> BecomeHostModal
```

---

### 5.3 Photo Tour & Lightbox Interactive Mechanics

| View | Trigger | Key Capabilities | Accessibility & Interaction |
| :--- | :--- | :--- | :--- |
| **Listing Showcase** | PDP Initial Load | 5-photo bento grid layout with hover zoom | Click any photo or "Show all photos" |
| **Photo Tour Overlay** | Click "Show all photos" or main photo | Full-screen immersive photo gallery | Displays all property photos in high resolution |
| **Interactive Lightbox** | Click specific photo in gallery | Single-photo focused presentation | Keyboard $\leftarrow$ / $\rightarrow$ arrows loop photos; `Escape` closes modal; swipe/click arrows |

---

## 6. Security, RBAC & API Contract

### 6.1 Role-Based Access Control (RBAC) Matrix

| Endpoint / Operation | Public | Guest (`user`) | Host (`host`) | Administrator (`admin`) |
| :--- | :---: | :---: | :---: | :---: |
| `GET /api/v1/listings` | ✅ | ✅ | ✅ | ✅ |
| `GET /api/v1/listings/:id` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/v1/bookings/check-price` | ✅ | ✅ | ✅ | ✅ |
| `POST /api/v1/payments/process-and-book` | ❌ | ✅ | ✅ | ✅ |
| `GET /api/v1/bookings/my-trips` | ❌ | ✅ | ✅ | ✅ |
| `POST /api/v1/favorites/toggle/:id` | ❌ | ✅ | ✅ | ✅ |
| `POST /api/v1/auth/become-host` | ❌ | ✅ | ✅ | ✅ |
| `POST /api/v1/listings` (Create Listing) | ❌ | ❌ | ✅ | ✅ |
| `PATCH /api/v1/listings/:id` (Edit Rates/Photos)| ❌ | ❌ | ✅ (Owned) | ✅ |
| `GET /api/v1/bookings/host/reservations` | ❌ | ❌ | ✅ (Owned) | ✅ (All) |
| `GET /api/v1/admin/dashboard-stats` | ❌ | ❌ | ❌ | ✅ |
| `GET /api/v1/admin/users` | ❌ | ❌ | ❌ | ✅ |
| `PATCH /api/v1/admin/users/:id/role` | ❌ | ❌ | ❌ | ✅ |
| `GET /api/v1/admin/bookings` | ❌ | ❌ | ❌ | ✅ |
| `PATCH /api/v1/admin/listings/:id/toggle-publish`| ❌ | ❌ | ❌ | ✅ |

---

## 7. Verification and Deployment Guide

### 7.1 Production URLs
- **Vercel Frontend**: [https://airbnb.sayan.codes](https://airbnb.sayan.codes) (or [https://airbnb-nine-steel.vercel.app](https://airbnb-nine-steel.vercel.app))
- **Azure Backend**: [https://airbnb-endxaec2bsd4b9at.westus3-01.azurewebsites.net](https://airbnb-endxaec2bsd4b9at.westus3-01.azurewebsites.net)
- **Health Check**: [https://airbnb-endxaec2bsd4b9at.westus3-01.azurewebsites.net/api/v1/health](https://airbnb-endxaec2bsd4b9at.westus3-01.azurewebsites.net/api/v1/health)

### 7.2 Running Locally

```bash
# 1. Start the Backend API Engine
cd backend
npm install
npm run dev # Starts server on http://localhost:8000

# 2. Start the Frontend Application
cd ../frontend
npm install
npm run dev # Starts Vite dev server on http://localhost:5173
```

### 7.3 Demo Login Credentials
| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@airbnb.com` | `Password123!` | Full Admin Panel, User Management, Global Bookings |
| **Super Host** | `aarav.host@airbnb.com` | `Password123!` | Host Dashboard, Inventory Management, Payouts |
| **Verified Guest**| `rohan.guest@airbnb.com`| `Password123!` | Stays, Search, Wishlists, Trip Bookings |
