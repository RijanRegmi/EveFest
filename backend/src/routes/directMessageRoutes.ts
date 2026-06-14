import express from "express";
import {
  getDirectMessages,
  sendDirectMessage,
  markThreadAsSeen,
} from "../controllers/directMessageController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All direct messages routes are protected
router.use(protect);

router.get("/event/:eventId", getDirectMessages);
router.post("/event/:eventId", sendDirectMessage);
router.put("/seen/:eventId/:attendeeId", markThreadAsSeen);

export default router;
