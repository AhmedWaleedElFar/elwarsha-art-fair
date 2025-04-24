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
    creativity: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    technique: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    artisticVision: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    overallImpact: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
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

// Calculate average score before saving
voteSchema.pre('save', function(next) {
  const scores = this.scores;
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);
  this.averageScore = totalScore / Object.keys(scores).length;
  next();
});

// Ensure one judge can only vote once per artwork
voteSchema.index({ judgeId: 1, artworkId: 1 }, { unique: true });

const Vote = mongoose.models.Vote || mongoose.model('Vote', voteSchema);

export default Vote;
