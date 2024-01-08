const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const URLSchema = new Schema({
  video_id: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return v.length == 11; // Must be 11 characters long
      },
      message: props => `${props.value} is not a valid video ID!`
    }
  },
  media: { type: Schema.Types.ObjectId, ref: 'Media', required: true },
  spoiler: { type: Schema.Types.ObjectId, ref: 'Spoiler', required: true },
  description: { type: String }
});

module.exports = mongoose.model('URL', URLSchema);