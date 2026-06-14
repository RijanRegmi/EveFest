import { Request, Response, NextFunction } from "express";
export declare const getEvents: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createEvent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getEventById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateEvent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteEvent: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const uploadEventImages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getEventStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=eventController.d.ts.map