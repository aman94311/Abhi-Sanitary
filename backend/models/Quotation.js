import mongoose from 'mongoose';

const quotationItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name: { type: String, required: true },
    variantName: { type: String, default: '' },
    requestedQuantity: { type: Number, required: true, min: 1 },
    estimatedUnitPrice: { type: Number, default: 0 },
    quotedUnitPrice: { type: Number, default: 0 },
  },
  { _id: true }
);

const quotationSchema = new mongoose.Schema(
  {
    quoteNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customerType: {
      type: String,
      enum: ['Individual', 'Contractor', 'Painter', 'Plumber', 'Builder / Developer'],
      default: 'Individual',
    },
    projectLocation: {
      type: String,
      default: '',
    },
    requirementsNotes: {
      type: String,
      default: '',
    },
    items: [quotationItemSchema],
    totalQuotedPrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Quoted', 'Accepted', 'Rejected'],
      default: 'Submitted',
    },
    adminNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Quotation = mongoose.model('Quotation', quotationSchema);

export default Quotation;
