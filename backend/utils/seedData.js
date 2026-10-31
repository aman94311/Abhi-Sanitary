import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import ShopSettings from '../models/ShopSettings.js';
import { mockCategories, mockShopSettings } from './mockData.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    await Category.deleteMany();
    await ShopSettings.deleteMany();

    // _id hata do taaki Mongo apna ObjectId bana de
    const categories = mockCategories.map(({ _id, ...rest }) => rest);
    await Category.insertMany(categories);
    await ShopSettings.create(mockShopSettings);

    console.log('Data seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();