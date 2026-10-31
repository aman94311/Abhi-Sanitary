import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const PolicyPage = () => {
  const location = useLocation();
  const { shopSettings } = useShop();

  let title = 'Store Policies';
  let content = null;

  if (location.pathname.includes('return')) {
    title = 'Return & Exchange Policy';
    content = (
      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>
          At <strong>{shopSettings.shopName}</strong>, we take immense pride in delivering 100% genuine paints and sanitary fittings.
        </p>
        <h3 className="text-base font-bold text-slate-900 pt-2">1. Paints & Tinted Colors</h3>
        <p>
          Custom machine-tinted paints mixed specifically to your chosen color code cannot be returned or exchanged once tinted, as per standard paint industry practice. Factory-packed white bases, primers, and standard unopened containers may be returned within 7 days of delivery with original seal intact.
        </p>
        <h3 className="text-base font-bold text-slate-900 pt-2">2. Sanitaryware, Basins & Faucets</h3>
        <p>
          Ceramic items must be inspected upon delivery. Any transit breakage must be reported to our delivery representative immediately or on WhatsApp within 24 hours. Faucets and bathroom accessories may be returned within 7 days in unopened original packaging with warranty cards intact.
        </p>
      </div>
    );
  } else if (location.pathname.includes('shipping')) {
    title = 'Local Shipping & Delivery Policy';
    content = (
      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>
          We operate a fleet of dedicated store transport vehicles for delivering heavy paint buckets, PVC pipe bundles, and fragile ceramic sanitaryware safely to your residence or construction site.
        </p>
        <h3 className="text-base font-bold text-slate-900 pt-2">Delivery Timelines</h3>
        <p>
          Orders placed before 2:00 PM are typically dispatched for same-day or next-day morning delivery within our standard delivery radius.
        </p>
        <h3 className="text-base font-bold text-slate-900 pt-2">Delivery Fees</h3>
        <p>
          Flat delivery of ₹{shopSettings.deliveryCharge} applies. Orders exceeding ₹{shopSettings.freeDeliveryThreshold} qualify for <strong>FREE Local Delivery</strong>!
        </p>
      </div>
    );
  } else {
    title = 'Privacy Policy & Terms of Service';
    content = (
      <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
        <p>
          Your personal contact details and order records are strictly protected. We never sell or share customer phone numbers or addresses with third parties.
        </p>
        <h3 className="text-base font-bold text-slate-900 pt-2">Payment Security</h3>
        <p>
          All online card, netbanking, and UPI transactions are securely processed through Razorpay using RBI-compliant 256-bit SSL encryption. We never store debit or credit card details on our servers.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-6">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline">
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Storefront</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{title}</h1>
        </div>

        {content}
      </div>
    </div>
  );
};

export default PolicyPage;
