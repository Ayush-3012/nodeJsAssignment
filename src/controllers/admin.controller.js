import bcrypt from "bcrypt";
import { User } from "../models/users.models.js";
import { Admin } from "../models/admin.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createAdmin = async (req, res) => {
  const { email, phone, name, password } = req.body;

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    const existingAdmin = await Admin.findOne({ $or: [{ email }, { phone }] });

    if (existingUser || existingAdmin)
      return res
        .status(400)
        .json({ message: "Email or phone number already exists" });

    const profileImageLocalPath = req.files?.profileImage[0]?.path;
    const profileImage = await uploadOnCloudinary(profileImageLocalPath);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({
      email,
      phone,
      name,
      profileImage: profileImage.url,
      password: hashedPassword,
      role: "Admin",
    });

    await newAdmin.save();

    res.status(201).json({ message: "Admin account created successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Could not create admin account",
      error: error.message,
    });
  }
};

export const getUserDetails = async (req, res) => {
  const { userId } = req.query;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res
      .status(200)
      .json({ message: "User details retrieved successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get user's detail", error: error.message });
  }
};

export const modifyUserDetails = async (req, res) => {
  const userId = req.userId;
  const { name, userIdToModify } = req.body;
  try {
    const loggedInUser =
      (await User.findById(userId)) || (await Admin.findById(userId));
    if (!loggedInUser)
      return res.status(404).json({ message: "User not found" });

    if (loggedInUser.role === "User")
      return res
        .status(403)
        .json({ message: "Unauthorized to modify other users" });

    const userToModify = await User.findById(userIdToModify);
    if (!userToModify)
      return res.status(404).json({ message: "User to modify not found" });

    const profileImageLocalPath =
      req.files?.profileImage?.profileImage[0]?.path;
    const profileImage = await uploadOnCloudinary(profileImageLocalPath);

    if (name) userToModify.name = name;

    if (profileImage) userToModify.profileImage = profileImage.url;

    await userToModify.save();
    res.status(200).json({
      message: "User details updated successfully",
      user: userToModify,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update user details", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { userIdToDelete } = req.query;
  const loggedInUserId = req.userId;

  try {
    const loggedInUser =
      (await User.findById(loggedInUserId)) ||
      (await Admin.findById(loggedInUserId));
    if (!loggedInUser)
      return res.status(404).json({ message: "User not found" });

    if (loggedInUser.role === "User" || loggedInUserId === userIdToDelete)
      return res.status(403).json({ message: "Unauthorized to delete users" });

    const userToDelete = await User.findByIdAndDelete(userIdToDelete);
    if (!userToDelete)
      return res.status(404).json({ message: "User to delete not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete user", error: error.message });
  }
};
