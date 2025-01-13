// server.js
import express from 'express';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Store chat history in memory (consider using a database for production)
const chatHistory = [];

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        console.log('Sending request to Ollama...');
        console.log('Message:', message);
        
        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'deepseek-coder:6.7b',
                messages: [
                    ...chatHistory,
                    { role: 'user', content: message }
                ],
                stream: false
            }),
        });
        
        console.log('Ollama response status:', response.status);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ollama error response:', errorText);
            throw new Error(`Ollama responded with status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        // Add the exchange to chat history
        chatHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: data.message.content }
        );

        res.json({ 
            response: data.message.content,
            history: chatHistory
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process chat request', details: error.message });
    }
});

// Get chat history endpoint
app.get('/api/history', (req, res) => {
    res.json(chatHistory);
});

// Clear chat history endpoint
app.post('/api/clear', (req, res) => {
    chatHistory.length = 0;
    res.json({ message: 'Chat history cleared' });
});

// Test endpoint for Ollama connectivity
app.get('/api/test-ollama', async (req, res) => {
    try {
        const response = await fetch('http://localhost:11434/api/version');
        const data = await response.json();
        res.json({ status: 'ok', version: data.version });
    } catch (error) {
        console.error('Ollama test failed:', error);
        res.status(500).json({ 
            status: 'error', 
            message: 'Could not connect to Ollama',
            error: error.message 
        });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});