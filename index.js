const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/sendMessage', async (req, res) => {
    const botToken = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.CHAT_ID;
    
    try {
        const response = await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            chat_id: chatId,
            text: JSON.stringify(req.body) // Или твой формат сообщения
        });
        res.status(200).send(response.data);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

app.listen(process.env.PORT || 3000, () => console.log('Server started'));