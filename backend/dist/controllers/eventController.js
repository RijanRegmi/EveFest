import * as eventService from "../services/eventService.js";
import Event from "../models/Event.js";
import Booking from "../models/Booking.js";
export const getEvents = async (req, res, next) => {
    try {
        const events = await eventService.getAllEvents();
        res.status(200).json(events);
    }
    catch (error) {
        res.status(500);
        next(error);
    }
};
export const createEvent = async (req, res, next) => {
    try {
        const body = { ...req.body };
        const files = req.files;
        if (files?.banner?.[0]) {
            body.image = `/uploads/events/${files.banner[0].filename}`;
        }
        if (files?.logo?.[0]) {
            body.logo = `/uploads/logos/${files.logo[0].filename}`;
        }
        if (req.file) {
            body.image = `/uploads/events/${req.file.filename}`;
        }
        const event = await eventService.createEvent(body, req.user._id.toString(), req.user.name);
        res.status(201).json(event);
    }
    catch (error) {
        res.status(400);
        next(error);
    }
};
export const getEventById = async (req, res, next) => {
    try {
        const event = await eventService.getEventById(String(req.params.id));
        if (!event) {
            res.status(404);
            return next(new Error("Event not found"));
        }
        res.status(200).json(event);
    }
    catch (error) {
        const err = error;
        if (err.name === "CastError") {
            res.status(400);
            return next(new Error("Invalid Event ID format"));
        }
        res.status(500);
        next(error);
    }
};
export const updateEvent = async (req, res, next) => {
    try {
        const body = { ...req.body };
        const files = req.files;
        if (files?.banner?.[0]) {
            body.image = `/uploads/events/${files.banner[0].filename}`;
        }
        if (files?.logo?.[0]) {
            body.logo = `/uploads/logos/${files.logo[0].filename}`;
        }
        if (req.file) {
            body.image = `/uploads/events/${req.file.filename}`;
        }
        const event = await eventService.updateEvent(String(req.params.id), req.user._id.toString(), body);
        res.status(200).json(event);
    }
    catch (error) {
        const err = error;
        if (err.message.includes("not authorized")) {
            res.status(403);
        }
        else if (err.message === "Event not found") {
            res.status(404);
        }
        else {
            res.status(400);
        }
        next(error);
    }
};
export const deleteEvent = async (req, res, next) => {
    try {
        await eventService.deleteEvent(String(req.params.id), req.user._id.toString());
        res.status(200).json({ message: "Event deleted successfully" });
    }
    catch (error) {
        const err = error;
        if (err.message.includes("not authorized")) {
            res.status(403);
        }
        else if (err.message === "Event not found") {
            res.status(404);
        }
        else {
            res.status(400);
        }
        next(error);
    }
};
export const uploadEventImages = async (req, res, next) => {
    try {
        const result = {};
        const files = req.files;
        if (files?.banner?.[0]) {
            result.imageUrl = `/uploads/events/${files.banner[0].filename}`;
        }
        if (files?.logo?.[0]) {
            result.logoUrl = `/uploads/logos/${files.logo[0].filename}`;
        }
        if (!result.imageUrl && !result.logoUrl) {
            res.status(400);
            return next(new Error("No files were uploaded"));
        }
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500);
        next(error);
    }
};
export const getEventStats = async (req, res, next) => {
    try {
        const liveEventsCount = await Event.countDocuments({
            isTakedown: { $ne: true },
        });
        const ticketsIssuedCount = await Booking.countDocuments({});
        const uniqueHosts = await Event.distinct("hostName", {
            isTakedown: { $ne: true },
        });
        const societiesOnboardCount = uniqueHosts.length;
        res.status(200).json({
            liveEvents: liveEventsCount,
            ticketsIssued: ticketsIssuedCount,
            societiesOnboard: societiesOnboardCount,
        });
    }
    catch (error) {
        res.status(500);
        next(error);
    }
};
//# sourceMappingURL=eventController.js.map