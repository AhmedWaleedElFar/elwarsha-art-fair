import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  judgeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Judge',
    required: true,
  },
  artworkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artwork',
    required: true,
  },
  scores: {
    techniqueExecution: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    creativityOriginality: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    conceptMessage: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    aestheticImpact: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  category: {
    type: String,
    required: true,
    enum: ['Photography', 'Paintings', 'Digital Painting', 'Drawing'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Calculate total score before saving
voteSchema.pre('save', function(next) {
  const scores = this.scores;
  this.totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  next();
});

// Ensure one judge can only vote once per artwork
voteSchema.index({ judgeId: 1, artworkId: 1 }, { unique: true });

const Vote = mongoose.models.Vote || mongoose.model('Vote', voteSchema);

export default Vote;
