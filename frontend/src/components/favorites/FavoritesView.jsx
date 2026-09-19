import React from "react";
import { Heart } from "lucide-react";
import { useWishlist } from "../../context/WishlistContext";
import { ListingCard } from "../listings/ListingCard";

export const FavoritesView = ({ onSelectListing }) => {
  const { favorites, loading } = useWishlist();

  if (loading) {
    return (
      <div className="container-airbnb" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 24 }}>Wishlists</h1>
        <div className="listing-grid-responsive">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ paddingTop: "95%", borderRadius: "var(--radius-card)" }} />
          ))}
        </div>
      </div>
    );
  }

  const listings = favorites.map((f) => f.listing || f).filter(Boolean);

  return (
    <div className="container-airbnb" style={{ paddingTop: 40, paddingBottom: 60, minHeight: "70vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <Heart size={30} fill="var(--airbnb-accent)" color="var(--airbnb-accent)" />
        <h1 style={{ fontSize: 30, fontWeight: 800 }}>Wishlists</h1>
      </div>

      {listings.length === 0 ? (
        <div
          style={{
            border: "1px dashed var(--airbnb-border)",
            borderRadius: "var(--radius-card)",
            padding: "60px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Your wishlist is empty</div>
          <p style={{ fontSize: 15, color: "var(--airbnb-muted)", maxWidth: 420, margin: "0 auto" }}>
            As you search, tap the heart icon to save your favourite stays and experiences.
          </p>
        </div>
      ) : (
        <div className="listing-grid-responsive">
          {listings.map((listing) => (
            <ListingCard
              key={listing._id}
              listing={listing}
              onSelect={onSelectListing}
            />
          ))}
        </div>
      )}
    </div>
  );
};
