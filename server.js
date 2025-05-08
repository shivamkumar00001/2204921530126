const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = 9876;
const WINDOW_SIZE = 10;
let windowNumbers = [];

// Hardcoded Bearer Token 
const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ2Njg1MjkzLCJpYXQiOjE3NDY2ODQ5OTMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjVhYjc1NjM0LTc5YjYtNDY0My1iNWFlLTlhY2VkYjFlNWE0MiIsInN1YiI6InNoaXZhbWt1bWFyOTMzNDAxQGdtYWlsLmNvbSJ9LCJlbWFpbCI6InNoaXZhbWt1bWFyOTMzNDAxQGdtYWlsLmNvbSIsIm5hbWUiOiJzaGl2YW1fa3VtYXIiLCJyb2xsTm8iOiIyMjA0OTIxNTMwMTI2IiwiYWNjZXNzQ29kZSI6ImJhcWhXYyIsImNsaWVudElEIjoiNWFiNzU2MzQtNzliNi00NjQzLWI1YWUtOWFjZWRiMWU1YTQyIiwiY2xpZW50U2VjcmV0IjoibXp0eEdKQWZ3aFdtclVyRSJ9.2mTl3_EBV0vHmOnMcPy1ZEIH0DvfRfQ18f3Wx5ZtciA';

// API endpoints
const API_URLS = {
    p: 'http://20.244.56.144/evaluation-service/primes',
    f: 'http://20.244.56.144/evaluation-service/fibo',
    e: 'http://20.244.56.144/evaluation-service/even',
    r: 'http://20.244.56.144/evaluation-service/rand',
};

// Route handler
app.get('/numbers/:id', async (req, res) => {
    const id = req.params.id;
    const url = API_URLS[id];

    if (!url) {
        return res.status(400).json({ error: 'Invalid ID type' });
    }

    try {
        const response = await axios.get(url, {
            timeout: 500, 
            headers: {
                Authorization: `Bearer ${API_TOKEN}`
            }
        });

        const apiNumbers = response.data.numbers || [];
        const newNumbers = apiNumbers.filter(n => !windowNumbers.includes(n));
        const windowPrevState = [...windowNumbers];

        windowNumbers.push(...newNumbers);
        if (windowNumbers.length > WINDOW_SIZE) {
            windowNumbers = windowNumbers.slice(-WINDOW_SIZE);
        }

        const avg = windowNumbers.reduce((sum, n) => sum + n, 0) / windowNumbers.length;

        res.json({
            windowPrevState,
            windowCurrState: windowNumbers,
            numbers: newNumbers,
            avg: parseFloat(avg.toFixed(2)),
        });

    } catch (err) {
        // Enhanced error diagnostics
        if (err.response) {
            console.error(' API responded with an error');
            console.error('Status:', err.response.status);
            console.error('Response Data:', err.response.data);
        } else if (err.request) {
            console.error(' No response received from API');
        } else {
            console.error(' Error in setting up request:', err.message);
        }

        res.status(500).json({ error: 'Failed to fetch numbers or timeout exceeded' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}`);
});
