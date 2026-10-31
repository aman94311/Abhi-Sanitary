import mongoose from 'mongoose';

const shopSettingsSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      default: 'Abhi Paints & Sanitary',
    },
    tagline: {
      type: String,
      default: 'Your One-Stop Shop for Premium Paints & Sanitary Ware',
    },
    phone: {
      type: String,
      default: '+919876543210',
    },
    whatsapp: {
      type: String,
      default: '+919876543210',
    },
    email: {
      type: String,
      default: 'contact@abhisanitary.com',
    },
    address: {
      type: String,
      default: 'Main Market Road, Opposite Civil Hospital, Sector 4, Varanasi, UP - 221001',
    },
    deliveryCharge: {
      type: Number,
      default: 99,
    },
    freeDeliveryThreshold: {
      type: Number,
      default: 1999,
    },
    announcementBar: {
      enabled: { type: Boolean, default: true },
      text: { type: String, default: 'Festive Season Offer: Flat 15% OFF on Asian Paints & Luxury Sanitaryware! Free local delivery on orders above ₹1,999.' },
    },
  },
  {
    timestamps: true,
  }
);

const ShopSettings = mongoose.model('ShopSettings', shopSettingsSchema);

export default ShopSettings;
