const express = require('express');
const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
const { create } = require('domain');
const { start } = require('repl');
const app = express();
const port = 3000;

app.use(express.json());

const caCert = fs.readFileSync(path.join(__dirname, 'certs', 'ca.pem'));

// name and description

// In-memory dummy database
// let dummyDB = [];

const db = mysql.createConnection({
  host: 'mysql-petrjoe-academy.j.aivencloud.com',
  user: 'avnadmin',
  port: 28290,
  database: 'defaultdb',
  password: 'AVNS_4tMeHoaT1NEIhi3FY8n',
  ssl: {
    ca: caCert,
    rejectUnauthorized: true
  }
});

// connect and ensure the database is ready
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database!');
  // Create table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL
    )
  `;
  db.query(createTableQuery, (err) => {
    if (err) throw err;
    console.log('Table is ready.');
    setupRoutes();
    // startServer();
  });
});


function setupRoutes() {
  // Read all items
  app.get('/items', (req, res) => {
    db.query('SELECT * FROM items', (err, results) => {
      if (err) {
        return res.status(500).send({ message: 'Database error' });
      }
      res.status(200).send(results);
    });
  });

  // Create a new item
  app.post('/items', (req, res) => {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).send({ message: 'Name and description are required' });
    }
    db.query('INSERT INTO items (name, description) VALUES (?,?)', [name, description], (err, results) => {
      if (err) {
        return res.status(500).send({ message: 'Database error' });
      }
      const newItem = { id: results.insertId, name, description };
      res.status(201).send(newItem);
    });
  });

  // Update an item by ID
  app.put('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id, 10);
    const { name, description } = req.body;
    db.query('UPDATE items SET name =?, description = ? WHERE id = ?', [name, description, itemId], (err, results) => {
      if (err) {
        return res.status(500).send({ message: 'Database error' });
      }
      if (results.affectedRows === 0) {
        return res.status(404).send({ message: 'Item not found' });
      }
      res.status(200).send({ id: itemId, name, description });
    });
  }



// Read a single item by ID
app.get('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id, 10);
    const item = dummyDB.find(i => i.id === itemId);
    if (item) {
      res.status(200).send(item);
    } else {
      res.status(404).send({ message: 'Item not found' });
    }
  });


  // Delete an item by ID
  app.delete('/items/:id', (req, res) => {
    const itemId = parseInt(req.params.id, 10);
    const index = dummyDB.findIndex(i => i.id === itemId);
    if (index !== -1) {
      dummyDB.splice(index, 1);
      res.status(204).send();
    } else {
      res.status(404).send({ message: 'Item not found' });
    }
  });

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
  });