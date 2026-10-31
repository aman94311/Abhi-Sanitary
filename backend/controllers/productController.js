import mongoose from 'mongoose';
import Product from '../models/Product.js';
import { mockProducts } from '../utils/mockData.js';

// @desc    Get featured products for homepage
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find({ isFeatured: true, isActive: true })
        .limit(8)
        .sort({ createdAt: -1 });

      if (products.length > 0) {
        return res.status(200).json({
          success: true,
          count: products.length,
          data: products,
        });
      }
    }

    const featured = mockProducts.filter(p => p.isFeatured);
    res.status(200).json({
      success: true,
      count: featured.length,
      data: featured,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get best-selling products
// @route   GET /api/products/best-sellers
// @access  Public
export const getBestSellers = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find({ isBestSeller: true, isActive: true })
        .limit(8)
        .sort({ updatedAt: -1 });

      if (products.length > 0) {
        return res.status(200).json({
          success: true,
          count: products.length,
          data: products,
        });
      }
    }

    const best = mockProducts.filter(p => p.isBestSeller);
    res.status(200).json({
      success: true,
      count: best.length,
      data: best,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get new arrival products
// @route   GET /api/products/new-arrivals
// @access  Public
export const getNewArrivals = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find({ isNewArrival: true, isActive: true })
        .limit(8)
        .sort({ createdAt: -1 });

      if (products.length > 0) {
        return res.status(200).json({
          success: true,
          count: products.length,
          data: products,
        });
      }
    }

    const newItems = mockProducts.filter(p => p.isNewArrival);
    res.status(200).json({
      success: true,
      count: newItems.length,
      data: newItems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      subcategory,
      brand,
      minPrice,
      maxPrice,
      inStock,
      search,
      sort,
      page = 1,
      limit = 12,
    } = req.query;

    if (mongoose.connection.readyState === 1) {
      const query = { isActive: true };

      if (category && category !== 'all') {
        query.categorySlug = category.toLowerCase();
      }

      if (subcategory) {
        query.subcategorySlug = subcategory.toLowerCase();
      }

      if (brand) {
        const brands = brand.split(',').map(b => new RegExp(b.trim(), 'i'));
        query.brand = { $in: brands };
      }

      if (inStock === 'true') {
        query.stockQuantity = { $gt: 0 };
      }

      if (minPrice || maxPrice) {
        query.regularPrice = {};
        if (minPrice) query.regularPrice.$gte = Number(minPrice);
        if (maxPrice) query.regularPrice.$lte = Number(maxPrice);
      }

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { subcategory: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
        ];
      }

      let sortQuery = { createdAt: -1 };
      if (sort === 'price-low') sortQuery = { regularPrice: 1 };
      else if (sort === 'price-high') sortQuery = { regularPrice: -1 };
      else if (sort === 'rating') sortQuery = { ratingsAverage: -1 };
      else if (sort === 'name-asc') sortQuery = { name: 1 };

      const pageNumber = Math.max(1, parseInt(page, 10));
      const pageSize = Math.min(50, Math.max(1, parseInt(limit, 10)));
      const skip = (pageNumber - 1) * pageSize;

      const [products, totalProducts] = await Promise.all([
        Product.find(query).sort(sortQuery).skip(skip).limit(pageSize),
        Product.countDocuments(query),
      ]);

      if (totalProducts > 0) {
        return res.status(200).json({
          success: true,
          count: products.length,
          total: totalProducts,
          totalPages: Math.ceil(totalProducts / pageSize),
          currentPage: pageNumber,
          data: products,
        });
      }
    }

    // In-memory fallback
    let filtered = [...mockProducts];

    if (category && category !== 'all') {
      filtered = filtered.filter(p => p.categorySlug === category.toLowerCase());
    }

    if (subcategory) {
      filtered = filtered.filter(p => p.subcategorySlug === subcategory.toLowerCase());
    }

    if (inStock === 'true') {
      filtered = filtered.filter(p => p.stockQuantity > 0);
    }

    if (minPrice) {
      filtered = filtered.filter(p => (p.discountPrice || p.regularPrice) >= Number(minPrice));
    }

    if (maxPrice) {
      filtered = filtered.filter(p => (p.discountPrice || p.regularPrice) <= Number(maxPrice));
    }

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.subcategory.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }

    if (sort === 'price-low') {
      filtered.sort((a, b) => (a.discountPrice || a.regularPrice) - (b.discountPrice || b.regularPrice));
    } else if (sort === 'price-high') {
      filtered.sort((a, b) => (b.discountPrice || b.regularPrice) - (a.discountPrice || a.regularPrice));
    } else if (sort === 'rating') {
      filtered.sort((a, b) => b.ratingsAverage - a.ratingsAverage);
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      total: filtered.length,
      totalPages: 1,
      currentPage: 1,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
export const getProductBySlug = async (req, res, next) => {
  try {
    const slug = req.params.slug.toLowerCase();

    if (mongoose.connection.readyState === 1) {
      const product = await Product.findOne({ slug, isActive: true }).populate('category', 'name slug');
      if (product) {
        const related = await Product.find({
          categorySlug: product.categorySlug,
          _id: { $ne: product._id },
          isActive: true,
        }).limit(4);

        return res.status(200).json({ success: true, data: product, related });
      }
    }

    const fallbackProduct = mockProducts.find(p => p.slug === slug);
    if (!fallbackProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const related = mockProducts.filter(
      p => p.categorySlug === fallbackProduct.categorySlug && p.slug !== slug
    ).slice(0, 4);

    res.status(200).json({
      success: true,
      data: fallbackProduct,
      related,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get quick search suggestions
// @route   GET /api/products/search/suggestions
// @access  Public
export const getSearchSuggestions = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query || query.trim().length < 2) {
      return res.status(200).json({ success: true, suggestions: [] });
    }

    const q = query.trim();

    if (mongoose.connection.readyState === 1) {
      const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const suggestions = await Product.find({
        isActive: true,
        $or: [
          { name: { $regex: safe, $options: 'i' } },
          { brand: { $regex: safe, $options: 'i' } },
          { subcategory: { $regex: safe, $options: 'i' } },
        ],
      })
        .select('name slug brand subcategory images')
        .limit(6);

      return res.status(200).json({ success: true, suggestions });
    }

    const lower = q.toLowerCase();
    const suggestions = mockProducts
      .filter(
        p =>
          p.name.toLowerCase().includes(lower) ||
          p.brand.toLowerCase().includes(lower) ||
          p.subcategory.toLowerCase().includes(lower)
      )
      .slice(0, 6);

    res.status(200).json({ success: true, suggestions });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle featured status of a product
// @route   PATCH /api/products/:id/featured
// @access  Admin
export const toggleFeatured = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).select('isFeatured');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Seedha update: poore document ka validation nahi chalta
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { isFeatured: !product.isFeatured },
      { new: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};