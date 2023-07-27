const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const URLSchema = new Schema({
  url: { type: String, required: true },
  media: { type: Schema.Types.ObjectId, ref: 'Media', required: true },
  spoiler: { type: Schema.Types.ObjectId, ref: 'Spoiler', required: true },
  description: { type: String }
});

module.exports = mongoose.model('URL', URLSchema);