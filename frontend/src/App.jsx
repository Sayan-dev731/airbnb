import React, { useState, useEffect } from "react";
import { AirbnbHeader } from "./components/common/AirbnbHeader";
import { Footer } from "./components/common/Footer";
import { MobileBottomNav } from "./components/common/MobileBottomNav";
import { LanguageCurrencyModal } from "./components/common/LanguageCurrencyModal";
import { AuthModal } from "./components/common/AuthModal";
import { EmailVerificationModal } from "./components/common/EmailVerificationModal";
import { BecomeHostModal } from "./components/host/BecomeHostModal";
import { HomePage } from "./components/pages/HomePage";
import { ListingDetailPage } from "./components/pages/ListingDetailPage";
import { MyTripsView } from "./components/trips/MyTripsView";
import { FavoritesView } from "./components/favorites/FavoritesView";
import { HostDashboard } from "./components/host/HostDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { SearchProvider } from "./context/SearchContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ToastProvider } from "./context/ToastContext";

const AppContent = () => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState("home"); // 'home' | 'listing' | 'trips' | 'favorites' | 'host' | 'admin'
  const [selectedListing, setSelectedListing] = useState(null);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isBecomeHostOpen, setIsBecomeHostOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en-IN");
  const [selectedCurrency, setSelectedCurrency] = useState("INR");

  // Handle URL history state for clean back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state?.view) {
        setCurrentView(event.state.view);
        setSelectedListing(event.state.listing || null);
      } else {
        setCurrentView("home");
        setSelectedListing(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (view, listing = null) => {
    setCurrentView(view);
    setSelectedListing(listing);
    window.history.pushState({ view, listing }, "", view === "home" ? "/" : `/${view}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSelectListing = (listing) => {
    navigateTo("listing", listing);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Universal Framer Motion Morphing Header */}
      <AirbnbHeader
        onNavigate={(view) => navigateTo(view)}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenBecomeHost={() => setIsBecomeHostOpen(true)}
      />

      {/* Main Page Views */}
      <main style={{ flex: 1 }}>
        {currentView === "home" && (
          <HomePage onSelectListing={handleSelectListing} />
        )}

        {currentView === "listing" && selectedListing && (
          <ListingDetailPage
            listingId={selectedListing._id}
            initialListing={selectedListing}
            onBack={() => navigateTo("home")}
            onBookingSuccess={() => navigateTo("trips")}
          />
        )}

        {currentView === "trips" && (
          <MyTripsView onSelectListing={handleSelectListing} />
        )}

        {currentView === "favorites" && (
          <FavoritesView onSelectListing={handleSelectListing} />
        )}

        {currentView === "host" && (
          <HostDashboard onSelectListing={handleSelectListing} />
        )}

        {currentView === "admin" && (
          <AdminDashboard onSelectListing={handleSelectListing} />
        )}
      </main>

      {/* Destination Inspiration & Universal Footer */}
      <Footer onOpenLanguageModal={() => setIsLanguageModalOpen(true)} />

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={(view) => navigateTo(view)}
      />

      {/* Global Modals */}
      <LanguageCurrencyModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        selectedLanguage={selectedLanguage}
        selectedCurrency={selectedCurrency}
        onSelectLanguage={setSelectedLanguage}
        onSelectCurrency={setSelectedCurrency}
      />

      <AuthModal />
      
      {/* Mandatory Account Email Verification Popup */}
      <EmailVerificationModal />

      {/* Host Onboarding Application Modal */}
      <BecomeHostModal
        isOpen={isBecomeHostOpen}
        onClose={() => setIsBecomeHostOpen(false)}
        onSuccess={() => navigateTo("host")}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <SearchProvider>
          <WishlistProvider>
            <AppContent />
          </WishlistProvider>
        </SearchProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
