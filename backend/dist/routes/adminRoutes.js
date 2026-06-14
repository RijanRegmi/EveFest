import express from "express";
import User from "../models/User.js";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
import { protect } from "../middlewares/authMiddleware.js";
import { admin } from "../middlewares/adminMiddleware.js";
const router = express.Router();
// Apply auth & admin checks to all routes
router.use(protect, admin);
// 1. User CRUD: GET all users
router.get("/users", async (_req, res, next) => {
    try {
        const users = await User.find({}).select("-password");
        res.status(200).json(users);
    }
    catch (error) {
        next(error);
    }
});
// 2. User CRUD: CREATE user
router.post("/users", async (req, res, next) => {
    try {
        const { name, username, email, phoneNumber, password, role } = req.body;
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            res.status(400).json({ message: "Email is already registered" });
            return;
        }
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
            res.status(400).json({ message: "Username is already registered" });
            return;
        }
        const newUser = await User.create({
            name,
            username,
            email,
            phoneNumber,
            password,
            role: role || "user",
        });
        res.status(201).json({
            _id: newUser._id,
            name: newUser.name,
            username: newUser.username,
            email: newUser.email,
            phoneNumber: newUser.phoneNumber,
            role: newUser.role,
        });
    }
    catch (error) {
        res.status(400);
        next(error);
    }
});
// 3. User CRUD: UPDATE user
router.put("/users/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const body = req.body;
        user.name = body.name || user.name;
        user.username = body.username || user.username;
        user.email = body.email || user.email;
        user.phoneNumber = body.phoneNumber || user.phoneNumber;
        user.role = body.role || user.role;
        if (body.password) {
            user.password = body.password;
        }
        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            username: updatedUser.username,
            email: updatedUser.email,
            phoneNumber: updatedUser.phoneNumber,
            role: updatedUser.role,
        });
    }
    catch (error) {
        res.status(400);
        next(error);
    }
});
// 4. User CRUD: DELETE user
router.delete("/users/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Prevent deleting oneself
        if (user._id.toString() === req.user._id.toString()) {
            res
                .status(400)
                .json({ message: "You cannot delete your own admin account" });
            return;
        }
        await Booking.deleteMany({ user: user._id });
        await Event.deleteMany({ hostId: user._id });
        await User.deleteOne({ _id: user._id });
        res
            .status(200)
            .json({ message: "User and associated data deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
// 5. Event soft takedown with reason
router.post("/events/:id/takedown", async (req, res, next) => {
    try {
        const { reason } = req.body;
        if (!reason || reason.trim().length < 8) {
            res.status(400).json({
                message: "A detailed moderation reason is required (min 8 characters)",
            });
            return;
        }
        const event = await Event.findById(req.params.id);
        if (!event) {
            res.status(404).json({ message: "Event not found" });
            return;
        }
        event.isTakedown = true;
        event.takedownReason = reason.trim();
        await event.save();
        res.status(200).json({ message: "Event taken down successfully", event });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=adminRoutes.js.map