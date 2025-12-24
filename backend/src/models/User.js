// File: backend/src/models/User.js

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  firstname:         String,
  lastname:          String,
  email:             String,
  password:          String,
  isVerified:        Boolean,
  verificationToken: String,
  registrationDate:  Date,
  lastLogin:         Date,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
});


export default mongoose.model('User', UserSchema);