import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { formatCurrency } from "../../utils/formatters";
import { Star } from "lucide-react";

// Recenter map when listings change
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
};

export const ListingMap = ({
  listings = [],
  hoveredListingId,
  onSelectListing,
  onHoverListing,
}) => {
  // Compute default center (e.g. India or first valid listing coordinates)
  const defaultCenter = useMemo(() => {
    const validListing = listings.find(
      (l) => l.location?.coordinates?.lat && l.location?.coordinates?.lng
    );
    if (validListing) {
      return [
        validListing.location.coordinates.lat,
        validListing.location.coordinates.lng,
      ];
    }
    return [15.2993, 74.124]; // Default to Goa coordinates
  }, [listings]);

  // Create custom DivIcon for each listing
  const createPriceIcon = (listing, isHovered) => {
    const price = listing.discountedPrice || listing.pricing?.basePrice || 0;
    const label = formatCurrency(price);

    return L.divIcon({
      className: "custom-leaflet-marker",
      html: `
        <div class="airbnb-price-marker ${isHovered ? "active" : ""}">
          ${label}
        </div>
      `,
      iconSize: [60, 32],
      iconAnchor: [30, 16],
    });
  };

  return (
    <div style={{ width: "100%", height: "100%", minHeight: 450, borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
      <MapContainer
        center={defaultCenter}
        zoom={9}
        scrollWheelZoom={false}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapUpdater center={defaultCenter} zoom={9} />

        {listings.map((listing) => {
          const lat = listing.location?.coordinates?.lat;
          const lng = listing.location?.coordinates?.lng;
          if (!lat || !lng) return null;

          const isHovered = hoveredListingId === listing._id;
          const icon = createPriceIcon(listing, isHovered);

          const photos = listing.photos && listing.photos.length > 0 
            ? listing.photos.map((p) => (typeof p === "string" ? p : p.url))
            : [listing.coverPhoto];

          return (
            <Marker
              key={listing._id}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                mouseover: () => onHoverListing && onHoverListing(listing._id),
                mouseout: () => onHoverListing && onHoverListing(null),
              }}
            >
              <Popup className="airbnb-custom-popup">
                <div
                  onClick={() => onSelectListing && onSelectListing(listing)}
                  style={{ width: 220, cursor: "pointer", display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <img
                    src={photos[0]}
                    alt={listing.title}
                    style={{
                      width: "100%",
                      height: 130,
                      objectFit: "cover",
                      borderRadius: "var(--radius-sm)",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 2 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--airbnb-ink)" }}>
                      {listing.location?.city || listing.title}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 600 }}>
                      <Star size={11} fill="var(--airbnb-ink)" color="var(--airbnb-ink)" />
                      <span>{listing.ratingsSummary?.averageRating ? listing.ratingsSummary.averageRating.toFixed(2) : "4.9"}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--airbnb-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {listing.propertyType}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--airbnb-ink)" }}>
                    {formatCurrency(listing.discountedPrice || listing.pricing?.basePrice)} <span style={{ fontWeight: 400 }}>night</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
