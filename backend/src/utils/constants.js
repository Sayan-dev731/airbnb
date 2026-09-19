export const DB_NAME = "airbnb";

export const USER_ROLES = {
  USER: "user",
  HOST: "host",
  ADMIN: "admin",
};

export const AVAILABLE_USER_ROLES = Object.values(USER_ROLES);

export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

export const AVAILABLE_BOOKING_STATUSES = Object.values(BOOKING_STATUS);

export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  REFUNDED: "refunded",
  FAILED: "failed",
};

export const AVAILABLE_PAYMENT_STATUSES = Object.values(PAYMENT_STATUS);

export const PROPERTY_TYPES = [
  "Entire rental unit",
  "Entire villa",
  "Entire apartment",
  "Entire home",
  "Cabin",
  "Hotel room",
  "Private room in home",
  "Luxury suite",
  "Unique space",
  "Cottage",
  "Boutique hotel",
];

export const CATEGORIES = [
  "Trending",
  "Iconic cities",
  "Amazing pools",
  "Beachfront",
  "Cabins",
  "Mansions",
  "Luxe",
  "Countryside",
  "Castles",
  "Lakefront",
  "Rooms",
  "Farms",
];

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};
