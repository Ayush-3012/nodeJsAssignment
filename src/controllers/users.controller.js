import { User } from "../models/users.models.js";
import bcrypt from "bcrypt";
import { COOKIE_NAME } from "../utils/constants.js";
import { createToken } from "../utils/token-manager.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Admin } from "../models/admin.models.js";

const isEmail = (input) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(input);
};

const isPhoneNumber = (input) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(input);
};

export const signupUser = async (req, res) => {
  const { email, phone, name, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });

    if (existingUser)
      return res
        .status(400)
        .json({ message: "Email or phone number already exists" });

    const profileImageLocalPath = req.files?.profileImage[0]?.path;
    const profileImage = await uploadOnCloudinary(profileImageLocalPath);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      phone,
      name,
      profileImage: profileImage.url,
      password: hashedPassword,
      role: "User",
    });

    await newUser.save();
    res.status(201).json({ message: "User signed up successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Could not sign up user", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { emailOrPhone, password } = req.body;
  try {
    let user;
    if (isEmail(emailOrPhone)) {
      user = await User.findOne({ email: emailOrPhone });
      user = await Admin.findOne({ email: emailOrPhone });
    } else if (isPhoneNumber(emailOrPhone)) {
      user = await User.findOne({ phone: emailOrPhone });
      user = await Admin.findOne({ phone: emailOrPhone });
    } else {
      return res
        .status(400)
        .json({ message: "Invalid email or phone number format" });
    }

    if (!user) return res.status(404).json({ message: "User not found" });

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      domain: "localhost",
      signed: true,
      path: "/",
    });

    const token = createToken(user._id, user.role, "3d");
    const expires = new Date();
    expires.setDate(expires.getDate() + 3);

    res.cookie(COOKIE_NAME, token, {
      path: "/",
      domain: "localhost",
      expires,
      httpOnly: true,
      secure: true,
      signed: true,
    });

    res.status(200).json({ message: "Login Successful", user });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

export const modifyUserDetails = async (req, res) => {
  const userId = req.userId;
  const { name } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "User" && user._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to modify other users" });
    }

    const profileImageLocalPath =
      req.files?.profileImage?.profileImage[0]?.path;
    const profileImage = await uploadOnCloudinary(profileImageLocalPath);

    if (name) {
      user.name = name;
    }
    if (profileImage) {
      user.profileImage = profileImage.url;
    }

    await user.save();

    res.status(200).json({ message: "User details updated successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update user details", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.userId;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user._id.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete other users" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};
