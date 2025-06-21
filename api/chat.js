import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// This is the serverless function handler for Vercel
const handler = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, location } = req.body;
  // You can now use location.latitude and location.longitude
  // Store complaint, or add to OpenAI prompt, etc.
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are the Gram Seva chatbot. You can:\n- Register complaints (e.g., 'I want to report a water issue.')\n- Track complaint status (e.g., 'What happened to my complaint ID 123?')\n- Show local info (e.g., 'Who is the supervisor of my village?')\n- Announce updates (e.g., 'Important: Water supply cut tomorrow.')\n- Answer FAQs (e.g., 'What documents are needed for a birth certificate?')\n- Connect users to a supervisor (e.g., 'Talk to a live officer').\nIf a user asks to register a complaint, ask for details. If they want to track, ask for their complaint ID. For local info, ask for their village. For supervisor, provide contact info if available. For FAQs, answer helpfully.`
          },
          { role: 'user', content: message }
        ]
      })
    });
    const data = await response.json();
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error('Backend error:', err);
    res.status(500).json({ reply: 'Backend error.' });
  }
};

export default handler; 