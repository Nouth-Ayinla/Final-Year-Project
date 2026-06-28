const mongoose = require('mongoose');

const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    line1: { type: String, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true, default: 'Ondo' },
    country: { type: String, trim: true, default: 'Nigeria' },
  },
  { _id: false }
);

const fileAssetSchema = new Schema(
  {
    url: { type: String, trim: true },
    publicId: { type: String, trim: true },
    mimeType: { type: String, trim: true },
  },
  { _id: false }
);

const geoPointSchema = new Schema(
  {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  { _id: false }
);

const dateWindowSchema = new Schema(
  {
    startsAt: { type: Date },
    endsAt: { type: Date },
  },
  { _id: false }
);

module.exports = {
  addressSchema,
  dateWindowSchema,
  fileAssetSchema,
  geoPointSchema,
};
