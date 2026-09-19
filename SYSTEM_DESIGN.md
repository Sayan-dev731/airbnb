# Airbnb Clone – Production System Design (HLD & LLD)

---

## 1. Executive Summary & Objective
This document details the complete **High-Level Design (HLD)** and **Low-Level Design (LLD)** for a high-concurrency, production-scale vacation-rental marketplace architecture modeled after Airbnb, as well as the concrete software architecture of the implemented full-stack application.

The design is architected to handle:
- **100M+ Monthly Active Users (MAU)** searching properties globally with sub-100ms latency.
- **Millions of real-time listings** with instant availability filtering and geospatial lookups.
- **Zero double-booking guarantee** using distributed locking, atomic database transactions, and idempotent payment processing.
- **Pixel-perfect frontend parity** matching modern design systems, fluid micro-interactions, responsive sticky booking widgets, full-screen Photo Tour, and accessible keyboard-navigated Lightbox viewer.

---

## 2. High-Level Design (HLD) Architecture

```mermaid
flowchart TD
    subgraph Clients["Clients & Edge Network"]
        WebDesktop["Desktop Web (React + Vite)"]
        WebMobile["Mobile Web / PWA"]
        Cloudflare["Cloudflare CDN & Edge Caches\n(Static Assets, Images, Edge SSL, WAF, DDoS)"]
        WebDesktop --> Cloudflare
        WebMobile --> Cloudflare
    end

    subgraph Gateway["API Gateway & Load Balancer Layer"]
        Nginx["NGINX / AWS ALB (Round-Robin & Least-Conn)"]
        APIGateway["Kong / Express Gateway\n- JWT Authentication & RBAC Enforcement\n- Rate Limiting (Token Bucket / Redis)\n- CORS & Security Headers (Helmet)\n- Request Tracing & Correlation IDs"]
        Cloudflare --> Nginx
        Nginx --> APIGateway
    end

    subgraph Services["Core Microservices / Modular Domain Services"]
        AuthService["Auth & RBAC Service\n- User Registration & Email OTP Verification\n- Access/Refresh Tokens (JWT)\n- Role Switching (User / Host / Admin)"]
        ListingService["Listing & Inventory Service\n- Listing CRUD & Moderation\n- Inventory & Capacity Controls\n- Dynamic Nightly Rates & Discounts"]
        BookingService["Booking & Pricing Engine\n- Real-Time Date Collision Verification\n- Multi-Night Rate & GST Tax Engine\n- State Machine (Pending -> Confirmed -> Cancelled)"]
        PaymentService["Payment & Payout Service\n- Idempotent Payment Processing (Debouncing)\n- Transaction Ledger & Receipt Generator\n- Host Payouts & Refund Allocations"]
        SearchService["Search & Discovery Service\n- Geospatial Proximity Matching (GeoJSON)\n- Category & Filter Aggregations\n- ElasticSearch / Vector Similarity"]
        MediaService["Media Ingestion Service\n- Device File Uploads & Local FileReader\n- Cloudinary / S3 Image Pipeline\n- Responsive WebP Transcoding & CDN Delivery"]
        NotificationService["Notification & Comms Service\n- Async Nodemailer SMTP Dispatch\n- Booking Confirmation & Invoice Emails\n- Host Alerts & OTP Delivery"]

        APIGateway --> AuthService
        APIGateway --> ListingService
        APIGateway --> BookingService
        APIGateway --> PaymentService
        APIGateway --> SearchService
        APIGateway --> MediaService
    end

    subgraph AsyncBus["Event-Driven Message Broker (Kafka / Redis Streams)"]
        EventBroker["Kafka Event Bus / Redis PubSub\n- Events: 'booking.created', 'payment.captured', 'listing.updated'"]
        BookingService -.->|Publishes| EventBroker
        PaymentService -.->|Publishes| EventBroker
        ListingService -.->|Publishes| EventBroker
        EventBroker -.->|Consumes| NotificationService
        EventBroker -.->|Consumes| SearchService
    end

    subgraph Storage["Data & Caching Tier"]
        RedisCluster["Redis Cluster\n- Session & Refresh Token Whitelist\n- Rate Limit Buckets\n- Redlock Distributed Locking\n- Fast Search Result Cache (TTL 5m)"]
        MongoDBCluster["MongoDB Replica Set with Sharded Clusters\n- Primary Database (Listings, Bookings, Users, Reviews)\n- Compound Indexes & Geospatial 2dsphere Indexes\n- Write Concern: 'majority', Read Preference: 'nearest'"]
        Elasticsearch["Elasticsearch Cluster\n- Geospatial Point Indexes (lat/lng)\n- Autocomplete & Fuzzy Destination Search\n- Dynamic Facets (Price, Amenities, Rooms)"]
        BlobStorage["Object Storage (Cloudinary / AWS S3)\n- Property Image Galleries & Cover Photos\n- User Avatars & Verification Documents"]

        AuthService --> RedisCluster
        AuthService --> MongoDBCluster
        ListingService --> MongoDBCluster
        ListingService --> RedisCluster
        BookingService --> RedisCluster
        BookingService --> MongoDBCluster
        PaymentService --> MongoDBCluster
        SearchService --> Elasticsearch
        SearchService --> RedisCluster
        MediaService --> BlobStorage
    end
```

---

## 3. Core System Design Pillars

### 3.1 Distributed Concurrency & Zero Double-Booking Strategy
In a high-concurrency booking marketplace, race conditions occur when two guests attempt to book overlapping dates simultaneously.

