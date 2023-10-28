import { MongoClient } from "mongodb";
import { config } from "dotenv";
import mongoose from "mongoose";

config({
  path: "./config/config.env",
});

const URI = process.env.MONGO_URI;

const client = new MongoClient(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const connectDB = async () => {
  await mongoose.connect(URI);
  console.log("connected to " + mongoose.connection.host);
};

export default connectDB;
