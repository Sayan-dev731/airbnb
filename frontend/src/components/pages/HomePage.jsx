import React, { useState, useEffect, useCallback, useMemo } from "react";
import { listingAPI } from "../../api/listing.api";
import { CategoriesBar } from "../../components/common/CategoriesBar";
import { ListingGrid } from "../../components/listings/ListingGrid";
import { ListingMap } from "../../components/listings/ListingMap";
import { SectionCarousel } from "../../components/listings/SectionCarousel";
import { FloatingMapToggle } from "../../components/listings/FloatingMapToggle";
import { FilterModal } from "../../components/common/FilterModal";
import { useSearch } from "../../context/SearchContext";

export const HomePage = ({ onSelectListing }) => {
  const {
    destination,
    checkInDate,
    checkOutDate,
    guests,
    selectedCategory,
    filters,
    setDestination,
  } = useSearch();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [hoveredListingId, setHoveredListingId] = useState(null);

  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        limit: 50,
        sortBy: filters.sortBy || "newest",
      };

      if (destination) {
        params.search = destination;
      }
      if (selectedCategory && selectedCategory !== "Trending") {
        params.category = selectedCategory;
      }
      if (filters.minPrice) {
        params.minPrice = filters.minPrice;
      }
      if (filters.maxPrice) {
        params.maxPrice = filters.maxPrice;
      }
      if (filters.propertyType) {
        params.propertyType = filters.propertyType;
      }
      if (filters.bedrooms) {
        params.bedrooms = filters.bedrooms;
      }
      if (filters.bathrooms) {
        params.bathrooms = filters.bathrooms;
      }
      if (filters.amenities && filters.amenities.length > 0) {
        params.amenities = filters.amenities.join(",");
      }
      if (filters.isGuestFavorite) {
        params.isGuestFavorite = true;
      }
      if (checkInDate && checkOutDate) {
        params.checkInDate = checkInDate;
        params.checkOutDate = checkOutDate;
      }
      if (guests.adults + guests.children > 1) {
        params.guests = guests.adults + guests.children;
      }

      const res = await listingAPI.getListings(params);
      setListings(res.data?.listings || []);
    } catch (err) {
      console.warn("Could not fetch listings:", err.message);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [destination, selectedCategory, filters, checkInDate, checkOutDate, guests]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Group listings by city for carousels when on default discovery view
  const isDefaultDiscovery = !destination && selectedCategory === "Trending" && !filters.propertyType && !filters.minPrice && !filters.maxPrice;

  const puneListings = useMemo(() => {
    return listings.filter((l) => l.location?.city?.toLowerCase().includes("pune"));
  }, [listings]);

  const delhiListings = useMemo(() => {
    return listings.filter((l) => l.location?.city?.toLowerCase().includes("delhi"));
  }, [listings]);

  const goaListings = useMemo(() => {
    return listings.filter((l) => l.location?.city?.toLowerCase().includes("goa"));
  }, [listings]);

  const mumbaiListings = useMemo(() => {
    return listings.filter((l) => l.location?.city?.toLowerCase().includes("mumbai"));
  }, [listings]);

  return (
    <div style={{ position: "relative", minHeight: "80vh" }}>
      {/* Categories Carousel */}
      <CategoriesBar />

      {/* Main Content Area */}
      <div className="container-airbnb" style={{ paddingTop: 28, paddingBottom: 80 }}>
        {isMapOpen ? (
          /* Split View Layout: Listings Left, Map Right */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr 1fr",
              gap: 28,
              alignItems: "start",
            }}
            className="home-split-view"
          >
            <div>
              <div style={{ fontSize: 14, color: "var(--airbnb-muted)", marginBottom: 16, fontWeight: 500 }}>
                Over {listings.length} places in {destination || selectedCategory}
              </div>
              <ListingGrid
                listings={listings}
                loading={loading}
                onSelectListing={onSelectListing}
                onHoverListing={setHoveredListingId}
                hoveredListingId={hoveredListingId}
                isSplitView={true}
              />
            </div>

            {/* Sticky Interactive Map */}
            <div
              style={{
                position: "sticky",
                top: 170,
                height: "calc(100vh - 200px)",
                minHeight: 500,
              }}
            >
              <ListingMap
                listings={listings}
                hoveredListingId={hoveredListingId}
                onSelectListing={onSelectListing}
                onHoverListing={setHoveredListingId}
              />
            </div>
          </div>
        ) : isDefaultDiscovery && listings.length > 0 ? (
          /* Destination Row Carousels matching airbnb.co.in screenshots 4 & 5 */
          <div>
            <SectionCarousel
              title="Homes in Pune City"
              listings={puneListings.length > 0 ? puneListings : listings.slice(0, 7)}
              onSelectListing={onSelectListing}
              onSeeAll={() => setDestination("Pune")}
            />

            <SectionCarousel
              title="Places to stay in New Delhi"
              listings={delhiListings.length > 0 ? delhiListings : listings.slice(1, 8)}
              onSelectListing={onSelectListing}
              onSeeAll={() => setDestination("Delhi")}
            />

            <SectionCarousel
              title="Villas & Stays in Goa"
              listings={goaListings.length > 0 ? goaListings : listings.slice(2, 9)}
              onSelectListing={onSelectListing}
              onSeeAll={() => setDestination("Goa")}
            />

            <SectionCarousel
              title="Apartments in Mumbai"
              listings={mumbaiListings.length > 0 ? mumbaiListings : listings.slice(0, 6)}
              onSelectListing={onSelectListing}
              onSeeAll={() => setDestination("Mumbai")}
            />
          </div>
        ) : (
          /* Full Grid Layout */
          <div>
            <ListingGrid
              listings={listings}
              loading={loading}
              onSelectListing={onSelectListing}
              onHoverListing={setHoveredListingId}
              hoveredListingId={hoveredListingId}
              isSplitView={false}
            />
          </div>
        )}
      </div>

      {/* Floating Map Toggle Button */}
      <FloatingMapToggle
        isMapOpen={isMapOpen}
        onToggle={() => setIsMapOpen(!isMapOpen)}
      />

      {/* Filter Modal */}
      <FilterModal totalResultsCount={listings.length} />

      <style>{`
        @media (max-width: 950px) {
          .home-split-view {
            grid-template-columns: 1fr !important;
          }
          .home-split-view > div:last-child {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
