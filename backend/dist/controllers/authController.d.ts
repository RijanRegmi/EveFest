import { Request, Response, NextFunction } from "express";
export declare const registerUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const loginUser: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const checkAvailability: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateUserProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map