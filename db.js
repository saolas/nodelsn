const mysql = require('mysql2');
const fs = require('fs');

const caCert = fs.readFileSync('./certs/ca.pem');

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

db.connect(err => {
  if (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
  console.log('Connected to MySQL DB');

  // Drop existing table if needed
  const dropTableSQL = `
    DROP TABLE IF EXISTS users
  `;

  // Create new table with all required columns
  const createTableSQL = `
    CREATE TABLE users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      reset_token VARCHAR(64) DEFAULT NULL,
      reset_token_expiry DATETIME DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;

  // Execute queries in sequence
  db.query(dropTableSQL, (err) => {
    if (err) {
      console.error('Error dropping table:', err);
      throw err;
    }
    console.log('Existing table dropped successfully');

    db.query(createTableSQL, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        throw err;
      }
      console.log('New table created successfully with all columns');
    });
  });
});

// Handle errors
db.on('error', (err) => {
  console.error('Database error:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.');
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.');
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.');
  }
});

module.exports = db;