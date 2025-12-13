  // const express = require('express');
  // const app = express();
  // app.use(express.json());

  // let products = [
  //   { id: 1, name: "Kipas Angin Portabel", price: 150000 },
  //   { id: 2, name: "Blender Mini", price: 200000 }
  // ];

  // // GET all products
  // app.get('/products', (req, res) => {
  //   res.json(products);
  // });

  // // GET product by ID
  // app.get('/products/:id', (req, res) => {
  //   const id = parseInt(req.params.id);
  //   const product = products.find(p => p.id === id);

  //   if (!product) {
  //     return res.status(404).json({ error: "Product not found" });
  //   }

  //   res.json(product);
  // });

  // app.listen(8001, () => console.log("Product-service running on port 8001"));

const express = require('express');
const { DataTypes } = require('sequelize');
const sequelize = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ======================
 * MODEL PRODUCT (INLINE)
 * ======================
 */
const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  }
});

/**
 * ======================
 * DATABASE SYNC
 * ======================
 */
sequelize.sync()
  .then(() => console.log('Database synced'))
  .catch(err => console.error('Sync error:', err));

/**
 * ======================
 * ROUTES CRUD PRODUCT
 * ======================
 */

// CREATE
app.post('/products', async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ALL
app.get('/products', async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

// READ BY ID
app.get('/products/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });
  res.json(product);
});

// UPDATE
app.put('/products/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });

  await product.update(req.body);
  res.json(product);
});

// DELETE
app.delete('/products/:id', async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ message: 'Not found' });

  await product.destroy();
  res.json({ message: 'Deleted' });
});

// SERVER
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
