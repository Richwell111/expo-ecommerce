import mongoose from "mongoose";
import { Product } from "./src/models/product.model.js";
import { ENV } from "./src/config/env.js";
import dotenv from "dotenv";

dotenv.config();

const checkProducts = async () => {
  try {
    console.log("Connecting to:", ENV.DB_URL || process.env.MONGO_URI);
    await mongoose.connect(ENV.DB_URL || process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const count = await Product.countDocuments();
    console.log(`Total Products in DB: ${count}`);

    if (count > 0) {
      const sample = await Product.findOne();
      console.log("Sample Product:", JSON.stringify(sample, null, 2));
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error Checking Database:", error);
  }
};

checkProducts();
