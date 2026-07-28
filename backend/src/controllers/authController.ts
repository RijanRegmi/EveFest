import { Request, Response, NextFunction } from "express";
import * as authService from "../services/authService";
import * as bookingService from "../services/bookingService";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, username, email, phoneNumber, password } = req.body as {
      name?: string;
      username?: string;
      email?: string;
      phoneNumber?: string;
      password?: string;
    };

    if (!name || !username || !email || !phoneNumber || !password) {
      res.status(400);
      return next(new Error("Please provide all required fields"));
    }

    const result = await authService.registerUser(
      name,
      username,
      email,
      phoneNumber,
      password
    );

    res.status(201).json(result);
  } catch (error) {
    const err = error as Error;
    if (
      err.message.includes("already exists") ||
      err.message.includes("already taken")
    ) {
      res.status(400);
    } else {
      res.status(500);
    }
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400);
      return next(new Error("Please provide email and password"));
    }

    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401);
    next(error);
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const user = await authService.getUserProfile(userId);
    const bookings = await bookingService.getUserBookings(userId);

    res.status(200).json({
      user,
      bookings,
    });
  } catch (error) {
    res.status(404);
    next(error);
  }
};

export const checkAvailabilityHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { field, value } = req.query as { field?: string; value?: string };
    if (!field || !value) {
      res.status(400);
      return next(new Error("Missing field or value query parameter"));
    }

    const available = await authService.checkAvailability(field, value);
    res.status(200).json({ available });
  } catch (error) {
    res.status(500);
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!._id.toString();
    const updatedUser = await authService.updateUserProfile(userId, req.body);
    res.status(200).json(updatedUser);
  } catch (error) {
    const err = error as Error;
    if (err.message.includes("already in use")) {
      res.status(400);
    } else {
      res.status(500);
    }
    next(error);
  }
};
