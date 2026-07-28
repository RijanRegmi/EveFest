import express from "express";
import {
  getDirectMessages,
  sendDirectMessage,
  getConversations,
} from "../controllers/directMessageController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/conversations", protect, getConversations);
router.get("/:otherUserId", protect, getDirectMessages);
router.post("/:otherUserId", protect, sendDirectMessage);

export default router;
