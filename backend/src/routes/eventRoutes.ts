import express from "express";
import {
  getEvents,
  createEvent,
  getEventById,
  updateEvent,
  deleteEvent,
  uploadEventImages,
  getEventStats,
} from "../controllers/eventController";
import { protect } from "../middlewares/authMiddleware";
import { uploadEventImages as uploadMiddleware } from "../middlewares/uploadMiddleware";

const router = express.Router();

router.route("/").get(getEvents).post(protect, uploadMiddleware, createEvent);
router.post("/upload-images", protect, uploadMiddleware, uploadEventImages);
router.get("/stats", getEventStats);
router
  .route("/:id")
  .get(getEventById)
  .put(protect, uploadMiddleware, updateEvent)
  .delete(protect, deleteEvent);

export default router;
