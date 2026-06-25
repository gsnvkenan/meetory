import Event from '../models/Event.js';
import { getFileUrl } from '../middleware/upload.js';

// ─── Get all events (campus filtered) ────────────────────────────────────────
export const getEvents = async (req, res, next) => {
  try {
    const { university, category, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = {
      isPublic: true,
      startDate: { $gte: new Date() },
    };

    // Default to user's university if no param given
    filter.university = university || req.user.university;
    if (category) filter.category = category;

    const events = await Event.find(filter)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('creator', 'name username avatar')
      .populate('attendees', 'name username avatar');

    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      events,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get single event ─────────────────────────────────────────────────────────
export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('creator', 'name username avatar')
      .populate('attendees', 'name username avatar');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// ─── Create event ─────────────────────────────────────────────────────────────
export const createEvent = async (req, res, next) => {
  try {
    const {
      title, description, category, startDate, endDate,
      locationName, campus, maxAttendees, isOnline, onlineLink, tags,
    } = req.body;

    const coverImage = req.file ? getFileUrl(req.file) : '';

    const event = await Event.create({
      creator: req.user._id,
      title,
      description,
      category,
      startDate,
      endDate,
      locationName,
      campus: campus || req.user.location?.campus || '',
      university: req.user.university,
      coverImage,
      maxAttendees,
      isOnline: isOnline === 'true',
      onlineLink,
      tags: tags ? JSON.parse(tags) : [],
      attendees: [req.user._id],
    });

    await event.populate('creator', 'name username avatar');
    res.status(201).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// ─── Toggle attendance ────────────────────────────────────────────────────────
export const toggleAttend = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const userId = req.user._id;
    const isAttending = event.attendees.some((id) => String(id) === String(userId));

    if (isAttending) {
      event.attendees.pull(userId);
    } else {
      if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
        return res.status(400).json({ message: 'Event is full' });
      }
      event.attendees.addToSet(userId);
    }

    await event.save();
    res.json({ success: true, attending: !isAttending, attendeeCount: event.attendees.length });
  } catch (error) {
    next(error);
  }
};

// ─── Update event ─────────────────────────────────────────────────────────────
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (String(event.creator) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const allowedFields = [
      'title', 'description', 'category', 'startDate', 'endDate',
      'locationName', 'campus', 'maxAttendees', 'isOnline', 'onlineLink', 'tags',
    ];
    allowedFields.forEach((f) => {
      if (req.body[f] !== undefined) event[f] = req.body[f];
    });

    await event.save();
    res.json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

// ─── Delete event ─────────────────────────────────────────────────────────────
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (String(event.creator) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted' });
  } catch (error) {
    next(error);
  }
};
