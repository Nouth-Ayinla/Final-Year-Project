const mongoose = require('mongoose');

const { CANDIDATE_STATUSES } = require('./shared/enums');
const { fileAssetSchema } = require('./shared/schemas');

const { Schema } = mongoose;

const candidateSchema = new Schema(
  {
    election: { type: Schema.Types.ObjectId, ref: 'Election', required: true, index: true },
    party: { type: Schema.Types.ObjectId, ref: 'Party', required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    deputyFullName: { type: String, trim: true },
    biography: { type: String, trim: true },
    photo: { type: fileAssetSchema },
    ballotOrder: { type: Number, required: true, min: 1 },
    status: { type: String, enum: CANDIDATE_STATUSES, default: 'DRAFT', index: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

candidateSchema.index({ election: 1, party: 1 }, { unique: true });
candidateSchema.index({ election: 1, ballotOrder: 1 }, { unique: true });

module.exports = mongoose.model('Candidate', candidateSchema);
