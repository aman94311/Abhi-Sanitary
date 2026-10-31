import React from 'react';
import { MessageCircle } from 'lucide-react';
import { useShop } from '../../context/ShopContext';

const WhatsAppButton = () => {
  const { shopSettings } = useShop();

  const whatsappNumber =
    import.meta.env.VITE_WHATSAPP_NUMBER ||
    shopSettings.whatsapp?.replace(/[^0-9]/g, '') ||
    '919876543210';

  const defaultMessage = encodeURIComponent(
    'Hello Abhi Paints & Sanitary! I am visiting your website and have an inquiry regarding product availability and prices.'
  );

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 sm:p-4 rounded-full shadow-2xl flex items-center gap-2 group transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-400/50"
      aria-label="Chat on WhatsApp"
      title="Chat with Store Support on WhatsApp"
    >
      <MessageCircle className="w-6 h-6 fill-current" />
      <span className="hidden sm:inline-block max-w-0 overflow-hidden whitespace-nowrap font-medium text-xs sm:text-sm group-hover:max-w-xs transition-all duration-300 ease-in-out pr-1">
        Chat with us
      </span>
      {/* Online indicator ping */}
      <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3.5 w-3.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300"></span>
      </span>
    </a>
  );
};

export default WhatsAppButton;
