import express from "express";
import {
  getEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  uploadEventImages,
} from "../controllers/eventController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadEventImages as uploadMiddleware } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// GET all events / POST create new event
router.route("/").get(getEvents).post(protect, uploadMiddleware, createEvent);

// Upload images only (returns URLs for use in form)
router.post("/upload-images", protect, uploadMiddleware, uploadEventImages);

// GET single event / PUT update event / DELETE event
router.route("/:id").get(getEventById).put(protect, uploadMiddleware, updateEvent).delete(protect, deleteEvent);

export default router;
