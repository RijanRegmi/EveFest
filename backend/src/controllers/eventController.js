import * as eventService from "../services/eventService.js";

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
    const event = await eventService.createEvent(req.body, req.user._id, req.user.name);
    res.status(201).json(event);
  } catch (error) {
    res.status(400);
    next(error);
  }
};
