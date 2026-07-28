import { IUserDocument } from "../models/User.js";

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: IUserDocument;
  }
}

export {};
