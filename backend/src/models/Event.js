import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      maxlength: 2000,
      default: '',
    },
    category: {
      type: String,
      enum: ['club', 'party', 'study', 'sport', 'seminar', 'hackathon', 'other'],
      default: 'other',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    locationName: {
      type: String,
      trim: true,
      default: '',
    },
    campus: {
      type: String,
      default: '',
    },
    university: {
      type: String,
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    attendees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    maxAttendees: {
      type: Number,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    onlineLink: {
      type: String,
      default: '',
    },
    tags: [{ type: String, trim: true }],
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

eventSchema.virtual('attendeeCount').get(function () {
  return this.attendees?.length ?? 0;
});

eventSchema.virtual('isFull').get(function () {
  if (!this.maxAttendees) return false;
  return this.attendees.length >= this.maxAttendees;
});

eventSchema.index({ university: 1, startDate: 1 });
eventSchema.index({ campus: 1, startDate: 1 });
eventSchema.index({ creator: 1 });

const Event = mongoose.model('Event', eventSchema);
export default Event;
