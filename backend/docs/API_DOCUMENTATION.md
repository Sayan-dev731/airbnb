# Airbnb Clone - REST API Specification

**Base URL**: `http://localhost:8000/api/v1`  
**Authentication**: Bearer Token in `Authorization` header (`Bearer <token>`) or `accessToken` HTTP-only cookie.

---

## 1. Authentication & User Management (`/auth`)

### Register User
- **Method**: `POST`
- **Path**: `/auth/register`
- **Access**: Public
- **Content-Type**: `multipart/form-data` or `application/json`
- **Request Body**:
  ```json
  {
    "name": "Rohan Verma",
    "email": "rohan.guest@airbnb.com",
    "password": "Password123!",
    "role": "user",
    "phone": "+91 9988776655",
    "bio": "Travel enthusiast"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "statusCode": 201,
    "data": {
      "user": {
        "_id": "660c1d...",
        "name": "Rohan Verma",
        "email": "rohan.guest@airbnb.com",
        "role": "user",
        "avatar": { "url": "https://...", "publicId": "" },
        "isEmailVerified": false
      },
      "accessToken": "eyJhbGci...",
      "refreshToken": "eyJhbGci..."
    },
    "message": "User registered successfully. Please check your email for the verification link/code.",
    "success": true
  }
  ```

### Verify Email
- **Method**: `POST`
- **Path**: `/auth/verify-email`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "token": "7a8b9c...",
    "otp": "481920"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "data": { "isEmailVerified": true },
    "message": "Email verified successfully",
    "success": true
  }
  ```

### Login User
- **Method**: `POST`
- **Path**: `/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "aarav.host@airbnb.com",
    "password": "Password123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "data": {
      "user": {
        "_id": "660c1...",
        "name": "Aarav Sharma",
        "email": "aarav.host@airbnb.com",
        "role": "host",
        "isSuperHost": true
      },
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG..."
    },
    "message": "User logged in successfully",
    "success": true
  }
  ```

### Refresh Token
- **Method**: `POST`
- **Path**: `/auth/refresh-token`
- **Access**: Public (via cookie or body)
- **Request Body**: `{ "refreshToken": "eyJhb..." }`
- **Response (200 OK)**: Returns new `accessToken` and `refreshToken`.

### Current User Profile
- **Method**: `GET`
- **Path**: `/auth/me`
- **Access**: Protected (JWT required)

### Become a Host
- **Method**: `POST`
- **Path**: `/auth/become-host`
- **Access**: Protected (Switches user role to `host`)

---

## 2. Listings Engine (`/listings`)

### Get All Listings (Search & Filters)
- **Method**: `GET`
- **Path**: `/listings`
- **Access**: Public
- **Query Parameters**:
  - `search`: Keyword for title, description, or neighborhood.
  - `city`: e.g. `Pune`, `New Delhi`.
  - `category`: `Trending`, `Iconic cities`, `Amazing pools`, `Beachfront`, `Luxe`, `Cabins`.
  - `propertyType`: `Entire rental unit`, `Entire villa`, `Entire apartment`.
  - `minPrice`, `maxPrice`: Numeric filter.
  - `guests`, `bedrooms`, `bathrooms`: Minimum capacity.
  - `amenities`: Comma-separated (e.g. `Wifi,Air conditioning,Pool`).
  - `isGuestFavorite`: `true` (rating $\ge$ 4.8 & reviews $\ge$ 2).
  - `checkInDate`, `checkOutDate`: Filters out conflicting bookings.
  - `sortBy`: `newest`, `price_asc`, `price_desc`, `rating`, `reviews`.
  - `page`, `limit`: Pagination controls.
- **Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "data": {
      "listings": [
        {
          "_id": "660c...",
          "title": "Flat in Viman Nagar",
          "propertyType": "Entire apartment",
          "location": { "city": "Pune", "state": "Maharashtra" },
          "pricing": { "basePrice": 5000, "discountPercentage": 10 },
          "discountedPrice": 4500,
          "coverPhoto": "https://...",
          "ratingsSummary": { "averageRating": 4.86, "totalReviews": 24 },
          "isGuestFavorite": true
        }
      ],
      "pagination": { "total": 5, "page": 1, "limit": 20, "totalPages": 1 }
    },
    "message": "Listings fetched successfully",
    "success": true
  }
  ```

### Get Listing Details
- **Method**: `GET`
- **Path**: `/listings/:listingId`
- **Access**: Public
- **Response (200 OK)**: Returns full property object including complete multi-room photo tour array, host profile, house rules, and amenities.

