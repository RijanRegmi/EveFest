import express from "express";
import {
  getGroupChatMessages,
  postGroupChatMessage,
} from "../controllers/groupChatController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

// Support both /api/chat/:eventId and /api/chat/event/:eventId
router
  .route(["/:eventId", "/event/:eventId"])
  .get(protect, getGroupChatMessages)
  .post(protect, postGroupChatMessage);

export default router;
