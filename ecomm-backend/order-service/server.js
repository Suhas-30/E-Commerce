import express from "express";
import mongoose from "mongoose";
import Cart from "./models/Cart.js";
import Order from "./models/Order.js";
import axios from "axios";
import authenticate from "./middleware/authMiddleware.js";
import checkFingerprint from "./shared-utils/checkFingerprint.js";
import checkSessionContext from "./shared-utils/checkSessionContext.js";


const app = express();
app.use(express.json());
app.set("trust proxy", true);

mongoose.connect("mongodb://mongo:27017/orderdb", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected (orderdb)"))
  .catch(err => console.error(err));

app.get('/cart', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId });
    return res.json(cart || { userId, items: [] });
  } catch (err) {
    console.error("Error fetching cart:", err);
    res.status(500).json({ message: "Error fetching cart" });
  }
});

app.post('/cart', authenticate, checkSessionContext, async (req, res) => {
  try {
    const { productId, quantity = 1, publicIP } = req.body;
    const userId = req.user.userId;

    console.log(`🛒 Add to cart request from public IP: ${publicIP}`);

    const productRes = await axios.get(`http://product-service:3002/products/${productId}`);
    const { name, price } = productRes.data;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ productId, productname: name, quantity, price }]
      });
    } else {
      const existingItem = cart.items.find(item => item.productId === productId);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ productId, productname: name, quantity, price });
      }
    }

    await cart.save();
    res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (err) {
    console.error("Error updating cart:", err.message);
    res.status(500).json({ message: "Failed to update cart" });
  }
});


app.post('/place', authenticate, checkSessionContext, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { items, totalAmount } = req.body;

    const newOrder = new Order({ userId, items, totalAmount });
    await newOrder.save();
    await Cart.deleteOne({ userId });

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    console.error("Error placing order:", err.message);
    res.status(500).json({ message: "Failed to place order" });
  }
});

app.get('/orders', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ userId });
    res.status(200).json({ success: true, orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
});

app.listen(3003, () => {
  console.log("📦 Order service running on port 3003");
});