```mermaid
sequenceDiagram
    autonumber
    actor GuestA as Guest A
    actor GuestB as Guest B
    participant API as Booking API
    participant Redis as Redis Redlock
    participant DB as MongoDB (Bookings Collection)
    participant Payment as Payment Gateway
    participant Mail as Email Worker

    GuestA->>API: POST /bookings (Check-in: Sep 19, Check-out: Sep 30)
    GuestB->>API: POST /bookings (Check-in: Sep 20, Check-out: Sep 25)
    
    API->>Redis: Acquire Lock: `lock:listing:{listingId}` (TTL: 5s)
    Note over API,Redis: Guest A acquires lock first. Guest B waits/fails fast.
    
    API->>DB: Atomic Collision Query:\n`listing: id, bookingStatus: 'confirmed'`, Overlapping check
    DB-->>API: 0 Overlapping records found
    
    API->>Payment: Process idempotent payment
    Payment-->>API: Payment Captured (TxnId, Receipt)
    
    API->>DB: Insert Booking (Status: 'confirmed')
    DB-->>API: Booking Created (ID: 6aae...)
    
    API->>Redis: Release Lock: `lock:listing:{listingId}`
    API->>Mail: Dispatch Async Confirmation Email
    API-->>GuestA: 201 Created: Reservation Confirmed 🎉

    Note over GuestB,API: Guest B acquires lock next:
    API->>DB: Atomic Collision Query
    DB-->>API: 1 Conflicting Booking Found (Guest A)
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

### 3.2 Dynamic Pricing & Tax Calculation Engine
Every listing supports flexible nightly rates, weekly discounts, cleaning fees, platform service fees, and applicable GST/VAT taxes:

$$\text{Nights} = \max\left(1, \left\lceil \frac{|\text{checkOut} - \text{checkIn}|}{1000 \times 60 \times 60 \times 24} \right\rceil\right)$$

$$\text{Base Total} = \text{basePricePerNight} \times \text{Nights}$$

$$\text{Weekly Discount} = \begin{cases} \text{round}\left(\frac{\text{Base Total} \times \text{discountPercentage}}{100}\right), & \text{if Nights} \ge 7 \\ 0, & \text{otherwise} \end{cases}$$

$$\text{Discounted Base} = \text{Base Total} - \text{Weekly Discount}$$

$$\text{Service Fee} = \text{round}(\text{Discounted Base} \times 0.12)$$

$$\text{Taxes (18\% GST)} = \text{round}((\text{Discounted Base} + \text{Service Fee}) \times 0.18)$$

$$\text{Grand Total} = \text{Discounted Base} + \text{Cleaning Fee} + \text{Service Fee} + \text{Taxes}$$

---

### 3.3 Scalability & Sharding Strategy

1. **Database Sharding (MongoDB)**:
   - **Sharding Key for Listings**: `{ "location.city": "hashed", "_id": 1 }` enables high query distribution while allowing localized geographic scatter-gather queries.
   - **Sharding Key for Bookings**: `{ "user": 1, "createdAt": -1 }` ensures fast user trip lookups, paired with secondary indexes on `{ "listing": 1, "bookingStatus": 1, "checkInDate": 1, "checkOutDate": 1 }`.
2. **Read/Write Splitting**:
   - Primary Node handles write mutations (`createBooking`, `processPaymentAndBook`, `createListing`).
   - Secondary Read Replicas serve high-volume read endpoints (`getListings`, `getListingById`, `checkPrice`).
3. **Multi-Layered Caching (Redis + CDN)**:
   - **L1 (Browser / Edge)**: Static assets, images, and fonts cached on Cloudflare edge CDN with `Cache-Control: public, max-age=31536000, immutable`.
   - **L2 (Redis Memory Cache)**: Popular property PDP responses cached with a TTL of 300 seconds; invalidated immediately upon host listing mutation (`updateListing`).
4. **Idempotent Payment Gateway Layer**:
   - Duplicate submissions are intercepted using an `Idempotency-Key` header generated on the client.
   - Idempotency records are cached in MongoDB / Redis to guarantee that rapid double-clicks on "Confirm and Pay" execute only one bank transaction.

---

## 4. Low-Level Design (LLD)

### 4.1 Data Models & Entity Relationships (ERD)

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

### 4.2 Frontend Architecture & State Flow

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

### 4.3 Photo Tour & Lightbox Interactive Mechanics

| View | Trigger | Key Capabilities | Accessibility & Interaction |
| :--- | :--- | :--- | :--- |
| **Listing Showcase** | PDP Initial Load | 5-photo bento grid layout with hover zoom | Click any photo or "Show all photos" |
| **Photo Tour Overlay** | Click "Show all photos" or main photo | Full-screen immersive photo gallery | Displays all property photos in high resolution |
| **Interactive Lightbox** | Click specific photo in gallery | Single-photo focused presentation | Keyboard $\leftarrow$ / $\rightarrow$ arrows loop photos; `Escape` closes modal; swipe/click arrows |

---

## 5. Security, RBAC & API Contract

### 5.1 Role-Based Access Control (RBAC) Matrix

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

## 6. Verification and Deployment Guide

### 6.1 Prerequisites
- Node.js `v18+` or `v20+`
- MongoDB Atlas cluster URI or Local MongoDB instance
- Modern web browser (Chrome, Safari, Firefox, Edge)

### 6.2 Running Locally

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

### 6.3 Demo Login Credentials
| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@airbnb.com` | `Password123!` | Full Admin Panel, User Management, Global Bookings |
| **Super Host** | `aarav.host@airbnb.com` | `Password123!` | Host Dashboard, Inventory Management, Payouts |
| **Verified Guest**| `rohan.guest@airbnb.com`| `Password123!` | Stays, Search, Wishlists, Trip Bookings |
