const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Mobiles', 'Laptops', 'Electronics', 'Fashion']
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  brand: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
