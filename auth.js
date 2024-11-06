const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a new database or open an existing one
const db = new sqlite3.Database(path.join(__dirname, 'users.db'), (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the users database.');
});

// Create a table for users
db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)`);

// Function to register a new user
function registerUser(username, password, callback) {
    const hashedPassword = bcrypt.hashSync(password, 8); // Hash the password
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) {
            return callback(err);
        }
        callback(null, { id: this.lastID, username });
    });
}

// Function to authenticate user
function authenticateUser(username, password, callback) {
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err) {
            return callback(err);
        }
        if (!user) {
            return callback(null, false);
        }
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return callback(null, false);
        }
        const token = jwt.sign({ id: user.id }, 'secret', { expiresIn: 86400 }); // expires in 24 hours
        callback(null, { id: user.id, username: user.username, accessToken: token });
    });
}

// Function to verify JWT token
function verifyToken(req, res, next) {
    const token = req.headers['x-access-token'];
    if (!token) {
        return res.status(403).send({ message: 'No token provided!' });
    }
    jwt.verify(token, 'secret', (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'Unauthorized!' });
        }
        req.userId = decoded.id;
        next();
    });
}

module.exports = {
    registerUser,
    authenticateUser,
    verifyToken
};
