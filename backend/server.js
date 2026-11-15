const express = require("express");

const app = express();
const PORT = 5000;

// Middleware to read JSON requests
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("LedgerGuard Backend is Running!");
});

// Start server
app.listen(PORT, () => {
    console.log(`LedgerGuard server running on port ${PORT}`);
});