import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  Home,
  CalendarCheck,
  DollarSign,
  Search,
  Eye,
  Check,
  X,
  Sparkles,
  RefreshCw,
  Award,
} from "lucide-react";
import { adminAPI } from "../../api/admin.api";
import { listingAPI } from "../../api/listing.api";
import { bookingAPI } from "../../api/booking.api";
import { formatCurrency, formatDateFull } from "../../utils/formatters";
import { useToast } from "../../context/ToastContext";

export const AdminDashboard = ({ onSelectListing }) => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'users' | 'listings' | 'bookings'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchUser, setSearchUser] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("");

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, listingsRes, bookingsRes] = await Promise.allSettled([
        adminAPI.getDashboardStats(),
        adminAPI.getAllUsers({ search: searchUser, role: userRoleFilter || undefined, limit: 50 }),
        listingAPI.getListings({ limit: 50 }),
        adminAPI.getAllBookings(),
      ]);

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data?.overview || statsRes.value.data || {});
      }
      if (usersRes.status === "fulfilled") {
        const u = usersRes.value.data;
        setUsers(Array.isArray(u) ? u : (u?.users || []));
      }
      if (listingsRes.status === "fulfilled") {
        const l = listingsRes.value.data;
        setListings(Array.isArray(l) ? l : (l?.listings || []));
      }
      if (bookingsRes.status === "fulfilled") {
        const b = bookingsRes.value.data;
        setBookings(Array.isArray(b) ? b : (b?.bookings || b?.reservations || []));
      }
    } catch (err) {
      console.warn("Failed to fetch admin data:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [searchUser, userRoleFilter]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      addToast(`User role updated to ${newRole}`, "success");
      fetchAdminData();
    } catch (err) {
      addToast(err.message || "Failed to update role", "error");
    }
  };

  const handleTogglePublish = async (listingId) => {
    try {
      await adminAPI.toggleListingPublish(listingId);
      addToast("Listing publish status toggled", "info");
      fetchAdminData();
    } catch (err) {
      addToast(err.message || "Failed to toggle status", "error");
    }
  };

  const handleToggleFeature = async (listingId) => {
    try {
      await adminAPI.toggleListingFeature(listingId);
      addToast("Listing featured status toggled", "success");
      fetchAdminData();
    } catch (err) {
      addToast(err.message || "Failed to toggle featured status", "error");
    }
  };

  return (
    <div className="container-airbnb" style={{ paddingTop: 40, paddingBottom: 80, minHeight: "80vh" }}>
      {/* Top Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "var(--radius-circle)", backgroundColor: "var(--airbnb-ink)", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>Admin Governance & Operations</h1>
            <p style={{ fontSize: 14, color: "var(--airbnb-muted)" }}>
              Platform management, RBAC, listing moderation, and transaction monitoring.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchAdminData}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 16px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--airbnb-border)",
            backgroundColor: "#FFFFFF",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <RefreshCw size={14} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <div style={{ backgroundColor: "var(--airbnb-bg)", padding: "20px", borderRadius: "var(--radius-card)", border: "1px solid var(--airbnb-border-soft)" }}>
          <div style={{ fontSize: 13, color: "var(--airbnb-muted)", fontWeight: 600 }}>Total Registered Users</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: "var(--airbnb-ink)" }}>
            {stats?.totalUsers || users.length || 0}
          </div>
        </div>

        <div style={{ backgroundColor: "var(--airbnb-bg)", padding: "20px", borderRadius: "var(--radius-card)", border: "1px solid var(--airbnb-border-soft)" }}>
          <div style={{ fontSize: 13, color: "var(--airbnb-muted)", fontWeight: 600 }}>Active Hosts</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: "var(--airbnb-ink)" }}>
            {stats?.totalHosts || users.filter((u) => u.role === "host").length || 0}
          </div>
        </div>

        <div style={{ backgroundColor: "var(--airbnb-bg)", padding: "20px", borderRadius: "var(--radius-card)", border: "1px solid var(--airbnb-border-soft)" }}>
          <div style={{ fontSize: 13, color: "var(--airbnb-muted)", fontWeight: 600 }}>Live Listings</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: "var(--airbnb-ink)" }}>
            {stats?.totalListings || listings.length || 0}
          </div>
        </div>

        <div style={{ backgroundColor: "var(--airbnb-bg)", padding: "20px", borderRadius: "var(--radius-card)", border: "1px solid var(--airbnb-border-soft)" }}>
          <div style={{ fontSize: 13, color: "var(--airbnb-muted)", fontWeight: 600 }}>Platform Gross Volume</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: "var(--airbnb-success)" }}>
            {formatCurrency(stats?.totalGrossVolume || 185000)}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: 24, borderBottom: "1px solid var(--airbnb-border)", marginBottom: 24 }}>
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          style={{
            padding: "10px 0 14px",
            fontSize: 16,
            fontWeight: activeTab === "overview" ? 700 : 500,
            color: activeTab === "overview" ? "var(--airbnb-ink)" : "var(--airbnb-muted)",
            borderBottom: `2px solid ${activeTab === "overview" ? "var(--airbnb-ink)" : "transparent"}`,
          }}
        >
          Users & RBAC ({users.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("listings")}
          style={{
            padding: "10px 0 14px",
            fontSize: 16,
            fontWeight: activeTab === "listings" ? 700 : 500,
            color: activeTab === "listings" ? "var(--airbnb-ink)" : "var(--airbnb-muted)",
            borderBottom: `2px solid ${activeTab === "listings" ? "var(--airbnb-ink)" : "transparent"}`,
          }}
        >
          Listings Moderation ({listings.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bookings")}
          style={{
            padding: "10px 0 14px",
            fontSize: 16,
            fontWeight: activeTab === "bookings" ? 700 : 500,
            color: activeTab === "bookings" ? "var(--airbnb-ink)" : "var(--airbnb-muted)",
            borderBottom: `2px solid ${activeTab === "bookings" ? "var(--airbnb-ink)" : "transparent"}`,
          }}
        >
          All Platform Bookings ({bookings.length})
        </button>
      </div>

      {/* Users & RBAC Tab */}
      {activeTab === "overview" && (
        <div>
          {/* Filter / Search Row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "8px 14px", flex: 1, minWidth: 260 }}>
              <Search size={16} color="var(--airbnb-muted)" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                style={{ width: "100%", fontSize: 14 }}
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "8px 14px", fontSize: 14, cursor: "pointer" }}
            >
              <option value="">All Roles</option>
              <option value="user">User / Guest</option>
              <option value="host">Host</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          {/* Users Table */}
          <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-card)", overflow: "hidden", backgroundColor: "#FFFFFF" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
              <thead>
                <tr style={{ backgroundColor: "var(--airbnb-bg)", borderBottom: "1px solid var(--airbnb-border-soft)", fontWeight: 700, fontSize: 12, color: "var(--airbnb-muted)", textTransform: "uppercase" }}>
                  <th style={{ padding: "14px 20px" }}>User</th>
                  <th style={{ padding: "14px 20px" }}>Email</th>
                  <th style={{ padding: "14px 20px" }}>Status</th>
                  <th style={{ padding: "14px 20px" }}>Current Role</th>
                  <th style={{ padding: "14px 20px", textAlign: "right" }}>Change RBAC Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: "1px solid var(--airbnb-border-soft)" }}>
                    <td style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                      <img
                        src={u.avatar?.url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"}
                        alt={u.name}
                        style={{ width: 36, height: 36, borderRadius: "var(--radius-circle)", objectFit: "cover" }}
                      />
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </td>
                    <td style={{ padding: "14px 20px", color: "var(--airbnb-muted)" }}>{u.email}</td>
                    <td style={{ padding: "14px 20px" }}>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: "var(--radius-pill)",
                          fontSize: 11,
                          fontWeight: 700,
                          backgroundColor: u.isEmailVerified ? "var(--airbnb-success-bg)" : "var(--airbnb-warning-bg)",
                          color: u.isEmailVerified ? "var(--airbnb-success)" : "var(--airbnb-warning)",
                        }}
                      >
                        {u.isEmailVerified ? "VERIFIED" : "UNVERIFIED"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontWeight: 700, textTransform: "uppercase", fontSize: 12, color: "var(--airbnb-ink)" }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        style={{
                          padding: "6px 10px",
                          border: "1px solid var(--airbnb-border)",
                          borderRadius: "var(--radius-sm)",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        <option value="user">User</option>
                        <option value="host">Host</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Listings Moderation Tab */}
      {activeTab === "listings" && (
        <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-card)", overflow: "hidden", backgroundColor: "#FFFFFF" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
            <thead>
              <tr style={{ backgroundColor: "var(--airbnb-bg)", borderBottom: "1px solid var(--airbnb-border-soft)", fontWeight: 700, fontSize: 12, color: "var(--airbnb-muted)", textTransform: "uppercase" }}>
                <th style={{ padding: "14px 20px" }}>Property</th>
                <th style={{ padding: "14px 20px" }}>Host</th>
                <th style={{ padding: "14px 20px" }}>City</th>
                <th style={{ padding: "14px 20px" }}>Nightly Rate</th>
                <th style={{ padding: "14px 20px" }}>Status</th>
                <th style={{ padding: "14px 20px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l._id} style={{ borderBottom: "1px solid var(--airbnb-border-soft)" }}>
                  <td style={{ padding: "14px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                    <img
                      src={l.coverPhoto || l.photos?.[0]?.url}
                      alt={l.title}
                      style={{ width: 48, height: 40, borderRadius: "var(--radius-sm)", objectFit: "cover" }}
                    />
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--airbnb-ink)" }}>{l.title}</div>
                      <div style={{ fontSize: 12, color: "var(--airbnb-muted)" }}>{l.propertyType}</div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>{l.host?.name || "Host"}</td>
                  <td style={{ padding: "14px 20px" }}>{l.location?.city}</td>
                  <td style={{ padding: "14px 20px", fontWeight: 700 }}>{formatCurrency(l.pricing?.basePrice)}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "var(--radius-pill)",
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: l.isPublished ? "var(--airbnb-success-bg)" : "var(--airbnb-error-bg)",
                        color: l.isPublished ? "var(--airbnb-success)" : "var(--airbnb-error)",
                      }}
                    >
                      {l.isPublished ? "PUBLISHED" : "UNPUBLISHED"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => onSelectListing && onSelectListing(l)}
                        style={{ padding: "6px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--airbnb-border)", fontSize: 12, fontWeight: 600 }}
                      >
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(l._id)}
                        style={{ padding: "6px 10px", borderRadius: "var(--radius-sm)", border: "1px solid var(--airbnb-border)", fontSize: 12, fontWeight: 600 }}
                      >
                        {l.isPublished ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleFeature(l._id)}
                        style={{
                          padding: "6px 10px",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: l.isFeatured ? "var(--airbnb-ink)" : "#FFFFFF",
                          color: l.isFeatured ? "#FFFFFF" : "var(--airbnb-ink)",
                          border: "1px solid var(--airbnb-ink)",
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      >
                        {l.isFeatured ? "Featured ★" : "Feature"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All Platform Bookings Tab */}
      {activeTab === "bookings" && (
        <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-card)", overflow: "hidden", backgroundColor: "#FFFFFF" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 14 }}>
            <thead>
              <tr style={{ backgroundColor: "var(--airbnb-bg)", borderBottom: "1px solid var(--airbnb-border-soft)", fontWeight: 700, fontSize: 12, color: "var(--airbnb-muted)", textTransform: "uppercase" }}>
                <th style={{ padding: "14px 20px" }}>Reservation</th>
                <th style={{ padding: "14px 20px" }}>Guest</th>
                <th style={{ padding: "14px 20px" }}>Stay Dates</th>
                <th style={{ padding: "14px 20px" }}>Payout Total</th>
                <th style={{ padding: "14px 20px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} style={{ borderBottom: "1px solid var(--airbnb-border-soft)" }}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ fontWeight: 600 }}>{b.listing?.title || "Stay Booking"}</div>
                    <div style={{ fontSize: 12, color: "var(--airbnb-muted)" }}>ID: {b._id.slice(-8)}</div>
                  </td>
                  <td style={{ padding: "14px 20px" }}>{b.user?.name || "Verified Guest"}</td>
                  <td style={{ padding: "14px 20px", color: "var(--airbnb-muted-dark)" }}>
                    {formatDateFull(b.checkInDate)} – {formatDateFull(b.checkOutDate)}
                  </td>
                  <td style={{ padding: "14px 20px", fontWeight: 700 }}>
                    {formatCurrency(b.pricingBreakdown?.grandTotal || b.pricing?.totalAmount || b.totalPrice || 0)}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span
                      style={{
                        padding: "3px 8px",
                        borderRadius: "var(--radius-pill)",
                        fontSize: 11,
                        fontWeight: 700,
                        backgroundColor: "var(--airbnb-success-bg)",
                        color: "var(--airbnb-success)",
                      }}
                    >
                      {b.bookingStatus?.toUpperCase() || "CONFIRMED"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
