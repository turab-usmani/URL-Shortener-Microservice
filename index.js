require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

// In-memory store for URL mappings
const urlMapping = {};
const baseUrl = `${process.env.BASE_URL || 'http://localhost:' + port}/api/shorturl/`;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

// Utility function to generate a short code
function generateShortCode() {
  return Math.random().toString(36).substring(2, 8);
}

// Endpoint to shorten a URL
app.post('/api/shorturl', (req, res) => {
  const originalUrl = req.body.url;

  try {
    // Validate URL and ensure it has a proper scheme (http or https)
    const url = new URL(originalUrl);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return res.json({ error: 'Invalid URL' });
    }
  } catch (err) {
    return res.json({ error: 'Invalid URL' });
  }

  // Generate a unique short code
  let shortCode = generateShortCode();
  while (urlMapping[shortCode]) {
    shortCode = generateShortCode();
  }

  // Save the URL mapping
  urlMapping[shortCode] = originalUrl;

  // Respond with the short URL
  res.json({
    original_url: originalUrl,
    short_url: shortCode
  });
});


app.get('/api/shorturl/:shortCode', (req, res) => {
  const shortCode = req.params.shortCode;
  const originalUrl = urlMapping[shortCode];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found for the given code' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
