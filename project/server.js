const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Checksum Logic: 8-bit One's Complement
const verifyChecksum = (data, receivedChecksum) => {
    let sum = 0;
    
    // 1. Sum up the data bytes
    for (let i = 0; i < data.length; i++) {
        sum += data.charCodeAt(i);
    }

    // 2. Add the received checksum to the sum
    sum += parseInt(receivedChecksum, 16);

    // 3. Handle carries for 8-bit (Wrap around)
    while (sum >> 8) {
        sum = (sum & 0xFF) + (sum >> 8);
    }

    // 4. One's Complement (Result should be 0 if no error)
    const result = (~sum & 0xFF);
    return result === 0;
};

app.post('/api/verify', (req, res) => {
    const { data, checksum } = req.body;
    
    const isValid = verifyChecksum(data, checksum);
    
    res.json({
        valid: isValid,
        receivedAt: new Date().toISOString(),
        status: isValid ? "Data Intact" : "Data Corrupted"
    });
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));