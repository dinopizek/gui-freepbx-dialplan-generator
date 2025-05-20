const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { generateDialplan } = require('./dialplanGenerator');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.post('/generate', (req, res) => {
    const { minPrefix, maxPrefix, maskPairs, patterns } = req.body;
    
    try {
        const csvData = generateDialplan(
            parseInt(minPrefix), 
            parseInt(maxPrefix),
            maskPairs,
            patterns
        );
        res.json({ success: true, data: csvData });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 