### Create Listing (Hotels / Properties)
- **Method**: `POST`
- **Path**: `/listings`
- **Access**: Protected (`host` or `admin` role)
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `title`, `description`, `propertyType`, `categories`
  - `address`, `city`, `state`, `country`, `zipCode`, `neighborhood`
  - `basePrice`, `discountPercentage`, `cleaningFee`, `serviceFeePercent`
  - `guests`, `bedrooms`, `beds`, `bathrooms`
  - `amenities` (array or comma-separated)
  - `photos` (file uploads up to 25 photos)

### Update Listing
- **Method**: `PATCH`
- **Path**: `/listings/:listingId`
- **Access**: Protected (Host owner or Admin)

### Delete Listing
- **Method**: `DELETE`
- **Path**: `/listings/:listingId`
- **Access**: Protected (Host owner or Admin)

### Upload Additional Photos
- **Method**: `POST`
- **Path**: `/listings/:listingId/photos`
- **Access**: Protected (Host owner or Admin)

---

## 3. Bookings & Reservations (`/bookings`)

### Check Price & Instant Availability
- **Method**: `POST`
- **Path**: `/bookings/check-price`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "listingId": "660c...",
    "checkInDate": "2026-09-25",
    "checkOutDate": "2026-09-28",
    "guests": 2
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "statusCode": 200,
    "data": {
      "isAvailable": true,
      "pricing": {
        "nightsCount": 3,
        "basePricePerNight": 5000,
        "baseTotal": 15000,
        "discountAmount": 1500,
        "cleaningFee": 500,
        "serviceFee": 1620,
        "taxes": 2812,
        "grandTotal": 18432,
        "currency": "INR"
      }
    },
    "message": "Dates are available for booking",
    "success": true
  }
  ```

### Create Reservation
- **Method**: `POST`
- **Path**: `/bookings`
- **Access**: Protected (Authenticated user)
- **Request Body**:
  ```json
  {
    "listingId": "660c...",
    "checkInDate": "2026-09-25",
    "checkOutDate": "2026-09-28",
    "adults": 2,
    "children": 0,
    "specialRequests": "Early check-in request"
  }
  ```
- **Response (201 Created)**: Confirmed booking with receipt and email dispatch.

### Get My Trips
- **Method**: `GET`
- **Path**: `/bookings/my-trips`
- **Access**: Protected (Logged-in guest)

### Host Reservations
- **Method**: `GET`
- **Path**: `/bookings/host/reservations`
- **Access**: Protected (Host or Admin)

### Cancel Reservation
- **Method**: `PATCH`
- **Path**: `/bookings/:bookingId/cancel`
- **Access**: Protected (Guest, Host, or Admin)

---

## 4. Reviews & Ratings (`/reviews`)

### Submit Review
- **Method**: `POST`
- **Path**: `/reviews`
- **Access**: Protected
- **Request Body**:
  ```json
  {
    "listingId": "660c...",
    "rating": 5,
    "comment": "Incredible place with breathtaking views!",
    "cleanliness": 5,
    "accuracy": 5,
    "checkIn": 5,
    "communication": 5,
    "location": 5,
    "value": 5
  }
  ```
- **Response (201 Created)**: Automatically triggers aggregate recalculation on Listing model.

### Get Listing Reviews
- **Method**: `GET`
- **Path**: `/reviews/listing/:listingId`
- **Access**: Public

### Host Reply to Review
- **Method**: `POST`
- **Path**: `/reviews/:reviewId/reply`
- **Access**: Protected (Host of property or Admin)

---

## 5. Wishlist & Favorites (`/favorites`)

### Toggle Favorite
- **Method**: `POST`
- **Path**: `/favorites/toggle/:listingId`
- **Access**: Protected

### Get Wishlist
- **Method**: `GET`
- **Path**: `/favorites`
- **Access**: Protected

---

## 6. Admin Governance (`/admin`)

*(All routes require `admin` role)*

- `GET /admin/dashboard-stats` - Total users, hosts, listings, bookings, gross volume, net fees.
- `GET /admin/users` - Global user registry with role filter and search.
- `PATCH /admin/users/:userId/role` - Update user role, superhost badge, host verification.
- `PATCH /admin/listings/:listingId/toggle-publish` - Publish/unpublish or ban listing.
- `PATCH /admin/listings/:listingId/toggle-feature` - Toggle homepage feature highlight.

---

## 7. Health Check (`/health`)

- **Method**: `GET`
- **Path**: `/health`
- **Access**: Public
- **Response (200 OK)**: Server uptime, status, and API health metrics.
