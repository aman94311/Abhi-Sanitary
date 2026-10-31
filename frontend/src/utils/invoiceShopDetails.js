const SHOP_KEY = 'abhi_invoice_shop_details_v2';
const COUNTER_KEY = 'abhi_invoice_counter';

export const DEFAULT_SHOP = {
  name: 'Abhi Sanitary and Hardware',
  gstin: '20OAJPS3384A1ZN',
  pan: 'OAJPS3384A',
  address: 'S/o Dinesh Shukla, Singraha Khurd, Singra Khurd, Palamu - 822102, Jharkhand',
  phone: '9431176863',
  email: '',
  stateName: 'Jharkhand',
  stateCode: '20',
  placeOfSupply: 'Jharkhand',
  invoicePrefix: 'AS-',
  bankDetails: '',
  terms: '',
};

export const loadShopDetails = () => {
  try {
    const raw = localStorage.getItem(SHOP_KEY);
    return raw ? { ...DEFAULT_SHOP, ...JSON.parse(raw) } : { ...DEFAULT_SHOP };
  } catch {
    return { ...DEFAULT_SHOP };
  }
};

export const saveShopDetails = (details) => {
  try {
    localStorage.setItem(SHOP_KEY, JSON.stringify(details));
  } catch (err) {
    console.warn('Could not save shop details:', err);
  }
};

const readCounter = () => {
  const year = new Date().getFullYear();
  try {
    const raw = localStorage.getItem(COUNTER_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && parsed.year === year) return parsed;
  } catch {
    /* ignore */
  }
  return { year, count: 0 };
};

export const getSuggestedInvoiceNo = () => {
  const prefix = loadShopDetails().invoicePrefix || '';
  const { year, count } = readCounter();
  return `${prefix}${year}-${String(count + 1).padStart(4, '0')}`;
};

// Number sirf tab aage badhta hai jab suggested number se download hua ho
export const markInvoiceDownloaded = (invoiceNo) => {
  if (invoiceNo !== getSuggestedInvoiceNo()) return;
  const { year, count } = readCounter();
  try {
    localStorage.setItem(COUNTER_KEY, JSON.stringify({ year, count: count + 1 }));
  } catch {
    /* ignore */
  }
};