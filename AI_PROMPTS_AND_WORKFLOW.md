# AI-Assisted Engineering Workflow & Prompt Log

This document captures the structured sequence of prompts, agentic workflows, sub-agent skills, and iterative reasoning steps executed during the construction and refinement of the full-stack **Airbnb Clone Application**.

---

## 1. AI-Assisted Architecture & Agentic Workflow Overview

The application was built using modern agentic coding practices, employing specialized subagents and capabilities:
- **Design System Extraction Agent**: Parsed the reference Airbnb design language (color tokens, typography, radii, border styling, animations, and bento grid proportions).
- **Full-Stack Implementation Agent**: Built out backend domain controllers, MongoDB schemas with compound indexing, and front-end React components.
- **Visual Verification & Browser Subagent**: Automated live browser runs, capturing state progression, responsiveness, modal interactions, and keyboard accessibility.
- **Linting, Build & Runtime Validation**: Executed automated verification scripts, node runtime simulations, and Vite production bundle tests.

---

## 2. Chronological Prompt Sequence

### Phase 1: Foundational Architecture & Design System Setup
> **Prompt 1 (Initial Setup)**:
> *"Build the complete frontend and backend for the Airbnb clone website matching `airbnb.co.in` and `airbnb.design.md`. Ensure full compatibility across desktop screen sizes with fluid micro-interactions, authentic typography, HSL-tailored colors, and zero reliance on generic frameworks. Implement the morphing sticky search bar, Category carousel, and responsive listing grid."*

**Agent Actions**:
1. Initialized modular React + Vite frontend and Express + MongoDB backend.
2. Built `index.css` defining complete Airbnb design tokens: `--airbnb-accent`, `--airbnb-ink`, `--airbnb-border`, `--shadow-card`, `--radius-xl`.
3. Created `AirbnbHeader.jsx` with morphing search pill, category filter carousel, and interactive user dropdown.

---

### Phase 2: Listing Page (PDP), Photo Tour & Lightbox
> **Prompt 2 (Property Page, Photo Tour & Lightbox)**:
> *"Recreate the Airbnb property listing page (PDP) exactly as in the reference. Implement the 5-photo bento grid, sticky booking widget, dual-month calendar, guest favorite 5.0 laurel banner, reviews breakdown, and Leaflet interactive map. Include the full-screen Photo Tour and Lightbox viewer with keyboard arrow navigation (`←`/`→`/`Escape`), counter, and wishlist hearting."*

**Agent Actions**:
1. Built `ListingDetailPage.jsx`, `PDPHeader.jsx`, `PDPGallery.jsx`, `PDPOverview.jsx`, `PDPCalendarSection.jsx`, and `PDPGuestFavouriteBanner.jsx`.
2. Created `PhotoGalleryModal.jsx` handling both full-screen photo browsing and single-photo lightbox viewer with `window.addEventListener('keydown')` for arrow and escape keys.
3. Built `PDPBookingCard.jsx` with real-time multi-night price calculation and cancellation policies.

---

### Phase 3: RBAC, Email Verification Gatekeeper & Admin Panel
> **Prompt 3 (RBAC, Verification & Admin Panel)**:
> *"Add a mandatory email verification popup that prevents unverified accounts from browsing or booking until verified via 6-digit OTP. Build a dedicated Admin Panel (`/admin`) for platform metrics, user management with role switching (`user` / `host` / `admin`), listing moderation, and platform bookings log. Ensure regular users must apply via 'Become a Host' before accessing host tools."*

**Agent Actions**:
1. Built `EmailVerificationModal.jsx` locking interactions until OTP verification is completed.
2. Implemented `BecomeHostModal.jsx` handling host onboarding agreements and role elevation.
3. Built `AdminDashboard.jsx` providing complete administrative governance (users table, listing publish toggles, and platform gross volume).

---

### Phase 4: Host Inventory, Device Photo Uploads & Payout Calculations
> **Prompt 4 (Host Inventory & File Uploads)**:
> *"In the Host panel, allow hosts to manage property inventory, rates, and guest bookings per property. Support uploading photos directly from the local device via drag-and-drop and file picker, as well as pasting image URLs. Ensure total payouts and individual booking payouts display correctly."*

**Agent Actions**:
1. Implemented `ListingInventoryModal.jsx` featuring tabs for Guest Bookings, Inventory & Rates, and Photo Gallery.
2. Added `<input type="file" multiple accept="image/*" />` with `FileReader.readAsDataURL` to support local device image uploads without third-party dependencies.
3. Fixed payout mapping across `HostDashboard.jsx` and `ListingInventoryModal.jsx` to parse `pricingBreakdown.grandTotal`.

---

### Phase 5: Multi-Night Checkout Pricing & Wishlist Sync
> **Prompt 5 (Checkout Multi-Night & Wishlist Fix)**:
> *"In the user panel, bookings were showing ₹0 or 1-night prices during checkout even when 11 nights were selected. Fix the checkout pricing calculation so all nights, fees, weekly discounts, and GST taxes update dynamically. Also resolve the `Cannot read properties of undefined (reading 'collectionName')` error on wishlist toggling."*

**Agent Actions**:
1. Standardized backend pricing calculation in `booking.controller.js` and `payment.controller.js` to return complete aliases (`nightsCount`, `basePricePerNight`, `baseTotal`, `discountAmount`, `grandTotal`).
2. Updated `CheckoutModal.jsx` to dynamically calculate selected nights using `calculateNights(checkInDate, checkOutDate)` and display accurate breakdowns.
3. Guarded `req.body?.collectionName` in `favorite.controller.js` and passed `{ collectionName: "My Wishlist" }` from `favorite.api.js`.
4. Verified end-to-end via automated node test scripts and production Vite build.

---

## 3. Skills and Tool Configurations

The following built-in and specialized skills were leveraged:
- **`modern-web-guidance`**: Modern CSS standards, backdrop filters, CSS container queries, and focus accessibility.
- **`browser_subagent`**: Visual fidelity auditing, screenshot recording, and interactive modal testing.
- **`run_command`**: Background daemon management, API endpoint testing, and build validation.
- **`replace_file_content` / `multi_replace_file_content`**: High-precision code modifications.
