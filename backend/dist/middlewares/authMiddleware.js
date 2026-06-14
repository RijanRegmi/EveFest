import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();
export const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user =
                (await User.findById(decoded.id).select("-password")) ?? undefined;
            if (!req.user) {
                res.status(401).json({ message: "User not found or session invalid" });
                return;
            }
            next();
        }
        catch (error) {
            const err = error;
            console.error("[Auth Middleware] Token verification failed:", err.message);
            res.status(401).json({ message: "Not authorized, token failed" });
            return;
        }
    }
    if (!token) {
        res.status(401).json({ message: "Not authorized, no token provided" });
        return;
    }
};
//# sourceMappingURL=authMiddleware.js.map