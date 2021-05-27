const mongoose = require('mongoose')
const Schema = mongoose.Schema

const prefectureSchema = Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
    },
    area: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Area',
    },
  }
)

exports.Prefecture = mongoose.model('Prefecture', prefectureSchema)