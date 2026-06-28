const mongoose = require('mongoose');

const { ELECTION_STATUSES } = require('./shared/enums');
const { dateWindowSchema } = require('./shared/schemas');

const { Schema } = mongoose;

const electionSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    officeType: {
      type: String,
      required: true,
      enum: ['GOVERNORSHIP'],
      default: 'GOVERNORSHIP',
    },
    state: { type: String, required: true, default: 'Ondo', trim: true },
    description: { type: String, trim: true },
    electionDate: { type: Date, required: true },
    registrationWindow: { type: dateWindowSchema },
    votingWindow: { type: dateWindowSchema, required: true },
    status: { type: String, enum: ELECTION_STATUSES, default: 'DRAFT', index: true },
    rules: {
      allowOneVotePerVoter: { type: Boolean, default: true },
      requireFaceVerification: { type: Boolean, default: true },
      requireFingerprintVerification: { type: Boolean, default: false },
      allowResultsBeforeClose: { type: Boolean, default: false },
    },
    publishedAt: { type: Date },
    closedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    publishedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true }
);

electionSchema.index({ status: 1, electionDate: -1 });

module.exports = mongoose.model('Election', electionSchema);
