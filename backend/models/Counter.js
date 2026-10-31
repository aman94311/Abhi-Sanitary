import mongoose from 'mongoose';

// Har counter ka ek document: _id = "invoice-2026", seq = ab tak ka last number
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', counterSchema);

export default Counter;