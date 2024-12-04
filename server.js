require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Default route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle interview logic
app.post('/interview', async (req, res) => {
    const { jobTitle, userResponse, conversation } = req.body;

    // Construct the prompt for the AI
    let prompt = `You are an interviewer for the role of ${jobTitle}. `;
    if (conversation.length === 1) {
        prompt += 'Start with "Tell me about yourself". ';
    } else {
        prompt += 'Continue the interview by asking relevant questions or responding to the user based on their answers. ';
    }
    prompt += `The user said: "${userResponse}"`;

    try {
        // Call the AI API (Google Gemini or OpenAI GPT-4)
        const apiResponse = await axios.post('https://api.example.com/v1/generate', {
            prompt,
            max_tokens: 200
        }, {
            headers: { Authorization: `Bearer ${process.env.API_KEY}` }
        });

        const reply = apiResponse.data.choices[0].text.trim();
        res.json({ reply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate a response from AI.' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
