import { Request, Response } from "express";
/**
 * GET /api/chat/:eventId
 * Returns all group chat messages for an event.
 * Requires: user must be a registered attendee (have a booking for this event) or the event host.
 */
export declare const getGroupMessages: (req: Request, res: Response) => Promise<void>;
/**
 * POST /api/chat/:eventId
 * Send a group chat message.
 * Requires: user must be a registered attendee or the event host.
 */
export declare const sendGroupMessage: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=groupChatController.d.ts.map