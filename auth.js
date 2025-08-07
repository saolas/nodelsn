const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./db');
const path = require('path');

const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use(session({
  secret: 'my_secret_key',
  resave: false,
  saveUninitialized: false
}));


const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 587,
  auth: {
    user: 'e9ea90a43ec599',
    pass: 'dfc1022a832da4'
  }
});


app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/home.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/register.html')));


app.get('/forgot-password', (req, res) => res.sendFile(path.join(__dirname, 'public/forgot-password.html')));
app.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;

  db.query(
    'SELECT * FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
    [token],
    (err, results) => {
      if (err) throw err;
      if (results.length === 0) return res.send('Invalid or expired token.');

      res.sendFile(path.join(__dirname, 'public/reset-password.html'));
    }
  );
});


// Protected dashboard
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.sendFile(path.join(__dirname, 'public/dashboard.html'));
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Registration
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword],
    (err) => {
      if (err) throw err;
      res.redirect('/login');
    }
  );
});

// Login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE email = ?',
    [email],
    async (err, results) => {
      if (err) throw err;

      if (results.length === 0) return res.send('Invalid credentials');

      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.userId = user.id;
        res.redirect('/dashboard');
      } else {
        res.send('Invalid credentials');
      }
    }
  );
});

app.post('/forgot-password', (req, res) => {
  const { email } = req.body;

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 3600000); // 1 hour

  db.query(
    'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
    [token, expiry, email],
    (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0) return res.send('No user with that email');

      const resetLink = `http://localhost:${PORT}/reset-password/${token}`;

      transporter.sendMail({
        from: '"Password Reset" <no-reply@example.com>',
        to: email,
        subject: 'Password Reset Link',
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
      }, (err) => {
        if (err) {
          console.error(err);
          return res.send('Error sending email.');
        }

        res.send('Password reset link has been sent to your email.');
      });
    }
  );
});


app.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = ? AND reset_token_expiry > NOW()',
    [hashedPassword, token],
    (err, result) => {
      if (err) throw err;
      if (result.affectedRows === 0) return res.send('Invalid or expired token.');

      res.send('Password has been reset. You can now <a href="/login">login</a>.');
    }
  );
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
