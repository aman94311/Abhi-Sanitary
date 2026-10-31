import mongoose from 'mongoose';

const stockMovementSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    productName: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    changeQuantity: {
      type: Number,
      required: true,
    },
    updatedStock: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      enum: [
        'Online Sale',
        'Physical Shop Sale',
        'Restock / Purchase',
        'Damage / Breakage',
        'Inventory Audit / Adjustment',
        'Order Cancellation / Return',
      ],
      required: true,
    },
    referenceId: {
      type: String,
      default: '', // Order ID or In-Store Bill number
    },
    notes: {
      type: String,
      default: '',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const StockMovement = mongoose.model('StockMovement', stockMovementSchema);

export default StockMovement;
