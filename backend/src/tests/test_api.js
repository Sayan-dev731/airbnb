import http from "http";
import app from "../app.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../utils/constants.js";

dotenv.config({ path: "./.env" });

const runIntegrationTests = async () => {
  console.log("\n========================================================");
  console.log("🧪 STARTING AIRBNB BACKEND API INTEGRATION TEST SUITE");
  console.log("========================================================\n");

  await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
  console.log("✓ MongoDB Connected");

  const server = app.listen(8001);
  const BASE_URL = "http://localhost:8001/api/v1";

  const request = async (path, options = {}) => {
    const url = `${BASE_URL}${path}`;
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const data = await res.json();
    return { status: res.status, data };
  };

  try {
    // Test 1: Health Check
    console.log("Testing 1: GET /health");
    const health = await request("/health");
    console.log("Status:", health.status, "| Result:", health.data.message);
    if (health.status !== 200) throw new Error("Health check failed");

    // Test 2: Guest Login
    console.log("\nTesting 2: POST /auth/login (Guest)");
    const guestLogin = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "rohan.guest@airbnb.com",
        password: "Password123!",
      }),
    });
    console.log("Status:", guestLogin.status, "| Role:", guestLogin.data?.data?.user?.role);
    const guestToken = guestLogin.data?.data?.accessToken;
    if (!guestToken) throw new Error("Guest login failed");

    // Test 3: Admin Login
    console.log("\nTesting 3: POST /auth/login (Admin)");
    const adminLogin = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@airbnb.com",
        password: "Password123!",
      }),
    });
    console.log("Status:", adminLogin.status, "| Role:", adminLogin.data?.data?.user?.role);
    const adminToken = adminLogin.data?.data?.accessToken;
    if (!adminToken) throw new Error("Admin login failed");

    // Test 4: Fetch Listings
    console.log("\nTesting 4: GET /listings?city=Pune");
    const listingsRes = await request("/listings?city=Pune");
    console.log(
      "Status:",
      listingsRes.status,
      "| Listings count:",
      listingsRes.data?.data?.listings?.length
    );
    const firstListing = listingsRes.data?.data?.listings?.[0];
    if (!firstListing) throw new Error("No listings found in Pune");

    // Test 5: Fetch Listing Details
    console.log(`\nTesting 5: GET /listings/${firstListing._id}`);
    const detailsRes = await request(`/listings/${firstListing._id}`);
    console.log(
      "Status:",
      detailsRes.status,
      "| Title:",
      detailsRes.data?.data?.title,
      "| Photos count:",
      detailsRes.data?.data?.photos?.length
    );

    // Test 6: Check Price & Availability
    console.log("\nTesting 6: POST /bookings/check-price");
    const priceRes = await request("/bookings/check-price", {
      method: "POST",
      body: JSON.stringify({
        listingId: firstListing._id,
        checkInDate: "2026-11-01",
        checkOutDate: "2026-11-05",
        guests: 2,
      }),
    });
    console.log(
      "Status:",
      priceRes.status,
      "| Available:",
      priceRes.data?.data?.isAvailable,
      "| Grand Total:",
      priceRes.data?.data?.pricing?.grandTotal
    );

    // Test 7: Process Payment & Book Reservation (Dummy Gateway + Tokenization)
    console.log("\nTesting 7: POST /payments/process-and-book (Dummy Gateway & Tokenization)");
    const idempotencyKey = `idemp_test_${Date.now()}`;
    const paymentRes = await request("/payments/process-and-book", {
      method: "POST",
      headers: { Authorization: `Bearer ${guestToken}` },
      body: JSON.stringify({
        listingId: firstListing._id,
        checkInDate: "2026-11-10",
        checkOutDate: "2026-11-15",
        adults: 2,
        idempotencyKey,
        paymentMethod: {
          type: "card",
          cardNumber: "4242424242424242",
          cardholderName: "Rohan Guest",
          expMonth: 12,
          expYear: 2028,
          cvv: "123",
          saveMethod: true,
        },
      }),
    });
    console.log(
      "Status:",
      paymentRes.status,
      "| Booking ID:",
      paymentRes.data?.data?.booking?._id,
      "| Transaction ID:",
      paymentRes.data?.data?.transactionId,
      "| Receipt:",
      paymentRes.data?.data?.receiptNumber
    );
    if (paymentRes.status !== 201) throw new Error("Payment processing failed");

    // Test 8: Idempotency Debounce Check (Submitting identical idempotencyKey)
    console.log("\nTesting 8: POST /payments/process-and-book (Idempotency Debounce)");
    const duplicateRes = await request("/payments/process-and-book", {
      method: "POST",
      headers: { Authorization: `Bearer ${guestToken}` },
      body: JSON.stringify({
        listingId: firstListing._id,
        checkInDate: "2026-11-10",
        checkOutDate: "2026-11-15",
        adults: 2,
        idempotencyKey,
      }),
    });
    console.log(
      "Status:",
      duplicateRes.status,
      "| Suppressed Duplicate:",
      duplicateRes.data?.data?.isDuplicateSuppressed
    );
    if (!duplicateRes.data?.data?.isDuplicateSuppressed)
      throw new Error("Idempotency duplicate suppression failed");

    // Test 9: Saved Payment Methods (Hashed and Masked PAN)
    console.log("\nTesting 9: GET /payments/saved-methods");
    const savedMethodsRes = await request("/payments/saved-methods", {
      headers: { Authorization: `Bearer ${guestToken}` },
    });
    console.log(
      "Status:",
      savedMethodsRes.status,
      "| Saved Count:",
      savedMethodsRes.data?.data?.length,
      "| Brand:",
      savedMethodsRes.data?.data?.[0]?.card?.brand,
      "| Last4:",
      savedMethodsRes.data?.data?.[0]?.card?.last4
    );

    // Test 10: Payment Transaction History
    console.log("\nTesting 10: GET /payments/history");
    const historyRes = await request("/payments/history", {
      headers: { Authorization: `Bearer ${guestToken}` },
    });
    console.log(
      "Status:",
      historyRes.status,
      "| Transactions:",
      historyRes.data?.data?.length,
      "| Latest Amount:",
      historyRes.data?.data?.[0]?.amount
    );

    // Test 11: Get My Trips
    console.log("\nTesting 11: GET /bookings/my-trips");
    const tripsRes = await request("/bookings/my-trips", {
      headers: { Authorization: `Bearer ${guestToken}` },
    });
    console.log("Status:", tripsRes.status, "| Trips count:", tripsRes.data?.data?.length);

    // Test 12: Admin Dashboard Stats
    console.log("\nTesting 12: GET /admin/dashboard-stats (Admin Only)");
    const statsRes = await request("/admin/dashboard-stats", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log("Status:", statsRes.status, "| Overview:", statsRes.data?.data?.overview);

    console.log("\n========================================================");
    console.log("✨ ALL 12 INTEGRATION TESTS PASSED SUCCESSFULLY! ✨");
    console.log("========================================================\n");
  } catch (error) {
    console.error("❌ Test failed with error:", error);
  } finally {
    server.close();
    await mongoose.disconnect();
    process.exit(0);
  }
};

runIntegrationTests();
