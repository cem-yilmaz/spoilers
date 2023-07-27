const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: String,
  type: { type: String, required: true, enum: ['Video Game', 'TV Show', 'Film', 'Book', 'Sporting Event', 'Other'] },
  spoilers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Spoiler' }]
});

module.exports = mongoose.model('Media', mediaSchema);