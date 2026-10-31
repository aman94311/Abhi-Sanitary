import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpayInstance = null;

if (keyId && keySecret && keyId !== 'your_razorpay_key_id_here') {
  try {
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
    console.log('[Razorpay] Initialized with live/test API keys');
  } catch (err) {
    console.warn('[Razorpay] Initialization warning:', err.message);
  }
} else {
  console.log('[Razorpay] Running in simulated test mode (replace RAZORPAY_KEY_ID & SECRET in .env for production)');
}

export default razorpayInstance;
