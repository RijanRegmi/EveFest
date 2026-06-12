import express from "express";
import { getEvents, createEvent } from "../controllers/eventController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.route("/").get(getEvents).post(protect, createEvent);

export default router;
