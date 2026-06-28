const mongoose = require('mongoose');

const { fileAssetSchema } = require('./shared/schemas');

const { Schema } = mongoose;

const partySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    acronym: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    logo: { type: fileAssetSchema },
    color: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

partySchema.index({ acronym: 1 }, { unique: true });
partySchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('Party', partySchema);
