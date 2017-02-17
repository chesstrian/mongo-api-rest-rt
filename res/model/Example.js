import mongoose from 'mongoose';

mongoose.Promise = global.Promise;

const Schema = mongoose.Schema;

export default mongoose.model('example', new Schema({
  number: Number,
  string: String,
  boolean: Boolean
}, {
  collection: 'example'
}));
