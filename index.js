const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());

// Optional root for browser testing
app.get('/', (req, res) => {
  res.send('Telebirr verifier microservice is running.');
});

// Helper function to scrape receipt data
const fetchReceiptDetails = async (receiptNo) => {
  try {
    const url = `https://transactioninfo.ethiotelecom.et/receipt/${receiptNo}`;
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0' // Helps avoid some basic anti-bot blocks
      }
    });

    const $ = cheerio.load(html);
    let receiver = '';
    let amount = '';

    // Look for <td>Receiver</td><td>debele tola</td>
    $('td').each((i, el) => {
      const label = $(el).text().trim().toLowerCase();
      if (label === 'receiver') {
        receiver = $(el).next().text().trim().toLowerCase();
      }
      if (label === 'amount') {
        amount = $(el).next().text().trim();
      }
    });

    return { receiver, amount };
  } catch (err) {
    return null;
  }
};

// /verify POST route
app.post('/verify', async (req, res) => {
  const { receiptNo } = req.body;

  if (!receiptNo) {
    return res.status(400).json({ success: false });
  }

  const details = await fetchReceiptDetails(receiptNo);
  if (!details) {
    return res.json({ success: false });
  }

  const { receiver, amount } = details;

  // Strict match: name and amount
  if (receiver === 'Ibrahi Ghazali' && amount === '1.00') {
    return res.json({ success: true });
  } else {
    return res.json({ success: false });
  }
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Telebirr verifier running on port ${PORT}`);
});
