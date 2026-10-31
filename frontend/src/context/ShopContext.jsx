import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const ShopContext = createContext();

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};

export const ShopProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [shopSettings, setShopSettings] = useState({
    shopName: 'Abhi Paints & Sanitary',
    phone: '+919876543210',
    whatsapp: '919876543210',
    email: 'contact@abhisanitary.com',
    address: 'Main Market Road, Opposite Civil Hospital, Sector 4, Varanasi, UP - 221001',
    deliveryCharge: 99,
    freeDeliveryThreshold: 1999,
    announcementBar: {
      enabled: true,
      text: 'Festive Season Offer: Flat 15% OFF on Asian Paints & Luxury Sanitaryware! Free local delivery on orders above ₹1,999.',
    },
  });

  // Cart state persisted in localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('abhi_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state persisted in localStorage
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('abhi_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save Cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('abhi_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
    }
  }, [cart]);

  // Save Wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('abhi_wishlist', JSON.stringify(wishlist));
    } catch (err) {
      console.error('Failed to save wishlist to localStorage', err);
    }
  }, [wishlist]);

  // Fetch Categories & Settings on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setCategoriesLoading(true);
        const [catRes, setRes] = await Promise.allSettled([
          api.get('/categories'),
          api.get('/categories/settings/shop'),
        ]);

        if (catRes.status === 'fulfilled' && catRes.value.data?.success) {
          setCategories(catRes.value.data.data);
        }
        if (setRes.status === 'fulfilled' && setRes.value.data?.success) {
          setShopSettings(setRes.value.data.data);
        }
      } catch (err) {
        console.warn('Backend API connecting...', err.message);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Cart Management
  const addToCart = (product, variant = null, quantity = 1) => {
    setCart(prevCart => {
      const variantId = variant ? variant._id || variant.sku : null;
      const existingIndex = prevCart.findIndex(
        item => item.product._id === product._id && item.variantId === variantId
      );

      const price = variant
        ? (variant.discountPrice || variant.regularPrice)
        : (product.discountPrice || product.regularPrice);

      const variantName = variant ? variant.name : '';

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prevCart,
          {
            product,
            variantId,
            selectedVariantName: variantName,
            price,
            quantity,
          },
        ];
      }
    });
  };

  const removeFromCart = (productId, variantId = null) => {
    setCart(prevCart =>
      prevCart.filter(
        item => !(item.product._id === productId && item.variantId === variantId)
      )
    );
  };

  const updateCartQuantity = (productId, variantId = null, quantity = 1) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item => {
        if (item.product._id === productId && item.variantId === variantId) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const cartSubtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Wishlist Management
  const toggleWishlist = product => {
    setWishlist(prev => {
      const exists = prev.some(item => item._id === product._id);
      if (exists) {
        return prev.filter(item => item._id !== product._id);
      } else {
        return [...prev, product];
      }
    });
  };

  const isInWishlist = productId => {
    return wishlist.some(item => item._id === productId);
  };

  return (
    <ShopContext.Provider
      value={{
        categories,
        categoriesLoading,
        shopSettings,
        cart,
        cartCount,
        cartSubtotal,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist,
        isInWishlist,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};
