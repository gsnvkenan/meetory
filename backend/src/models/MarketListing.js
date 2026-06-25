import mongoose from 'mongoose';

const marketListingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      maxlength: 1500,
      default: '',
    },
    category: {
      type: String,
      enum: ['notes', 'book', 'electronics', 'clothing', 'furniture', 'other'],
      required: true,
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    condition: {
      type: String,
      enum: ['new', 'like_new', 'good', 'fair', 'poor'],
      default: 'good',
    },
    images: [{ type: String }],
    university: {
      type: String,
      default: '',
    },
    campus: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'sold', 'reserved', 'deleted'],
      default: 'active',
    },
    interestedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

marketListingSchema.index({ university: 1, status: 1 });
marketListingSchema.index({ seller: 1 });
marketListingSchema.index({ category: 1 });

const MarketListing = mongoose.model('MarketListing', marketListingSchema);
export default MarketListing;
