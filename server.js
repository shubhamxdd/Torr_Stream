const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const database = require('./database'); // Import the database module
const auth = require('./auth'); // Import the authentication module
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to allow CORS
app.use(cors());
app.use(bodyParser.json()); // To parse JSON bodies

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Simple endpoint to check if the server is running
app.get('/', (req, res) => {
    res.send('Torrent Streaming Server is running!');
});

// User Registration
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    auth.registerUser(username, password, (err, user) => {
        if (err) {
            return res.status(500).send({ message: err.message });
        }
        res.status(201).send({ message: 'User registered successfully!', user });
    });
});

// User Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    auth.authenticateUser(username, password, (err, user) => {
        if (err) {
            return res.status(500).send({ message: err.message });
        }
        if (!user) {
            return res.status(401).send({ accessToken: null, message: 'Invalid credentials!' });
        }
        res.status(200).send(user);
    });
});

// Middleware to verify the token
app.use(auth.verifyToken);

// Protected Routes
app.get('/api/preferences', (req, res) => {
    database.getPreference((lastTorrent) => {
        res.json({ lastTorrent });
    });
});

// Endpoint to save user preferences
app.post('/api/preferences', (req, res) => {
    const { lastTorrent } = req.body;
    database.savePreference(lastTorrent);
    res.status(200).send('Preference saved.');
});

// Endpoint to get previously streamed torrents
app.get('/api/streamed-torrents', (req, res) => {
    database.getStreamedTorrents((rows) => {
        res.json(rows);
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
