const mongoose = require('mongoose');

const { Schema } = mongoose;

const voteReceiptSchema = new Schema(
  {
    voter: { type: Schema.Types.ObjectId, ref: 'Voter', required: true, index: true },
    election: { type: Schema.Types.ObjectId, ref: 'Election', required: true, index: true },
    receiptCode: { type: String, required: true, unique: true, trim: true },
    voteHash: { type: String, required: true, trim: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

voteReceiptSchema.index({ voter: 1, election: 1 }, { unique: true });

module.exports = mongoose.model('VoteReceipt', voteReceiptSchema);
