import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: Number,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    profileImage: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "User",
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
