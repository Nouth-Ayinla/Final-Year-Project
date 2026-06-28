const mongoose = require('mongoose');

const { Schema } = mongoose;

const lgaSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    state: { type: String, required: true, default: 'Ondo', trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

lgaSchema.index({ state: 1, code: 1 }, { unique: true });
lgaSchema.index({ name: 1 });

module.exports = mongoose.model('Lga', lgaSchema);
