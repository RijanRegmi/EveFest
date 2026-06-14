import { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService.js";
import * as bookingService from "../services/bookingService.js";

export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, username, email, phoneNumber, password } = req.body as {
      name: string;
      username: string;
      email: string;
      phoneNumber: string;
      password: string;
    };
    const result = await authService.registerUser(
      name,
      username,
      email,
      phoneNumber,
      password
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };
    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401);
    next(error);
  }
};

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const userProfile = await authService.getUserProfile(userId);
    const userBookings = await bookingService.getUserBookings(userId);

    res.status(200).json({
      _id: userProfile._id,
      name: userProfile.name,
      username: userProfile.username,
      email: userProfile.email,
      phoneNumber: userProfile.phoneNumber,
      role: userProfile.role,
      bookings: userBookings,
    });
  } catch (error) {
    res.status(404);
    next(error);
  }
};

export const checkAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { field, value } = req.body as { field: string; value: string };
    if (!field || !value) {
      res.status(400).json({ message: "Field and value are required" });
      return;
    }
    const isAvailable = await authService.checkAvailability(field, value);
    res.status(200).json({ available: isAvailable });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

export const updateUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const updatedUser = await authService.updateUserProfile(
      req.user!._id.toString(),
      req.body
    );
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400);
    next(error);
  }
};
