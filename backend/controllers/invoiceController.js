import Counter from '../models/Counter.js';

// Saal India ke time (IST) se, taaki 31 Dec raat ko saal galat na ho
const currentYearIST = () =>
  new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric' }).format(new Date());

const bumpCounter = key =>
  Counter.findOneAndUpdate(
    { _id: key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

// @route   POST /api/admin/invoices/next-number   (Admin)
// Har call par number +1 hota hai. $inc atomic hai, isliye number kabhi repeat nahi hota.
export const getNextInvoiceNumber = async (req, res, next) => {
  try {
    const year = currentYearIST();
    const key = `invoice-${year}`;

    let counter;
    try {
      counter = await bumpCounter(key);
    } catch (err) {
      // Saal ki pehli invoice par do request ek saath aayein to ek baar duplicate key aa sakta hai
      if (err.code === 11000) counter = await bumpCounter(key);
      else throw err;
    }

    const invoiceNo = `INV-${year}-${String(counter.seq).padStart(4, '0')}`;
    res.status(200).json({ success: true, data: { invoiceNo } });
  } catch (error) {
    next(error);
  }
};