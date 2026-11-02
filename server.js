const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log('MongoDB Connection Error: ', err));

// MongoDB Schema
const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  district: String,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', UserSchema);

// Submit Data Endpoint
app.post('/submit-data', async (req, res) => {
  try {
    const { name, phone, district } = req.body;
    
    // Save to MongoDB
    const newUser = new User({ name, phone, district });
    await newUser.save();

    // Send to Telegram
    const telegramMessage = `🔔 New Entry!\n\nName: ${name}\nPhone: ${phone}\nDistrict: ${district}`;
    await axios.post(`https://api.telegram.org/bot${process.env.TG_TOKEN}/sendMessage`, {
      chat_id: process.env.TG_CHAT_ID,
      text: telegramMessage
    });

    res.status(200).json({ success: true, message: 'Data submitted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));