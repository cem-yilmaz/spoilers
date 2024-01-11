const mongoose = require('mongoose');
const Spoiler = require('./spoiler');
const URL = require('./URL');

const partSchema = new mongoose.Schema({
  title: { type: String, required: true }
});

const mediaSchema = new mongoose.Schema({
  title: String,
  type: { type: String, required: true, enum: ['Video Game', 'TV Show', 'Film', 'Book', 'Sporting Event', 'Other'] },
  year: Number,
  parts: [partSchema],
  spoilers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Spoiler' }],
  urls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'URL' }]
});

mediaSchema.pre('remove', async function(next) {
  await Spoiler.deleteMany({ _id: { $in: this.spoilers } });
  await URL.deleteMany({ _id: { $in: this.urls } });
  next();
});

module.exports = mongoose.model('Media', mediaSchema);