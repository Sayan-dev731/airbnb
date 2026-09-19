import React, { createContext, useContext, useState, useMemo } from "react";

const SearchContext = createContext(null);

export const SearchProvider = ({ children }) => {
  const [destination, setDestination] = useState("");
  const [checkInDate, setCheckInDate] = useState(null);
  const [checkOutDate, setCheckOutDate] = useState(null);
  const [guests, setGuests] = useState({
    adults: 1,
    children: 0,
    infants: 0,
    pets: 0,
  });

  const [selectedCategory, setSelectedCategory] = useState("Trending");
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [activeSearchSegment, setActiveSearchSegment] = useState(null); // 'where' | 'checkIn' | 'checkOut' | 'who' | null
  const [displayTotalWithTaxes, setDisplayTotalWithTaxes] = useState(false);

  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    propertyType: "",
    bedrooms: "",
    bathrooms: "",
    amenities: [],
    isGuestFavorite: false,
    sortBy: "newest",
  });

  // Calculate total count of active filters for the badge counter
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.minPrice || filters.maxPrice) count++;
    if (filters.propertyType) count++;
    if (filters.bedrooms) count++;
    if (filters.bathrooms) count++;
    if (filters.amenities.length > 0) count += filters.amenities.length;
    if (filters.isGuestFavorite) count++;
    return count;
  }, [filters]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: "",
      maxPrice: "",
      propertyType: "",
      bedrooms: "",
      bathrooms: "",
      amenities: [],
      isGuestFavorite: false,
      sortBy: "newest",
    });
  };

  const resetAllSearch = () => {
    setDestination("");
    setCheckInDate(null);
    setCheckOutDate(null);
    setGuests({ adults: 1, children: 0, infants: 0, pets: 0 });
    setSelectedCategory("Trending");
    clearFilters();
  };

  return (
    <SearchContext.Provider
      value={{
        destination,
        setDestination,
        checkInDate,
        setCheckInDate,
        checkOutDate,
        setCheckOutDate,
        guests,
        setGuests,
        selectedCategory,
        setSelectedCategory,
        filters,
        setFilters,
        updateFilters,
        clearFilters,
        activeFiltersCount,
        isFilterModalOpen,
        setIsFilterModalOpen,
        isSearchExpanded,
        setIsSearchExpanded,
        activeSearchSegment,
        setActiveSearchSegment,
        displayTotalWithTaxes,
        setDisplayTotalWithTaxes,
        resetAllSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
