import express from "express";
import { createBooking, cancelBooking, } from "../controllers/bookingController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();
router.post("/", protect, createBooking);
router.delete("/:id", protect, cancelBooking);
export default router;
//# sourceMappingURL=bookingRoutes.js.map