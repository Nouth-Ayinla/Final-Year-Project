const mongoose = require('mongoose');

const { ADMIN_ROLES } = require('./shared/enums');

const { Schema } = mongoose;

const adminUserSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ADMIN_ROLES, required: true },
    assignedLgas: [{ type: Schema.Types.ObjectId, ref: 'Lga' }],
    isActive: { type: Boolean, default: true },
    twoFactorEnabled: { type: Boolean, default: false },
    passwordChangeRequired: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

adminUserSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model('AdminUser', adminUserSchema);
