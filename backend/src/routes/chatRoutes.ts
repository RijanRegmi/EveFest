import express from "express";
import {
  getGroupChatMessages,
  postGroupChatMessage,
} from "../controllers/groupChatController";
import { protect } from "../middlewares/authMiddleware";

const router = express.Router();

router
  .route("/event/:eventId")
  .get(protect, getGroupChatMessages)
  .post(protect, postGroupChatMessage);

export default router;
