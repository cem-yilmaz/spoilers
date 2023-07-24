const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: String,
  type: { type: String, required: true, enum: ['Video Game', 'TV Show', 'Film', 'Book', 'Sporting Event', 'Other'] },
  // add more fields as necessary
});

module.exports = mongoose.model('Media', mediaSchema);