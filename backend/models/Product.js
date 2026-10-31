import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    regularPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    attributes: {
      size: { type: String, default: '' },
      color: { type: String, default: '' },
      finish: { type: String, default: '' },
      model: { type: String, default: '' },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      default: '',
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const specificationSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category reference is required'],
    },
    categorySlug: {
      type: String,
      required: true,
      enum: ['paints', 'sanitary'],
      lowercase: true,
    },
    subcategory: {
      type: String,
      required: [true, 'Subcategory is required'],
      trim: true,
    },
    subcategorySlug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    images: {
      type: [productImageSchema],
      validate: [val => val.length > 0, 'At least one product image is required'],
    },
    regularPrice: {
      type: Number,
      required: [true, 'Regular price is required'],
      min: 0,
    },
    discountPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      default: 0,
      min: 0,
    },
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    hasVariants: {
      type: Boolean,
      default: false,
    },
    variants: [variantSchema],
    specifications: [specificationSchema],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBestSeller: {
      type: Boolean,
      default: false,
    },
    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    ratingsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Search indexes for rapid text search
productSchema.index({
  name: 'text',
  brand: 'text',
  subcategory: 'text',
  description: 'text',
  sku: 'text',
});

// Compound indexes for fast filtering
productSchema.index({ categorySlug: 1, subcategorySlug: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isBestSeller: 1, isActive: 1 });
productSchema.index({ isNewArrival: 1, isActive: 1 });
productSchema.index({ regularPrice: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;