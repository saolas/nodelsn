const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.json());
// app.use(express.static('public'));

// Load CA certificate
const caCert = fs.readFileSync(path.join(__dirname, 'certs', 'ca.pem'));

// MySQL connection with individual fields and SSL
const db = mysql.createConnection({
  host: 'mysql-petrjoe-academy.j.aivencloud.com',
  port: 28290,
  user: 'avnadmin',
  password: 'AVNS_4tMeHoaT1NEIhi3FY8n',
  database: 'defaultdb',
  ssl: {
    ca: caCert,
    rejectUnauthorized: true
  }
});

// Connect and ensure the table exists
db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database with SSL.');

  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL
    )
  `;

  db.query(createTableSQL, (err) => {
    if (err) throw err;
    console.log('Table "items" checked/created.');
    setupRoutes();
    startServer();
  });
});

// Routes
function setupRoutes() {
  app.get('/getitems', (req, res) => {
    db.query('SELECT * FROM items', (err, results) => {
      if (err) return res.status(500).send(err);
      res.status(200).json(results);
    });
  });

  app.post('/items', (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).send({ message: 'Name and description are required' });
    }
    db.query('INSERT INTO items (name, description) VALUES (?, ?)', [name, description], (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(201).json({ id: result.insertId, name, description });
    });
  });

  app.put('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id, 10);
    const { name, description } = req.body;
    db.query('UPDATE items SET name = ?, description = ? WHERE id = ?', [name, description, itemId], (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) return res.status(404).send({ message: 'Item not found' });
      res.status(200).send({ id: itemId, name, description });
    });
  });

  app.get('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id, 10);
    db.query('SELECT * FROM items WHERE id = ?', [itemId], (err, results) => {
      if (err) return res.status(500).send(err);
      if (results.length === 0) return res.status(404).send({ message: 'Item not found' });
      res.status(200).json(results[0]);
    });
  });

  app.delete('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id, 10);
    db.query('DELETE FROM items WHERE id = ?', [itemId], (err, result) => {
      if (err) return res.status(500).send(err);
      if (result.affectedRows === 0) return res.status(404).send({ message: 'Item not found' });
      res.status(204).send();
    });
  });
}

// Start server
function startServer() {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });
}
