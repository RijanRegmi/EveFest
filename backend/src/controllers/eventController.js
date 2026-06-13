import * as eventService from "../services/eventService.js";
import path from "path";

export const getEvents = async (req, res, next) => {
  try {
    const events = await eventService.getAllEvents();
    res.status(200).json(events);
  } catch (error) {
    res.status(500);
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    // Files can be attached by multer (banner, logo)
    const body = { ...req.body };

    if (req.files?.banner?.[0]) {
      body.image = `/uploads/events/${req.files.banner[0].filename}`;
    }
    if (req.files?.logo?.[0]) {
      body.logo = `/uploads/logos/${req.files.logo[0].filename}`;
    }
    // Single file upload fallback
    if (req.file) {
      body.image = `/uploads/events/${req.file.filename}`;
    }

    const event = await eventService.createEvent(body, req.user._id, req.user.name);
    res.status(201).json(event);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    if (!event) {
      res.status(404);
      return next(new Error("Event not found"));
    }
    res.status(200).json(event);
  } catch (error) {
    if (error.name === "CastError") {
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

    // Attach uploaded file URLs if present
    if (req.files?.banner?.[0]) {
      body.image = `/uploads/events/${req.files.banner[0].filename}`;
    }
    if (req.files?.logo?.[0]) {
      body.logo = `/uploads/logos/${req.files.logo[0].filename}`;
    }
    if (req.file) {
      body.image = `/uploads/events/${req.file.filename}`;
    }

    const event = await eventService.updateEvent(req.params.id, req.user._id, body);
    res.status(200).json(event);
  } catch (error) {
    if (error.message.includes("not authorized")) {
      res.status(403);
    } else if (error.message === "Event not found") {
      res.status(404);
    } else {
      res.status(400);
    }
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    await eventService.deleteEvent(req.params.id, req.user._id);
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    if (error.message.includes("not authorized")) {
      res.status(403);
    } else if (error.message === "Event not found") {
      res.status(404);
    } else {
      res.status(400);
    }
    next(error);
  }
};

// Upload banner/logo images — returns URL(s) to use in form
export const uploadEventImages = async (req, res, next) => {
  try {
    const result = {};
    if (req.files?.banner?.[0]) {
      result.imageUrl = `/uploads/events/${req.files.banner[0].filename}`;
    }
    if (req.files?.logo?.[0]) {
      result.logoUrl = `/uploads/logos/${req.files.logo[0].filename}`;
    }
    if (!result.imageUrl && !result.logoUrl) {
      res.status(400);
      return next(new Error("No files were uploaded"));
    }
    res.status(200).json(result);
  } catch (error) {
    res.status(500);
    next(error);
  }
};
