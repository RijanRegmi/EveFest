import express from "express";
import {
  register,
  login,
  getProfile,
  checkAvailabilityHandler,
  updateProfile,
} from "../controllers/authController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/check-availability", checkAvailabilityHandler);

export default router;
