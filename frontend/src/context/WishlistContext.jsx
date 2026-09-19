import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { favoriteAPI } from "../api/favorite.api";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { user, openLogin } = useAuth();
  const { addToast } = useToast();
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Load user's favorites from backend when logged in
  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }
    try {
      setLoading(true);
      const res = await favoriteAPI.getMyFavorites();
      const raw = res.data;
      const list = Array.isArray(raw) ? raw : (raw?.favorites || []);
      setFavorites(list);
      setFavoriteIds(new Set(list.map((item) => (item.listing?._id || item.listing || item._id))));
    } catch (err) {
      console.warn("Could not fetch favorites:", err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const isFavorite = useCallback(
    (listingId) => {
      if (!listingId) return false;
      return favoriteIds.has(listingId.toString());
    },
    [favoriteIds]
  );

  const toggleFavorite = async (listing, e) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }

    if (!user) {
      addToast("Please sign in to save stays to your wishlist", "info");
      openLogin();
      return false;
    }

    const listingId = listing._id || listing;
    const strId = listingId.toString();
    const isCurrentlySaved = favoriteIds.has(strId);

    // Optimistic UI Update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlySaved) {
        next.delete(strId);
      } else {
        next.add(strId);
      }
      return next;
    });

    try {
      await favoriteAPI.toggleFavorite(strId);
      if (isCurrentlySaved) {
        addToast("Removed from Wishlists", "info");
      } else {
        addToast("Saved to Wishlists ❤️", "success");
      }
      // Refresh list in background
      loadFavorites();
      return !isCurrentlySaved;
    } catch (err) {
      // Rollback on error
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlySaved) {
          next.add(strId);
        } else {
          next.delete(strId);
        }
        return next;
      });
      addToast(err.message || "Failed to update wishlist", "error");
      return isCurrentlySaved;
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        favorites,
        favoriteIds,
        isFavorite,
        toggleFavorite,
        loadFavorites,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
