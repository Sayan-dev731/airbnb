/**
 * Format currency amount with symbol and locale
 */
export const formatCurrency = (amount, currency = "INR") => {
  if (amount === undefined || amount === null || isNaN(amount)) return "₹0";
  
  if (currency === "INR") {
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
  }
  
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date range for listing cards (e.g. "12–17 Oct")
 */
export const formatDateRange = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) {
    // Generate a pleasant fallback upcoming date range
    const d1 = new Date();
    d1.setDate(d1.getDate() + 14);
    const d2 = new Date(d1);
    d2.setDate(d2.getDate() + 5);
    const m1 = d1.toLocaleString("en-US", { month: "short" });
    const m2 = d2.toLocaleString("en-US", { month: "short" });
    if (m1 === m2) {
      return `${m1} ${d1.getDate()}–${d2.getDate()}`;
    }
    return `${m1} ${d1.getDate()} – ${m2} ${d2.getDate()}`;
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const m1 = start.toLocaleString("en-US", { month: "short" });
  const m2 = end.toLocaleString("en-US", { month: "short" });
  
  if (m1 === m2) {
    return `${m1} ${start.getDate()}–${end.getDate()}`;
  }
  return `${m1} ${start.getDate()} – ${m2} ${end.getDate()}`;
};

/**
 * Format full date for booking cards / receipts (e.g., "14 Oct 2026")
 */
export const formatDateFull = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Calculate difference in days between two dates
 */
export const calculateNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 1;
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
};

/**
 * Format guest string ("2 guests, 1 infant")
 */
export const formatGuestSummary = ({ adults = 1, children = 0, infants = 0, pets = 0 }) => {
  const totalGuests = adults + children;
  let text = `${totalGuests} guest${totalGuests !== 1 ? "s" : ""}`;
  if (infants > 0) {
    text += `, ${infants} infant${infants !== 1 ? "s" : ""}`;
  }
  if (pets > 0) {
    text += `, ${pets} pet${pets !== 1 ? "s" : ""}`;
  }
  return text;
};
