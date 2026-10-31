import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  MessageCircle,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

const Footer = () => {
  const { shopSettings } = useShop();

  const whatsappNumber =
    import.meta.env.VITE_WHATSAPP_NUMBER ||
    shopSettings.whatsapp?.replace(/[^0-9]/g, '') ||
    '919876543210';

  return (
    <footer className="bg-navy-950 text-slate-300 pt-12 pb-6 border-t border-navy-800">
      
      {/* 4 Columns (Mockup Exact Layout) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
          
          {/* Col 1: Shop Name & Location */}
          <div className="space-y-3">
            <h3 className="text-white font-extrabold text-base tracking-tight">
              {shopSettings.shopName || 'Abhi Paints & Sanitary'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
              Paints & Sanitary products for homes, contractors and builders.
            </p>

            <div className="space-y-2 text-xs text-slate-400 pt-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-brandOrange-500 shrink-0 mt-0.5" />
                <span>{'Singra Khurd daltonganj,palamu near nh 75'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brandOrange-500 shrink-0" />
                <a href={`tel:${shopSettings.phone}`} className="hover:text-white transition">
                  { '+91 6299739653,9431176863'}
                </a>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-2 pt-2">
              <span className="w-7 h-7 rounded-full bg-navy-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center cursor-pointer transition">
                f
              </span>
              <span className="w-7 h-7 rounded-full bg-navy-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center cursor-pointer transition">
                in
              </span>
              <span className="w-7 h-7 rounded-full bg-navy-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center cursor-pointer transition">
                ig
              </span>
              <span className="w-7 h-7 rounded-full bg-navy-800 hover:bg-slate-700 text-xs font-bold flex items-center justify-center cursor-pointer transition">
                tw
              </span>
            </div>
          </div>

          {/* Col 2: Shop Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/category/paints" className="hover:text-white transition">
                  Paints
                </Link>
              </li>
              <li>
                <Link to="/category/sanitary" className="hover:text-white transition">
                  Sanitary
                </Link>
              </li>
              <li>
                <Link to="/quote" className="hover:text-white transition">
                  Request a Quote
                </Link>
              </li>
              <li>
                <Link to="/orders" className="hover:text-white transition">
                  My Orders
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Policies Links */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Policies</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link to="/return-policy" className="hover:text-white transition">
                  Return Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-white transition">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-white transition">
                  Shipping & Delivery
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Need Help? & WhatsApp Button (Mockup Design) */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-wider">Need help?</h4>
            <p className="text-xs text-slate-400">
              Ask about availability, pricing or bulk orders.
            </p>

            <a
              href={`https://wa.me/${whatsappNumber}?text=Hi%2C%20I%20need%20help%20with%20products%20at%20Abhi%20Paints%20%26%20Sanitary.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-brandOrange-500 hover:bg-brandOrange-600 text-white rounded-lg text-xs font-bold shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>

        </div>
      </div>

      {/* Bottom Copyright & Razorpay badge */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-navy-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p>
          &copy; {new Date().getFullYear()} {shopSettings.shopName || 'Abhi Paints & Sanitary'}. All rights reserved.
        </p>
        <span className="text-slate-400">Secure payments by Razorpay</span>
      </div>

      {/* Disclaimer from mockup */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 text-center text-[10px] text-slate-600 tracking-wider uppercase">
        Online Storefront & Inventory Management System for Physical Shop
      </div>
    </footer>
  );
};

export default Footer;
