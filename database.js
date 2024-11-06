const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create a new database or open an existing one
const db = new sqlite3.Database(path.join(__dirname, 'torrents.db'), (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the torrents database.');
});

// Create a table for user preferences
db.run(`CREATE TABLE IF NOT EXISTS preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    last_torrent TEXT
)`);

// Create a table for previously streamed torrents
db.run(`CREATE TABLE IF NOT EXISTS streamed_torrents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    torrent_id TEXT,
    streamed_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Function to save user preferences
function savePreference(lastTorrent) {
    db.run(`INSERT INTO preferences (last_torrent) VALUES (?)`, [lastTorrent], function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Saved preference: ${lastTorrent}`);
    });
}

// Function to get user preferences
function getPreference(callback) {
    db.get(`SELECT last_torrent FROM preferences ORDER BY id DESC LIMIT 1`, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        callback(row ? row.last_torrent : null);
    });
}

// Function to save streamed torrents
function saveStreamedTorrent(torrentId) {
    db.run(`INSERT INTO streamed_torrents (torrent_id) VALUES (?)`, [torrentId], function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`Saved streamed torrent: ${torrentId}`);
    });
}

// Function to get previously streamed torrents
function getStreamedTorrents(callback) {
    db.all(`SELECT torrent_id, streamed_at FROM streamed_torrents ORDER BY streamed_at DESC`, (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        callback(rows);
    });
}

module.exports = {
    savePreference,
    getPreference,
    saveStreamedTorrent,
    getStreamedTorrents
};
