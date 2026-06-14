export const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    }
    else {
        res
            .status(403)
            .json({ message: "Access denied: Administrator privileges required" });
    }
};
//# sourceMappingURL=adminMiddleware.js.map