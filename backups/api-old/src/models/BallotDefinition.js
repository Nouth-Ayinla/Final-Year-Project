const mongoose = require('mongoose');

const { BALLOT_STATUSES } = require('./shared/enums');

const { Schema } = mongoose;

const ballotCandidateSchema = new Schema(
  {
    candidate: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true },
    party: { type: Schema.Types.ObjectId, ref: 'Party', required: true },
    displayOrder: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const ballotDefinitionSchema = new Schema(
  {
    election: { type: Schema.Types.ObjectId, ref: 'Election', required: true, index: true },
    title: { type: String, required: true, trim: true },
    version: { type: Number, required: true, default: 1, min: 1 },
    status: { type: String, enum: BALLOT_STATUSES, default: 'DRAFT', index: true },
    candidates: {
      type: [ballotCandidateSchema],
      validate: {
        validator(value) {
          return value.length >= 2;
        },
        message: 'A ballot should contain at least two candidates.',
      },
    },
    publishedAt: { type: Date },
    publishedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser' },
  },
  { timestamps: true }
);

ballotDefinitionSchema.index({ election: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('BallotDefinition', ballotDefinitionSchema);
