const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://senho1156_db_user:YOUR_PASSWORD@cluster0.mongodb.net/magaleer?retryWrites=true&w=majority"; 

mongoose.connect(MONGO_URI)
  .then(() => console.log("MongoDB Connected..."))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Schema
const UserSchema = new mongoose.Schema({
  name: String,
  phone: String,
  district: String,
  anydesk: String,
  date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// Root Route (UptimeRobot-க்காகச் சேர்க்கப்பட்டது)
app.get('/', (req, res) => {
  res.status(200).send('Server is running successfully!');
});

// Submit Data Endpoint
app.post('/submit-data', async (req, res) => {
  try {
    const { name, phone, district, anydesk } = req.body;

    // 1. Save to MongoDB
    const newUser = new User({ name, phone, district, anydesk });
    await newUser.save();

    // 2. Send to Telegram
    const TG_TOKEN = process.env.TG_TOKEN; 
    const TG_CHAT_ID = process.env.TG_CHAT_ID;
    
    const message = `🚨 New Entry!\n\n👤 Name: ${name}\n📞 Phone: ${phone}\n📍 District: ${district}\n💻 AnyDesk: ${anydesk}\n📅 Date: ${new Date().toLocaleString()}`;
    
    await axios.post(`https://api.telegram.org/bot${TG_TOKEN}/sendMessage`, {
      chat_id: TG_CHAT_ID,
      text: message
    });

    res.status(200).send({ success: true, message: "Data submitted successfully!" });
  } catch (error) {
    console.error("Error during submission:", error);
    res.status(500).send({ success: false, message: "Internal Server Error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});