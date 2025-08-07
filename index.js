const express = require('express');
const cors = require('cors');
const verifyReceipt = require('telebirr-receipt');

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Root route to show status in browser
app.get('/', (req, res) => {
  res.send('Telebirr verifier microservice is running.');
});

// ✅ POST /verify route
app.post('/verify', async (req, res) => {
  const { receiptNo } = req.body;

  if (!receiptNo) {
    return res.status(400).json({ success: false });
  }

  try {
    const result = await verifyReceipt(receiptNo);

    const nameMatch = result.receiver.toLowerCase() === 'debele tola';
    const amountMatch = parseFloat(result.amount) === 200.00;

    if (nameMatch && amountMatch) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  } catch (error) {
    return res.json({ success: false });
  }
});

// ✅ Listen on dynamic port for Render deployment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Telebirr verifier running on port ${PORT}`);
});
