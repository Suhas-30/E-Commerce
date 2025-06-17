import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: String,
  items: [
    {
      productId: String,
      productname:String,
      quantity: Number
    }
  ],
  totalAmount: Number,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Order', orderSchema);
