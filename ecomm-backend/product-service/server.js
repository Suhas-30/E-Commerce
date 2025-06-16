const express = require('express');
const mongoose = require('mongoose');

const Product = require('./models/Product');

const app = express();
const PORT = 3002;



app.use(express.json());


mongoose.connect('mongodb://mongo:27017/productDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));


app.get('/products', async (req, res) => {
  try {
    const query = { ...req.query }; 
    const products = await Product.find(query);
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Error fetching products' });
  }
});




app.listen(PORT, () => {
  console.log(` Product service running on port ${PORT}`);
});