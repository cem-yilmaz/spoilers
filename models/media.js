const mongoose = require('mongoose');

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

module.exports = mongoose.model('Media', mediaSchema);