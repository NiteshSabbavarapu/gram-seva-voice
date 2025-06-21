import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Chat API endpoint
app.post('/api/chat', async (req, res) => {
  const { message, messages } = req.body;
  
  try {
    const completion = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: 'system',
          content: `You are the Gram Seva chatbot. You can:\n- Register complaints (e.g., 'I want to report a water issue.')\n- Track complaint status (e.g., 'What happened to my complaint ID 123?')\n- Show local info (e.g., 'Who is the supervisor of my village?')\n- Announce updates (e.g., 'Important: Water supply cut tomorrow.')\n- Answer FAQs (e.g., 'What documents are needed for a birth certificate?')\n- Connect users to a supervisor (e.g., 'Talk to a live officer').\nIf a user asks to register a complaint, ask for details. If they want to track, ask for their complaint ID. For local info, ask for their village. For supervisor, provide contact info if available. For FAQs, answer helpfully.`
        },
        ...(messages || []).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: message }
      ]
    });
    
    const reply = completion.choices[0]?.message?.content || "Sorry, I didn't understand that.";
    res.json({ reply });
  } catch (err) {
    console.error('Backend error:', err);
    res.status(500).json({ reply: 'Sorry, something went wrong. Please try again.' });
  }
});

app.listen(PORT, () => {
  console.log(`Development server running on port ${PORT}`);
}); 