import { Request, Response, NextFunction } from "express";
/**
 * GET /api/direct-messages/event/:eventId
 * Retrieve direct support messages for an event.
 * If requesting user is the host: returns all direct messages for this event.
 * If requesting user is attendee: returns only direct messages between them and host.
 */
export declare const getDirectMessages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * POST /api/direct-messages/event/:eventId
 * Send a direct support message.
 */
export declare const sendDirectMessage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * PUT /api/direct-messages/seen/:eventId/:attendeeId
 * Mark all messages in a thread as seen.
 */
export declare const markThreadAsSeen: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=directMessageController.d.ts.map