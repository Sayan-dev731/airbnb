import React, { useState } from "react";
import { X, Plus, Trash2, Sparkles, Upload, Check } from "lucide-react";
import { listingAPI } from "../../api/listing.api";
import { PROPERTY_TYPES, CATEGORIES, AMENITIES_LIST } from "../../data/staticData";
import { useToast } from "../../context/ToastContext";

export const CreateListingModal = ({ isOpen, onClose, onCreated }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("Entire villa");
  const [selectedCategories, setSelectedCategories] = useState(["Trending", "Amazing pools"]);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Goa");
  const [state, setState] = useState("Goa");
  const [country, setCountry] = useState("India");
  const [zipCode, setZipCode] = useState("403509");
  const [lat, setLat] = useState(15.549);
  const [lng, setLng] = useState(73.753);

  const [basePrice, setBasePrice] = useState(6500);
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [cleaningFee, setCleaningFee] = useState(800);

  const [guests, setGuests] = useState(6);
  const [bedrooms, setBedrooms] = useState(3);
  const [beds, setBeds] = useState(3);
  const [bathrooms, setBathrooms] = useState(3);

  const [selectedAmenities, setSelectedAmenities] = useState([
    "Wifi",
    "Air conditioning",
    "Private pool",
    "Kitchen",
    "Free parking on premises",
  ]);

  const [photoUrls, setPhotoUrls] = useState([
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  ]);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  if (!isOpen) return null;

  const handleCategoryToggle = (catId) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleAmenityToggle = (amenityId) => {
    if (selectedAmenities.includes(amenityId)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== amenityId));
    } else {
      setSelectedAmenities([...selectedAmenities, amenityId]);
    }
  };

  const handleAddPhotoUrl = () => {
    if (newPhotoUrl.trim()) {
      setPhotoUrls([...photoUrls, newPhotoUrl.trim()]);
      setNewPhotoUrl("");
      addToast("Photo link added successfully", "info");
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        addToast("Please select only valid image files (PNG, JPG, WEBP)", "error");
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotoUrls((prev) => [...prev, uploadEvent.target.result]);
        }
      };
      reader.readAsDataURL(file);
    });
    addToast(`${files.length} photo(s) selected from your device`, "success");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotoUrls((prev) => [...prev, uploadEvent.target.result]);
        }
      };
      reader.readAsDataURL(file);
    });
    addToast(`${files.length} photo(s) uploaded`, "success");
  };

  const handleSetCover = (index) => {
    const selected = photoUrls[index];
    const remaining = photoUrls.filter((_, idx) => idx !== index);
    setPhotoUrls([selected, ...remaining]);
    addToast("Cover photo updated", "info");
  };

  const handleRemovePhoto = (index) => {
    setPhotoUrls(photoUrls.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description || !address || !city) {
      addToast("Please fill in all required fields", "error");
      return;
    }
    if (photoUrls.length === 0) {
      addToast("Please provide at least 1 photo for your listing", "error");
      return;
    }

    setLoading(true);
    try {
      const listingData = {
        title,
        description,
        propertyType,
        categories: selectedCategories,
        location: {
          address,
          city,
          state,
          country,
          zipCode,
          coordinates: {
            lat: Number(lat),
            lng: Number(lng),
          },
        },
        pricing: {
          basePrice: Number(basePrice),
          discountPercentage: Number(discountPercentage),
          cleaningFee: Number(cleaningFee),
          currency: "INR",
        },
        capacity: {
          guests: Number(guests),
          bedrooms: Number(bedrooms),
          beds: Number(beds),
          bathrooms: Number(bathrooms),
        },
        amenities: selectedAmenities,
        photos: photoUrls.map((url, i) => ({
          url,
          isCover: i === 0,
          order: i,
        })),
        coverPhoto: photoUrls[0],
        isPublished: true,
      };

      const res = await listingAPI.createListing(listingData);
      addToast("Listing created and published successfully! 🏡", "success");
      if (onCreated) onCreated(res.data?.listing || res.data);
      onClose();
    } catch (err) {
      addToast(err.message || "Failed to create listing", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 880,
          maxWidth: "100%",
          maxHeight: "90vh",
          backgroundColor: "#FFFFFF",
          borderRadius: "var(--radius-xl)",
          boxShadow: "var(--shadow-modal)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "scaleUp 200ms ease-out",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 24px",
            borderBottom: "1px solid var(--airbnb-border-soft)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{ padding: 4, display: "flex", borderRadius: "var(--radius-circle)" }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Airbnb your home - Create a listing</div>
          <div style={{ width: 24 }} />
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: "auto", padding: "24px 32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {/* Basic Info */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Basic Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Listing Title</div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Luxurious 3BHK Villa with Private Pool & Sunset Views"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ width: "100%", fontSize: 14, marginTop: 2, fontWeight: 500 }}
                  />
                </div>

                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Description</div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe what makes your place unique and comfortable for guests..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: "100%", fontSize: 13, marginTop: 4, resize: "vertical" }}
                  />
                </div>

                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Property Type</div>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    style={{ width: "100%", fontSize: 14, marginTop: 2, cursor: "pointer", fontWeight: 500 }}
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Categories</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CATEGORIES.map((cat) => {
                  const isSel = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategoryToggle(cat.id)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "var(--radius-pill)",
                        border: `1px solid ${isSel ? "var(--airbnb-ink)" : "var(--airbnb-border)"}`,
                        backgroundColor: isSel ? "var(--airbnb-ink)" : "#FFFFFF",
                        color: isSel ? "#FFFFFF" : "var(--airbnb-ink)",
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Location</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ gridColumn: "span 2", border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Street Address</div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 14 Anjuna Beach Road"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    style={{ width: "100%", fontSize: 14, marginTop: 2, fontWeight: 500 }}
                  />
                </div>

                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>City</div>
                  <input
                    type="text"
                    required
                    placeholder="Goa"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ width: "100%", fontSize: 14, marginTop: 2, fontWeight: 500 }}
                  />
                </div>

                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>State</div>
                  <input
                    type="text"
                    required
                    placeholder="Goa"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={{ width: "100%", fontSize: 14, marginTop: 2, fontWeight: 500 }}
                  />
                </div>
              </div>
            </div>

            {/* Pricing & Capacity */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Pricing & Capacity</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Price per night (₹)</div>
                  <input
                    type="number"
                    required
                    min={100}
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    style={{ width: "100%", fontSize: 15, marginTop: 2, fontWeight: 600 }}
                  />
                </div>

                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Discount (%)</div>
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={discountPercentage}
                    onChange={(e) => setDiscountPercentage(e.target.value)}
                    style={{ width: "100%", fontSize: 15, marginTop: 2, fontWeight: 600 }}
                  />
                </div>

                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Guests</div>
                  <input
                    type="number"
                    min={1}
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    style={{ width: "100%", fontSize: 15, marginTop: 2, fontWeight: 600 }}
                  />
                </div>

                <div style={{ border: "1px solid var(--airbnb-border)", borderRadius: "var(--radius-md)", padding: "10px 14px" }}>
                  <div style={{ fontSize: 11, color: "var(--airbnb-muted)", fontWeight: 600 }}>Bedrooms</div>
                  <input
                    type="number"
                    min={1}
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    style={{ width: "100%", fontSize: 15, marginTop: 2, fontWeight: 600 }}
                  />
                </div>
              </div>
            </div>

            {/* Photos */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>Listing Photos ({photoUrls.length})</h3>
                <span style={{ fontSize: 12, color: "var(--airbnb-muted)" }}>Upload from device or paste image links</span>
              </div>

              {/* Device File Upload Drag & Drop Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                style={{
                  border: `2px dashed ${isDragging ? "var(--airbnb-ink)" : "var(--airbnb-border)"}`,
                  backgroundColor: isDragging ? "var(--airbnb-surface-muted)" : "var(--airbnb-bg)",
                  borderRadius: "var(--radius-card)",
                  padding: "24px 16px",
                  textAlign: "center",
                  marginBottom: 16,
                  transition: "all var(--transition-fast)",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "var(--radius-circle)",
                      backgroundColor: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "var(--shadow-card)",
                    }}
                  >
                    <Upload size={22} color="var(--airbnb-accent)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--airbnb-ink)" }}>
                      Drag and drop your property photos here
                    </div>
                    <div style={{ fontSize: 12, color: "var(--airbnb-muted)", marginTop: 2 }}>
                      Supports PNG, JPG, JPEG, WEBP from your device
                    </div>
                  </div>

                  <label
                    style={{
                      cursor: "pointer",
                      backgroundColor: "var(--airbnb-ink)",
                      color: "#FFFFFF",
                      padding: "8px 18px",
                      borderRadius: "var(--radius-sm)",
                      fontSize: 13,
                      fontWeight: 600,
                      marginTop: 4,
                      display: "inline-block",
                    }}
                  >
                    <span>Browse files on device</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>

              {/* URL Input */}
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                  type="url"
                  placeholder="Or paste an image URL (e.g. Unsplash, Cloudinary)..."
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    border: "1px solid var(--airbnb-border)",
                    borderRadius: "var(--radius-md)",
                    fontSize: 14,
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddPhotoUrl}
                  style={{
                    backgroundColor: "var(--airbnb-surface-muted)",
                    color: "var(--airbnb-ink)",
                    border: "1px solid var(--airbnb-border)",
                    padding: "10px 18px",
                    borderRadius: "var(--radius-md)",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Add Link
                </button>
              </div>

              {/* Photo Preview Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
                {photoUrls.map((url, idx) => (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      height: 110,
                      borderRadius: "var(--radius-sm)",
                      overflow: "hidden",
                      border: idx === 0 ? "2px solid var(--airbnb-accent)" : "1px solid var(--airbnb-border)",
                    }}
                  >
                    <img src={url} alt={`Photo ${idx + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        backgroundColor: "rgba(0,0,0,0.6)",
                        color: "#FFFFFF",
                        padding: 4,
                        borderRadius: "var(--radius-circle)",
                      }}
                      title="Delete photo"
                    >
                      <Trash2 size={12} />
                    </button>
                    {idx === 0 ? (
                      <span style={{ position: "absolute", bottom: 4, left: 4, backgroundColor: "var(--airbnb-accent)", color: "#FFFFFF", fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                        Cover Photo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCover(idx)}
                        style={{
                          position: "absolute",
                          bottom: 4,
                          left: 4,
                          backgroundColor: "rgba(0,0,0,0.7)",
                          color: "#FFFFFF",
                          fontSize: 10,
                          padding: "2px 6px",
                          borderRadius: 4,
                          fontWeight: 600,
                        }}
                      >
                        Set as cover
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Amenities</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                {AMENITIES_LIST.map((amenity) => {
                  const isChecked = selectedAmenities.includes(amenity.id);
                  return (
                    <label key={amenity.id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleAmenityToggle(amenity.id)}
                        style={{ width: 16, height: 16, accentColor: "var(--airbnb-ink)" }}
                      />
                      <span>{amenity.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 32, paddingTop: 16, borderTop: "1px solid var(--airbnb-border-soft)", display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "12px 20px", fontSize: 14, fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "var(--airbnb-accent)",
                backgroundImage: "var(--airbnb-accent-gradient)",
                color: "#FFFFFF",
                padding: "14px 28px",
                borderRadius: "var(--radius-sm)",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "wait" : "pointer",
                boxShadow: "0 2px 6px rgba(224, 11, 65, 0.4)",
              }}
            >
              {loading ? "Publishing listing..." : "Publish listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
