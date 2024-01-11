const mongoose = require('mongoose');
const partSchema = require('./media').partSchema;
const URL = require('./URL');

const SpoilerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  intensity: { type: String, required: true, enum: ['No Spoilers', 'Story Beats/Mild Spoilers', 'Major Spoilers'] },
  reference: { type: String, required: true },
  media: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Media' },
  urls: [{ type: mongoose.Schema.Types.ObjectId, ref: 'URL' }],
  part: { type: mongoose.Schema.Types.ObjectId, ref: 'Part', default: null }
});

SpoilerSchema.pre('remove', async function(next) {
  // Cascade delete all the URLs associated with this spoiler
  await URL.deleteMany({ _id: { $in: this.urls } });
  next();
});

module.exports = mongoose.model('Spoiler', SpoilerSchema);
