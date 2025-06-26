import express from 'express';
import mongoose from 'mongoose';
import Cart from './models/Cart.js';
import Order from './models/Order.js';
import axios from 'axios';

import authenticate from './middleware/authMiddleware.js'; // 👈 Import middleware

const app = express();
app.use(express.json());

mongoose.connect('mongodb://mongo:27017/orderdb', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected (orderdb)"))
  .catch(err => console.error(err));

// 🛒 View cart by userId (🔐 protected)
app.get('/cart', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId });

    if (cart) {
      return res.json(cart);
    }

    return res.json({ userId, items: [] });
  } catch (err) {
    console.error('Error fetching cart:', err);
    res.status(500).json({ message: 'Error fetching cart' });
  }
});

// 🛒 Add to cart (🔐 protected)
app.post('/cart', authenticate, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user.userId;

    // Fetch product details from product-service
    const productRes = await axios.get(`http://product-service:3002/products/${productId}`);
    const { name, price } = productRes.data;

    // Check if the cart exists
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart with item
      cart = new Cart({
        userId,
        items: [{ productId, productname: name, quantity, price }]
      });
    } else {
      // Check if product already in cart
      const existingItem = cart.items.find(item => item.productId === productId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, productname: name, quantity, price });
      }
    }

    await cart.save();

    res.status(200).json({ message: 'Cart updated successfully', cart });
  } catch (err) {
    console.error('Error updating cart:', err.message);
    res.status(500).json({ message: 'Failed to update cart' });
  }
});


// ✅ Place Order (🔐 protected)
// ⛳ POST /order/place - Place Order
app.post('/place', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items, totalAmount } = req.body;

    // Step 1: Save new order
    const newOrder = new Order({
      userId,
      items,
      totalAmount,
    });

    await newOrder.save();

    // Step 2: Clear cart after placing order
    await Cart.deleteOne({ userId });

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (err) {
    console.error('Error placing order:', err.message);
    res.status(500).json({ message: 'Failed to place order' });
  }
});

app.get('/orders', authenticate, async (req, res) => {
  try{
    const userId = req.user.userId;
    const orders = await Order.find({userId});
    console.log(orders);
    res.status(200).json({success: "true", orders});
  }catch(err){
    console.log("Error in finding orders", err);
    res.status(500).json({success:"false", message:"Error in finding orders using the userId"});
  }
}
)



app.listen(3003, () => {
  console.log('Order service running on port 3003');
});