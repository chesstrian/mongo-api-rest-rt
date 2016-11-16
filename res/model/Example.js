import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export default mongoose.model('example', new Schema({
  number: Number,
  string: String,
  boolean: Boolean
}, {
  collection: 'example'
}));
