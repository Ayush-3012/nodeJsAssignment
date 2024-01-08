import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
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
      default: "Admin",
    },
  },
  { timestamps: true }
);

export const Admin = mongoose.model("Admin", adminSchema);
