import express from "express";
import { getGroupMessages, sendGroupMessage, } from "../controllers/groupChatController.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();
// GET /api/chat/:eventId  — fetch all messages for an event
router.get("/:eventId", protect, getGroupMessages);
// POST /api/chat/:eventId — send a message to event group chat
router.post("/:eventId", protect, sendGroupMessage);
export default router;
//# sourceMappingURL=chatRoutes.js.map