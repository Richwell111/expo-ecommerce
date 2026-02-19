import mongoose from "mongoose";
import { User } from "./src/models/user.model.js";
import { ENV } from "./src/config/env.js";
import dotenv from "dotenv";

dotenv.config();

const checkUser = async () => {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(ENV.DB_URL || process.env.MONGO_URI);
    console.log("✅ Connected");

    const adminEmail = ENV.ADMIN_EMAIL || process.env.ADMIN_EMAIL;
    console.log(`Checking for Admin Email: ${adminEmail}`);

    const user = await User.findOne({ email: adminEmail });
    
    if (user) {
        console.log("✅ Admin User Found:");
        console.log(JSON.stringify(user, null, 2));
    } else {
        console.log("❌ Admin User NOT Found!");
        const allUsers = await User.find().limit(5);
        console.log("First 5 users in DB:", JSON.stringify(allUsers, null, 2));
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("Error:", error);
  }
};

checkUser();
