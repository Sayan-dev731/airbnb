# Airbnb Production Architecture & Scaling Strategy

This document outlines the high-level architecture, scalability blueprint, and system design for a production-scale vacation rental marketplace (Airbnb Clone) capable of handling millions of daily active users, listings, search queries, and real-time reservations.

---

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    subgraph "Clients Layer"
        Desktop["Web App (Desktop / React / Next.js)"]
        Mobile["Mobile Web / iOS / Android Apps"]
    end

    subgraph "Edge & Content Delivery Layer"
        Cloudflare["Cloudflare CDN & DDoS Protection (Edge Caching / SSL)"]
        CloudinaryCDN["Cloudinary CDN (Optimized Media / WebP / AVIF)"]
    end

    subgraph "API Gateway & Traffic Management Layer"
        ALB["AWS Application Load Balancer / NGINX Ingress"]
        APIGateway["API Gateway / Rate Limiter (Token Bucket / Redis)"]
    end

    subgraph "Application Core (Modular Monolith / Microservices)"
        AuthService["Authentication & RBAC Service (JWT / Sessions)"]
        ListingService["Listings & Hotel Inventory Service"]
        SearchService["Search & Geolocation Engine"]
        BookingService["Booking & Pricing Engine (Distributed Locks)"]
        ReviewService["Reviews & Ratings Aggregate Service"]
        MediaService["Media & Photo Tour Upload Pipeline"]
        NotificationService["Notification & Email Dispatcher (Nodemailer / SES)"]
    end

    subgraph "Search & Real-time Caching Layer"
        RedisCache["Redis Cluster (Session, Price Cache, Availability Bitmaps)"]
        Elasticsearch["Elasticsearch / OpenSearch (Geo-queries, Full-text Search)"]
    end

    subgraph "Asynchronous Messaging & Event Streaming"
        Kafka["Apache Kafka / RabbitMQ (Event Bus: BookingConfirmed, UserRegistered)"]
    end

    subgraph "Primary Persistence & Storage Layer"
        MongoDBPrimary["Primary MongoDB Database (Replica Set + Sharding)"]
        MongoDBSecondaries["Read Replicas (Geo-Distributed for Read Heavy Traffic)"]
        S3Storage["AWS S3 / Cloudinary (Original Master Image Storage)"]
    end

    Desktop --> Cloudflare
    Mobile --> Cloudflare
    Cloudflare --> ALB
    ALB --> APIGateway

    APIGateway --> AuthService
    APIGateway --> ListingService
    APIGateway --> SearchService
    APIGateway --> BookingService
    APIGateway --> ReviewService
    APIGateway --> MediaService

    AuthService --> RedisCache
    AuthService --> MongoDBPrimary

    ListingService --> RedisCache
    ListingService --> MongoDBPrimary
    ListingService --> Elasticsearch

    SearchService --> Elasticsearch
    SearchService --> RedisCache

    BookingService --> RedisCache
    BookingService --> MongoDBPrimary
    BookingService --> Kafka

    ReviewService --> MongoDBPrimary
    ReviewService --> Kafka

    MediaService --> S3Storage
    MediaService --> CloudinaryCDN

    Kafka --> NotificationService
    Kafka --> ReviewService
    Kafka --> Elasticsearch

    MongoDBPrimary --> MongoDBSecondaries
```

---

## 2. Core Architectural Pillars

### A. Frontend Layer
- **Architecture**: Next.js / React Single Page App (SPA) with Server-Side Rendering (SSR) for SEO-critical listing pages.
- **State Management & Caching**: TanStack Query (React Query) for server state deduplication, optimistic UI updates, and intelligent stale-while-revalidate caching.
- **Asset Optimization**: High-DPI responsive picture tags with automated WebP/AVIF format switching and layout shift (CLS) prevention.

### B. Backend Services & Modular Separation
- **Role-Based Access Control (RBAC)**:
  - **Admin**: System governance, listing moderation, fraud detection, metric aggregations.
  - **Host**: Inventory management, multi-room photo tour organization, blackout calendar, pricing rules.
  - **User / Guest**: Discovery, reservations, payment, reviews, wishlist.
- **Resilience**: Asynchronous non-blocking I/O with Express, circuit breakers for external services (Cloudinary, Nodemailer), and standardized error structures (`ApiError`, `ApiResponse`).

### C. Search & Geolocation Strategy
- **Search Cluster**: Elasticsearch / OpenSearch indexing listing coordinates (`geo_point`), amenities, dates, and price intervals.
- **Availability Bitmaps**: Redis bitmaps for date availability to check calendar ranges in $O(1)$ operations before database querying.

### D. Booking Concurrency & Double-Booking Prevention
- **Distributed Locking**: Redlock algorithm / Atomic MongoDB compound queries on `(listing, checkInDate, checkOutDate, bookingStatus)` ensuring zero double-booking collisions under high concurrency.
- **Transparent Fee Calculator**: Strict server-side formula enforcing base price, discounts, cleaning fees, service fees, and local taxes.

### E. Media & Photo Tour Pipeline
- **Upload Flow**: Client $\rightarrow$ Secure Multer stream $\rightarrow$ Cloudinary cloud bucket $\rightarrow$ Auto-format/quality compression $\rightarrow$ Multi-room gallery taxonomy (`Living room`, `Bedroom`, `Bathroom`, `Pool`).
- **Delivery**: Global CDN with dynamic transformations (`w_1600`, `q_auto`, `f_auto`).

### F. Scaling & Deployment Strategy
- **Containerization**: Docker multi-stage builds deployed on Kubernetes (EKS/GKE) with Horizontal Pod Autoscaler (HPA) targeting 70% CPU/Memory threshold.
- **Database Scaling**:
  - MongoDB Sharded Cluster split by `listingId` hash.
  - Secondary Read Replicas handling 95% of read traffic (search and browse queries).
- **Security & Compliance**:
  - Helmet security headers, CORS origin whitelisting, HTTP-only SameSite cookies, JWT HMAC-SHA256 signature verification, Bcrypt password hashing (salt 10).
