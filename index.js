const express = require('express');
const cors = require('cors');
const { receipt, utils: { loadReceipt, parseFromHTML } } = require('telebirr-receipt');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Disable TLS check — needed for telebirr site scraping (⚠️ Use with caution)
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
// Simple GET route to check service status
app.get('/', (req, res) => {
  res.send('Telebirr verifier microservice is running.');
});

app.post('/verify', async (req, res) => {
  const { receiptNo } = req.body;

  if (!receiptNo) {
    return res.status(400).json({ success: false, message: 'Receipt number is required.' });
  }

  try {
    const html = await loadReceipt({ receiptNo });
    const parsed = parseFromHTML(html);

    const { verifyAll, equals } = receipt(parsed, {
      to: 'debele tola',
      amount: '200.00'
    });

    const isValid = equals(parsed?.to, 'debele tola') && equals(parsed?.amount, '200.00');

    return res.json({ success: isValid });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Verification failed.' });
  }
});

app.listen(PORT, () => {
  console.log(`Telebirr verifier running on port ${PORT}`);
});

