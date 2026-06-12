import * as authService from "../services/authService.js";
import * as bookingService from "../services/bookingService.js";

export const registerUser = async (req, res, next) => {
  try {
    const { name, username, email, phoneNumber, password } = req.body;
    const result = await authService.registerUser(name, username, email, phoneNumber, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401);
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const userProfile = await authService.getUserProfile(req.user._id);
    const userBookings = await bookingService.getUserBookings(req.user._id);
    
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
