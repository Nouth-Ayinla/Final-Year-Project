const mongoose = require('mongoose');

const { VOTE_STATUSES } = require('./shared/enums');

const { Schema } = mongoose;

const voteRecordSchema = new Schema(
  {
    election: { type: Schema.Types.ObjectId, ref: 'Election', required: true, index: true },
    ballot: { type: Schema.Types.ObjectId, ref: 'BallotDefinition', required: true },
    candidate: { type: Schema.Types.ObjectId, ref: 'Candidate', required: true, index: true },
    party: { type: Schema.Types.ObjectId, ref: 'Party', required: true },
    anonymousVoterTokenHash: { type: String, required: true },
    encryptedVotePayload: { type: String, trim: true },
    voteHash: { type: String, required: true, unique: true },
    status: { type: String, enum: VOTE_STATUSES, default: 'CAST', index: true },
    castAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

voteRecordSchema.index({ election: 1, anonymousVoterTokenHash: 1 }, { unique: true });
voteRecordSchema.index({ election: 1, candidate: 1, status: 1 });

module.exports = mongoose.model('VoteRecord', voteRecordSchema);
