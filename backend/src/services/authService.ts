import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User, { IUserDocument } from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

interface AuthResult {
  token: string;
  user: {
    _id: mongoose.Types.ObjectId;
    name: string;
    username: string;
    email: string;
    phoneNumber: string;
    role: string;
  };
}

interface ProfileUpdateData {
  name?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
}

// Token generator helper
const generateToken = (id: mongoose.Types.ObjectId): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: "30d",
  });
};

export const registerUser = async (
  name: string,
  username: string,
  email: string,
  phoneNumber: string,
  password: string
): Promise<AuthResult> => {
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new Error("User with this email already exists");
  }

  const usernameExists = await User.findOne({
    username: username.toLowerCase(),
  });
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
      token: generateToken(user._id as mongoose.Types.ObjectId),
      user: {
        _id: user._id as mongoose.Types.ObjectId,
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

export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResult> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("Invalid email or password credentials");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error("Invalid email or password credentials");
  }

  return {
    token: generateToken(user._id as mongoose.Types.ObjectId),
    user: {
      _id: user._id as mongoose.Types.ObjectId,
      name: user.name,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    },
  };
};

export const getUserProfile = async (
  userId: string
): Promise<IUserDocument> => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new Error("User profile not found");
  }
  return user;
};

export const checkAvailability = async (
  field: string,
  value: string
): Promise<boolean> => {
  const query: Record<string, string> = {};
  if (field === "username" || field === "email") {
    query[field] = value.toLowerCase();
  } else {
    query[field] = value;
  }

  const user = await User.findOne(query);
  return !user; // true if available, false if taken
};

export const updateUserProfile = async (
  userId: string,
  updates: ProfileUpdateData
): Promise<Omit<AuthResult["user"], "_id"> & { _id: unknown }> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User profile not found");
  }

  if (
    updates.email &&
    updates.email.toLowerCase() !== user.email.toLowerCase()
  ) {
    const emailExists = await User.findOne({
      email: updates.email.toLowerCase(),
    });
    if (emailExists) {
      throw new Error("Email is already in use by another user");
    }
    user.email = updates.email.toLowerCase();
  }

  if (
    updates.username &&
    updates.username.toLowerCase() !== user.username.toLowerCase()
  ) {
    const usernameExists = await User.findOne({
      username: updates.username.toLowerCase(),
    });
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
