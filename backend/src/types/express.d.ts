declare global {
  namespace Express {
    interface Request {
      user?: import("../models/User").IUserDocument;
    }
  }
}

declare module "express-serve-static-core" {
  interface Request {
    user?: import("../models/User").IUserDocument;
  }
}

export {};
