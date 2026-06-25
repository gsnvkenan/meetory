import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
      trim: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const mediaSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], required: true },
  thumbnail: { type: String, default: '' },
});

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      maxlength: 2000,
      trim: true,
      default: '',
    },
    media: [mediaSchema],
    tags: [{ type: String, trim: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    visibility: {
      type: String,
      enum: ['public', 'followers', 'campus'],
      default: 'public',
    },
    university: {
      type: String,
      default: '',
    },
    campus: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.virtual('likeCount').get(function () {
  return this.likes?.length ?? 0;
});

postSchema.virtual('commentCount').get(function () {
  return this.comments?.length ?? 0;
});

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ university: 1, createdAt: -1 });
postSchema.index({ tags: 1 });

const Post = mongoose.model('Post', postSchema);
export default Post;
