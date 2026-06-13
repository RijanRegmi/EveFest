import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

// Token generator helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const registerUser = async (name, username, email, phoneNumber, password) => {
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new Error("User with this email already exists");
  }

  const usernameExists = await User.findOne({ username: username.toLowerCase() });
  if (usernameExists) {
    throw new Error("Username is already taken");
  }

  const user = await User.create({
    name,
    username,
    email,
    phoneNumber,
    password,
    role: "user",
  });

  if (user) {
    return {
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
      },
    };
  } else {
    throw new Error("Invalid user input registration data");
  }
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid email or password credentials");
  }

  return {
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
  };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User profile not found");
  }
  return user;
};

export const checkAvailability = async (field, value) => {
  const query = {};
  // If the field is username or email, do a case-insensitive check
  if (field === "username" || field === "email") {
    query[field] = value.toLowerCase();
  } else {
    query[field] = value;
  }
  
  const user = await User.findOne(query);
  return !user; // true if available, false if taken
};

export const updateUserProfile = async (userId, updates) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User profile not found");
  }

  // Validate username and email uniqueness if changing
  if (updates.email && updates.email.toLowerCase() !== user.email.toLowerCase()) {
    const emailExists = await User.findOne({ email: updates.email.toLowerCase() });
    if (emailExists) {
      throw new Error("Email is already in use by another user");
    }
    user.email = updates.email.toLowerCase();
  }

  if (updates.username && updates.username.toLowerCase() !== user.username.toLowerCase()) {
    const usernameExists = await User.findOne({ username: updates.username.toLowerCase() });
    if (usernameExists) {
      throw new Error("Username is already in use by another user");
    }
    user.username = updates.username.toLowerCase();
  }

  if (updates.name) user.name = updates.name;
  if (updates.phoneNumber) user.phoneNumber = updates.phoneNumber;
  
  if (updates.password && updates.password.trim() !== "") {
    user.password = updates.password;
  }

  await user.save();

  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
  };
};
