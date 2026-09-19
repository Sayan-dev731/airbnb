import dotenv from "dotenv";
import connectDB from "./db/connectDb.js";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

const PORT = parseInt(process.env.PORT, 10) || 8000;

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Airbnb Server is running at http://localhost:${PORT}`);
      console.log(`📡 Health check available at: http://localhost:${PORT}/api/v1/health`);
    });

    // Handle Unhandled Promise Rejections
    process.on("unhandledRejection", (err) => {
      console.error("UNHANDLED REJECTION! Shutting down gracefully...", err);
      server.close(() => {
        process.exit(1);
      });
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed! Error:", err);
  });

// Handle Uncaught Exceptions
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION! Shutting down...", err);
  process.exit(1);
});
