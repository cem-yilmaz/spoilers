const mongoose = require('mongoose');

const SpoilerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  intensity: {
    type: String,
    required: true,
    enum: ['No Spoilers', 'Story Beats/Mild Spoilers', 'Major Spoilers']
  },
  reference: {
    type: String,
    required: true
  },
  media: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Media'
  },
  urls: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'URL'
  }]
});

module.exports = mongoose.model('Spoiler', SpoilerSchema);
