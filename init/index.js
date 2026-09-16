const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/mydatabase";

async function main() {
  await mongoose.connect(MONGO_URL);
  console.log("connected to DB");

  await Listing.deleteMany({});
  const listings = initData.data.map((obj) => ({ ...obj }));
  await Listing.insertMany(listings);
  console.log("data was initialized");

  await mongoose.connection.close();
}

main().catch(async (err) => {
  console.error("Database initialization error:", err);
  await mongoose.connection.close();
  process.exitCode = 1;
});
