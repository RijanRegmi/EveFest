import express from "express";
import { registerUser, loginUser, getUserProfile, checkAvailability } from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);
router.post("/check-availability", checkAvailability);

export default router;
