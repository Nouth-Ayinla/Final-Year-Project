const mongoose = require('mongoose');

const { Schema } = mongoose;

const wardSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    lga: { type: Schema.Types.ObjectId, ref: 'Lga', required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

wardSchema.index({ lga: 1, code: 1 }, { unique: true });
wardSchema.index({ name: 1 });

module.exports = mongoose.model('Ward', wardSchema);
