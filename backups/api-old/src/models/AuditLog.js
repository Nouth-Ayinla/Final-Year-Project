const mongoose = require('mongoose');

const { Schema } = mongoose;

const auditLogSchema = new Schema(
  {
    actorType: {
      type: String,
      enum: ['ADMIN', 'VOTER', 'SYSTEM'],
      required: true,
      index: true,
    },
    actorId: { type: Schema.Types.ObjectId },
    action: { type: String, required: true, trim: true, index: true },
    resourceType: { type: String, required: true, trim: true },
    resourceId: { type: Schema.Types.ObjectId },
    election: { type: Schema.Types.ObjectId, ref: 'Election', index: true },
    ipAddress: { type: String, trim: true },
    userAgent: { type: String, trim: true },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { versionKey: false }
);

auditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
