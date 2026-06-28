const mongoose = require('mongoose');

const { BIOMETRIC_STATUSES, VOTER_STATUSES } = require('./shared/enums');
const { addressSchema } = require('./shared/schemas');

const { Schema } = mongoose;

const voterSchema = new Schema(
  {
    voterId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    ninHash: { type: String, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    otherNames: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, lowercase: true, trim: true },
    address: { type: addressSchema },
    lga: { type: Schema.Types.ObjectId, ref: 'Lga', required: true, index: true },
    ward: { type: Schema.Types.ObjectId, ref: 'Ward', required: true, index: true },
    pollingUnit: { type: Schema.Types.ObjectId, ref: 'PollingUnit', required: true },
    status: { type: String, enum: VOTER_STATUSES, default: 'PENDING_REVIEW', index: true },
    biometricStatus: {
      type: String,
      enum: BIOMETRIC_STATUSES,
      default: 'NOT_ENROLLED',
      index: true,
    },
    registeredBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

voterSchema.index({ lga: 1, ward: 1, status: 1 });
voterSchema.index({ lastName: 1, firstName: 1 });

module.exports = mongoose.model('Voter', voterSchema);
