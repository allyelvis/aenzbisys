const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
app.use(bodyParser.json());

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// API endpoints for Restaurant POS
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

app.post('/api/products', (req, res) => {
  const { name, description, price, category } = req.body;
  db.run(
    `INSERT INTO products (name, description, price, category) VALUES (?, ?, ?, ?)`,
    [name, description, price, category],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ product_id: this.lastID });
    }
  );
});

app.post('/api/orders', (req, res) => {
  const { date, total, customer_name, status } = req.body;
  db.run(
    `INSERT INTO orders (date, total, customer_name, status) VALUES (?, ?, ?, ?)`,
    [date, total, customer_name, status],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ order_id: this.lastID });
    }
  );
});

// Additional endpoints for order_items, inventory, and users can be created similarly

// API endpoints for E-commerce
app.get('/api/customers', (req, res) => {
  db.all('SELECT * FROM customers', [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({ data: rows });
  });
});

app.post('/api/customers', (req, res) => {
  const { name, email, address, phone } = req.body;
  db.run(
    `INSERT INTO customers (name, email, address, phone) VALUES (?, ?, ?, ?)`,
    [name, email, address, phone],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ customer_id: this.lastID });
    }
  );
});

app.post('/api/ecommerce_orders', (req, res) => {
  const { date, total, customer_id, status } = req.body;
  db.run(
    `INSERT INTO ecommerce_orders (date, total, customer_id, status) VALUES (?, ?, ?, ?)`,
    [date, total, customer_id, status],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({ order_id: this.lastID });
    }
  );
});

// Additional endpoints for ecommerce_order_items, and inventory can be created similarly

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
