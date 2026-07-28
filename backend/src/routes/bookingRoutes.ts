import express from "express";
import {
  createBooking,
  getUserBookings,
  cancelBooking,
} from "../controllers/bookingController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.route("/").post(protect, createBooking).get(protect, getUserBookings);
router.delete("/:id", protect, cancelBooking);

export default router;
