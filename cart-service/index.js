const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { DataTypes } = require('sequelize');
const { sequelize, connectWithRetry } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// =====================
// MODELS
// =====================

// Cart (1 user = 1 cart)
const Cart = sequelize.define('Cart', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

// Cart Items
const CartItem = sequelize.define('CartItem', {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});

// Relations
Cart.hasMany(CartItem, { onDelete: 'CASCADE' });
CartItem.belongsTo(Cart);

// =====================
// INIT DB
// =====================
(async () => {
  await connectWithRetry();
  await sequelize.sync({ alter: true });
  console.log('🛒 Cart database ready');
})();

// =====================
// HELPERS
// =====================
const success = (res, message, data = null) =>
  res.status(200).json({ message, data });

const error = (res, status, message) =>
  res.status(status).json({ success: false, message });

// =====================
// ROUTES
// =====================

// Get cart by user


app.get('/cart/:userId', async (req, res) => {
  const cart = await Cart.findOne({
    where: { userId: req.params.userId },
    include: CartItem,
  });

  if (!cart) return success(res, 'Cart is empty', []);

  const itemsWithProduct = await Promise.all(
    cart.CartItems.map(async (item) => {
      try {
        const productRes = await axios.get(
          `http://product-service:3000/products/${item.productId}`
        );

        return {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product: productRes.data.data,
        };
      } catch (err) {
        console.error('❌ Failed fetch product:', err.message);
        return {
          id: item.id,
          productId: item.productId,
          quantity: item.quantity,
          product: null,
        };
      }
    })
  );

  success(res, 'Cart retrieved', {
    id: cart.id,
    userId: cart.userId,
    CartItems: itemsWithProduct,
  });
});



// Add item to cart
app.post('/cart', async (req, res) => {
  const { userId, productId, quantity } = req.body;

  if (!userId || !productId)
    return error(res, 400, 'userId and productId are required');

  let cart = await Cart.findOne({ where: { userId } });
  if (!cart) cart = await Cart.create({ userId });

  let item = await CartItem.findOne({
    where: { CartId: cart.id, productId },
  });

  if (item) {
    item.quantity += quantity || 1;
    await item.save();
  } else {
    item = await CartItem.create({
      CartId: cart.id,
      productId,
      quantity: quantity || 1,
    });
  }

  success(res, 'Item added to cart', item);
});

// Update quantity
app.put('/cart/item/:id', async (req, res) => {
  const item = await CartItem.findByPk(req.params.id);
  if (!item) return error(res, 404, 'Cart item not found');

  await item.update({ quantity: req.body.quantity });
  success(res, 'Cart item updated', item);
});

// Remove item
app.delete('/cart/item/:id', async (req, res) => {
  const item = await CartItem.findByPk(req.params.id);
  if (!item) return error(res, 404, 'Cart item not found');

  await item.destroy();
  success(res, 'Item removed from cart');
});

// Clear cart
app.delete('/cart/:userId', async (req, res) => {
  const cart = await Cart.findOne({ where: { userId: req.params.userId } });
  if (!cart) return success(res, 'Cart already empty');

  await CartItem.destroy({ where: { CartId: cart.id } });
  success(res, 'Cart cleared');
});

// =====================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🛒 Cart service running on port ${PORT}`);
});
