import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const judgeSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  categories: [{
    type: String,
    enum: ['Photography', 'Paintings', 'Digital Painting', 'Drawing'],
    required: true,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
});

// Hash password before saving
judgeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    console.log('Password not modified, skipping hash in save middleware');
    return next();
  }
  
  try {
    console.log('Hashing password in save middleware...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully in save middleware');
    next();
  } catch (error) {
    console.error('Error hashing password in save middleware:', error);
    next(error);
  }
});

// Hash password for findOneAndUpdate and findByIdAndUpdate
judgeSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update.password) {
    try {
      console.log('Hashing password in findOneAndUpdate middleware...');
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
      console.log('Password hashed successfully in findOneAndUpdate middleware');
      next();
    } catch (error) {
      console.error('Error hashing password in findOneAndUpdate middleware:', error);
      next(error);
    }
  } else {
    console.log('No password in update, skipping hash in findOneAndUpdate middleware');
    next();
  }
});

// Hash password for insertMany and create
judgeSchema.statics.createWithHashedPassword = async function(judgeData) {
  console.log('Creating judge with hashed password...');
  if (Array.isArray(judgeData)) {
    // Handle array of judges
    console.log('Processing array of judges...');
    const hashedJudges = await Promise.all(judgeData.map(async (judge) => {
      if (judge.password) {
        console.log('Hashing password for judge:', judge.username);
        const salt = await bcrypt.genSalt(10);
        judge.password = await bcrypt.hash(judge.password, salt);
        console.log('Password hashed successfully for judge:', judge.username);
      }
      return judge;
    }));
    console.log('Creating judges with hashed passwords...');
    return this.create(hashedJudges);
  } else {
    // Handle single judge
    console.log('Processing single judge:', judgeData.username);
    if (judgeData.password) {
      console.log('Hashing password for judge:', judgeData.username);
      const salt = await bcrypt.genSalt(10);
      judgeData.password = await bcrypt.hash(judgeData.password, salt);
      console.log('Password hashed successfully for judge:', judgeData.username);
    }
    console.log('Creating judge with hashed password...');
    return this.create(judgeData);
  }
};

// Method to compare password for login
judgeSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Update lastLoginAt when a judge logs in
judgeSchema.methods.updateLastLogin = function() {
  this.lastLoginAt = new Date();
  return this.save();
};

const Judge = mongoose.models.Judge || mongoose.model('Judge', judgeSchema);

export default Judge;
