const mongoose = require('mongoose');

const { addressSchema, geoPointSchema } = require('./shared/schemas');

const { Schema } = mongoose;

const pollingUnitSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    lga: { type: Schema.Types.ObjectId, ref: 'Lga', required: true, index: true },
    ward: { type: Schema.Types.ObjectId, ref: 'Ward', required: true, index: true },
    address: { type: addressSchema },
    location: { type: geoPointSchema },
    registeredVoterCount: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

pollingUnitSchema.index({ ward: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('PollingUnit', pollingUnitSchema);
