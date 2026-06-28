const mongoose = require('mongoose');

const { Schema } = mongoose;

const biometricProfileSchema = new Schema(
  {
    voter: { type: Schema.Types.ObjectId, ref: 'Voter', required: true, unique: true },
    faceTemplateRef: { type: String, trim: true },
    faceQualityScore: { type: Number, min: 0, max: 1 },
    faceEnrolledAt: { type: Date },
    fingerprintTemplateRef: { type: String, trim: true },
    fingerprintEnrolledAt: { type: Date },
    consent: {
      accepted: { type: Boolean, default: false },
      acceptedAt: { type: Date },
      version: { type: String, trim: true },
    },
    lastVerifiedAt: { type: Date },
    verificationFailureCount: { type: Number, default: 0, min: 0 },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, trim: true },
  },
  { timestamps: true }
);

biometricProfileSchema.index({ isFlagged: 1, updatedAt: -1 });

module.exports = mongoose.model('BiometricProfile', biometricProfileSchema);
