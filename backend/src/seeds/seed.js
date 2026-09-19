import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { Review } from "../models/review.model.js";
import { Booking } from "../models/booking.model.js";
import { Favorite } from "../models/favorite.model.js";
import { DB_NAME, USER_ROLES } from "../utils/constants.js";

dotenv.config({ path: "./.env" });

const seedDatabase = async () => {
  try {
    console.log("Connecting to MongoDB for seeding...");
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    console.log("Connected to MongoDB successfully!");

    // Clear existing collections
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Listing.deleteMany({}),
      Review.deleteMany({}),
      Booking.deleteMany({}),
      Favorite.deleteMany({}),
    ]);

    console.log("Creating Seed Users...");

    // 1. Admin User
    const admin = await User.create({
      name: "Airbnb System Administrator",
      email: "admin@airbnb.com",
      password: "Password123!",
      role: USER_ROLES.ADMIN,
      phone: "+91 9876543210",
      bio: "Chief Operations & Governance Administrator for Airbnb marketplace.",
      isEmailVerified: true,
      avatar: {
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        publicId: "seed_admin_avatar",
      },
    });

    // 2. Superhosts
    const host1 = await User.create({
      name: "Aarav Sharma",
      email: "aarav.host@airbnb.com",
      password: "Password123!",
      role: USER_ROLES.HOST,
      phone: "+91 9823456789",
      bio: "Interior designer and passionate Superhost in Pune. I love making spaces cozy and memorable.",
      isEmailVerified: true,
      isSuperHost: true,
      isHostVerified: true,
      hostingSince: new Date("2021-04-15"),
      avatar: {
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        publicId: "seed_host1_avatar",
      },
    });

    const host2 = await User.create({
      name: "Pooja Hegde",
      email: "pooja.host@airbnb.com",
      password: "Password123!",
      role: USER_ROLES.HOST,
      phone: "+91 9811223344",
      bio: "Hospitality enthusiast in New Delhi. Hosting travellers from around the world for over 4 years.",
      isEmailVerified: true,
      isSuperHost: true,
      isHostVerified: true,
      hostingSince: new Date("2020-01-10"),
      avatar: {
        url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
        publicId: "seed_host2_avatar",
      },
    });

    // 3. Regular Guests
    const guest1 = await User.create({
      name: "Rohan Verma",
      email: "rohan.guest@airbnb.com",
      password: "Password123!",
      role: USER_ROLES.USER,
      phone: "+91 9988776655",
      bio: "Frequent nomad, food lover, and software architect.",
      isEmailVerified: true,
      avatar: {
        url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        publicId: "seed_guest1_avatar",
      },
    });

    const guest2 = await User.create({
      name: "Ananya Iyer",
      email: "ananya.guest@airbnb.com",
      password: "Password123!",
      role: USER_ROLES.USER,
      phone: "+91 9765432190",
      bio: "Travel blogger and photographer exploring hidden gems.",
      isEmailVerified: true,
      avatar: {
        url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        publicId: "seed_guest2_avatar",
      },
    });

    console.log("Users created successfully! Now seeding Properties / Listings...");

    // 4. Create Listings with comprehensive photo galleries and transparent pricing
    const listingsData = [
      {
        host: host1._id,
        title: "Flat in Viman Nagar",
        description:
          "Welcome to our serene, sunlit sanctuary in the heart of Viman Nagar. Featuring Scandinavian aesthetics, high-speed WiFi (300 Mbps), fully-equipped chef kitchen, and private balcony overlooking lush green gardens. Located 5 minutes from Pune Airport and Phoenix Marketcity.",
        propertyType: "Entire apartment",
        categories: ["Trending", "Iconic cities"],
        location: {
          address: "Skyline Residency, Road No 11, Viman Nagar",
          city: "Pune",
          state: "Maharashtra",
          country: "India",
          zipCode: "411014",
          neighborhood: "Viman Nagar",
          coordinates: { lat: 18.5679, lng: 73.9143 },
        },
        pricing: {
          basePrice: 5000,
          currency: "INR",
          discountPercentage: 10,
          cleaningFee: 500,
          serviceFeePercent: 12,
        },
        capacity: {
          guests: 4,
          bedrooms: 2,
          beds: 2,
          bathrooms: 2,
        },
        amenities: [
          "Wifi (300 Mbps)",
          "Kitchen",
          "Air conditioning",
          "Free parking on premises",
          "Dedicated workspace",
          "55-inch 4K Smart TV with Netflix",
          "Washing machine",
          "Private balcony with skyline view",
          "Elevator",
          "Self check-in with keypad",
          "First aid kit",
        ],
        photos: [
          {
            url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
            caption: "Bright and stylish living room with natural daylight",
            roomType: "Living room",
            isCover: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1600&q=80",
            caption: "Master bedroom with plush king-size bed and crisp linen",
            roomType: "Bedroom",
            isCover: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=80",
            caption: "Modern kitchen with microwave, stove, and espresso machine",
            roomType: "Full kitchen",
            isCover: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1600&q=80",
            caption: "Pristine bathroom with rain shower and premium toiletries",
            roomType: "Bathroom",
            isCover: false,
            order: 3,
          },
          {
            url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=80",
            caption: "Lush outdoor balcony and sunset relaxation zone",
            roomType: "Balcony",
            isCover: false,
            order: 4,
          },
        ],
        coverPhoto:
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1600&q=80",
        houseRules: {
          checkInTime: "14:00",
          checkOutTime: "11:00",
          selfCheckIn: true,
          petsAllowed: false,
          smokingAllowed: false,
          partiesAllowed: false,
        },
        ratingsSummary: {
          averageRating: 4.86,
          cleanliness: 4.9,
          accuracy: 4.9,
          checkIn: 5.0,
          communication: 4.9,
          location: 4.8,
          value: 4.7,
          totalReviews: 24,
        },
        isGuestFavorite: true,
        isPublished: true,
        isFeatured: true,
      },
      {
        host: host1._id,
        title: "Flat in Vadagaon Sheri",
        description:
          "Cozy boutique 1-bedroom flat in Vadagaon Sheri. Ideal for digital nomads and couples. Enjoy 100 Mbps fiber internet, air conditioning, modern decor, and peaceful environment.",
        propertyType: "Entire rental unit",
        categories: ["Trending", "Rooms"],
        location: {
          address: "Riverside Woods, Vadagaon Sheri",
          city: "Pune",
          state: "Maharashtra",
          country: "India",
          zipCode: "411014",
          neighborhood: "Vadagaon Sheri",
          coordinates: { lat: 18.552, lng: 73.924 },
        },
        pricing: {
          basePrice: 2650,
          currency: "INR",
          discountPercentage: 5,
          cleaningFee: 300,
          serviceFeePercent: 12,
        },
        capacity: {
          guests: 2,
          bedrooms: 1,
          beds: 1,
          bathrooms: 1,
        },
        amenities: [
          "Wifi",
          "Air conditioning",
          "Kitchen",
          "Dedicated workspace",
          "TV",
          "Free parking",
        ],
        photos: [
          {
            url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
            caption: "Chic modern studio living room",
            roomType: "Living room",
            isCover: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=1600&q=80",
            caption: "Cozy bedroom with ambient night lighting",
            roomType: "Bedroom",
            isCover: false,
            order: 1,
          },
        ],
        coverPhoto:
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
        ratingsSummary: {
          averageRating: 5.0,
          cleanliness: 5.0,
          accuracy: 5.0,
          checkIn: 5.0,
          communication: 5.0,
          location: 5.0,
          value: 5.0,
          totalReviews: 18,
        },
        isGuestFavorite: true,
        isPublished: true,
      },
      {
        host: host1._id,
        title: "Flat in Baner with Rooftop Pool",
        description:
          "Stunning premium apartment located in Baner. Includes exclusive access to the rooftop infinity pool, gym, private balcony, and high-end wooden interiors.",
        propertyType: "Entire apartment",
        categories: ["Amazing pools", "Luxe"],
        location: {
          address: "Baner Hill View Heights",
          city: "Pune",
          state: "Maharashtra",
          country: "India",
          zipCode: "411045",
          neighborhood: "Baner",
          coordinates: { lat: 18.559, lng: 73.7868 },
        },
        pricing: {
          basePrice: 4680,
          currency: "INR",
          discountPercentage: 15,
          cleaningFee: 600,
          serviceFeePercent: 12,
        },
        capacity: {
          guests: 3,
          bedrooms: 1,
          beds: 2,
          bathrooms: 1,
        },
        amenities: [
          "Rooftop Infinity Pool",
          "Gym",
          "Wifi (200 Mbps)",
          "Air conditioning",
          "Elevator",
          "Balcony",
          "Kitchen",
        ],
        photos: [
          {
            url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1600&q=80",
            caption: "Rooftop infinity swimming pool overlooking hills",
            roomType: "Pool",
            isCover: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
            caption: "Spacious master bedroom with floor-to-ceiling glass",
            roomType: "Bedroom",
            isCover: false,
            order: 1,
          },
        ],
        coverPhoto:
          "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1600&q=80",
        ratingsSummary: {
          averageRating: 5.0,
          cleanliness: 5.0,
          accuracy: 5.0,
          checkIn: 5.0,
          communication: 5.0,
          location: 5.0,
          value: 5.0,
          totalReviews: 32,
        },
        isGuestFavorite: true,
        isPublished: true,
      },
      {
        host: host2._id,
        title: "Villa in New Delhi Heritage Green",
        description:
          "Magnificent colonial-style luxury villa in South Delhi with sprawling private lawn, patio dining, 4 ensuite bedrooms, and personal butler service on request.",
        propertyType: "Entire villa",
        categories: ["Mansions", "Luxe", "Iconic cities"],
        location: {
          address: "14 Green Park Avenue",
          city: "New Delhi",
          state: "Delhi",
          country: "India",
          zipCode: "110016",
          neighborhood: "South Delhi",
          coordinates: { lat: 28.5589, lng: 77.2028 },
        },
        pricing: {
          basePrice: 8823,
          currency: "INR",
          discountPercentage: 10,
          cleaningFee: 1200,
          serviceFeePercent: 12,
        },
        capacity: {
          guests: 8,
          bedrooms: 4,
          beds: 5,
          bathrooms: 4.5,
        },
        amenities: [
          "Private Lawn & Garden",
          "Wifi (500 Mbps)",
          "Chef available",
          "Air conditioning",
          "EV charger",
          "Free parking (4 cars)",
          "Full gourmet kitchen",
          "Barbecue grill",
        ],
        photos: [
          {
            url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80",
            caption: "Exterior facade of the luxury white villa",
            roomType: "Exterior",
            isCover: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=80",
            caption: "Grand living room with royal chandelier",
            roomType: "Living room",
            isCover: false,
            order: 1,
          },
        ],
        coverPhoto:
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=80",
        ratingsSummary: {
          averageRating: 4.99,
          cleanliness: 5.0,
          accuracy: 5.0,
          checkIn: 5.0,
          communication: 5.0,
          location: 4.9,
          value: 4.9,
          totalReviews: 45,
        },
        isGuestFavorite: true,
        isPublished: true,
        isFeatured: true,
      },
      {
        host: host2._id,
        title: "Apartment in New Delhi",
        description:
          "Modern high-rise apartment near Connaught Place with panoramic views of Delhi skyline. Walkable to metro, cafe culture, and historical monuments.",
        propertyType: "Entire apartment",
        categories: ["Iconic cities", "Trending"],
        location: {
          address: "Barakhamba Road, Connaught Place",
          city: "New Delhi",
          state: "Delhi",
          country: "India",
          zipCode: "110001",
          neighborhood: "Connaught Place",
          coordinates: { lat: 28.6304, lng: 77.2177 },
        },
        pricing: {
          basePrice: 5683,
          currency: "INR",
          discountPercentage: 0,
          cleaningFee: 500,
          serviceFeePercent: 12,
        },
        capacity: {
          guests: 4,
          bedrooms: 2,
          beds: 2,
          bathrooms: 2,
        },
        amenities: [
          "Wifi",
          "Air conditioning",
          "Elevator",
          "Dedicated workspace",
          "Metro access",
          "Kitchen",
        ],
        photos: [
          {
            url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
            caption: "Open layout living and dining hall",
            roomType: "Living room",
            isCover: true,
            order: 0,
          },
        ],
        coverPhoto:
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
        ratingsSummary: {
          averageRating: 4.98,
          cleanliness: 5.0,
          accuracy: 5.0,
          checkIn: 5.0,
          communication: 5.0,
          location: 5.0,
          value: 4.9,
          totalReviews: 61,
        },
        isGuestFavorite: true,
        isPublished: true,
      },
    ];

    const createdListings = await Listing.insertMany(listingsData);
    console.log(`Created ${createdListings.length} listings successfully!`);

    // 5. Create Reviews for Listings
    console.log("Seeding Reviews...");
    const review1 = await Review.create({
      user: guest1._id,
      listing: createdListings[0]._id,
      rating: 5,
      detailedRatings: {
        cleanliness: 5,
        accuracy: 5,
        checkIn: 5,
        communication: 5,
        location: 5,
        value: 5,
      },
      comment:
        "Spectacular apartment! Super clean, fast WiFi, and Aarav was an exceptional host. The balcony views during sunset were magical. Will definitely book again on my next trip to Pune!",
      hostResponse: {
        comment:
          "Thank you so much Rohan! It was an absolute pleasure hosting you. Looking forward to your next visit!",
        respondedAt: new Date(),
      },
    });

    const review2 = await Review.create({
      user: guest2._id,
      listing: createdListings[0]._id,
      rating: 5,
      detailedRatings: {
        cleanliness: 5,
        accuracy: 5,
        checkIn: 5,
        communication: 5,
        location: 4.8,
        value: 4.9,
      },
      comment:
        "The photo tour matched the real listing 100%. The kitchen had everything I needed to cook meals, and the neighborhood in Viman Nagar is vibrant and safe.",
    });

    // 6. Create Sample Booking
    console.log("Seeding Bookings...");
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 5);
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 8);

    await Booking.create({
      user: guest1._id,
      listing: createdListings[0]._id,
      host: host1._id,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      nightsCount: 3,
      guestsCount: { adults: 2, children: 0, infants: 0, pets: 0 },
      pricingBreakdown: {
        basePricePerNight: 5000,
        baseTotal: 15000,
        discountAmount: 1500,
        cleaningFee: 500,
        serviceFee: 1620,
        taxes: 2812,
        grandTotal: 18432,
        currency: "INR",
      },
      paymentStatus: "paid",
      bookingStatus: "confirmed",
      specialRequests: "Late check-in around 8 PM",
    });

    // 7. Seed Wishlist Favorite
    await Favorite.create({
      user: guest1._id,
      listing: createdListings[0]._id,
      collectionName: "Pune Workation Stays",
    });

    console.log("\n========================================================");
    console.log("🎉 SEEDING COMPLETED SUCCESSFULLY!");
    console.log("========================================================");
    console.log("Credentials for Testing:");
    console.log("🔑 Admin:   admin@airbnb.com    | Password: Password123!");
    console.log("🔑 Host:    aarav.host@airbnb.com | Password: Password123!");
    console.log("🔑 Guest:   rohan.guest@airbnb.com | Password: Password123!");
    console.log("========================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

seedDatabase();
