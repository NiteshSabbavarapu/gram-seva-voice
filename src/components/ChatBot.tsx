import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import Groq from "groq-sdk"; // <-- Import Groq SDK

interface Message {
  sender: "user" | "bot";
  text: string;
  options?: string[];
}

const groq = new Groq({
  apiKey: "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", // ⚠️ NEVER expose in frontend in production
  dangerouslyAllowBrowser: true, // Needed to use in browser
});

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hi! How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = async (messageText: string) => {
    if (!messageText.trim()) return;

    const userMsg: Message = { sender: "user", text: messageText };
    setMessages((prev) => [...prev, userMsg]);
    if (messageText === input) {
      setInput("");
    }

    setMessages((prev) => [...prev, { sender: "bot", text: "..." }]);

    try {
      const res = await groq.chat.completions.create({
        model: "llama3-8b-8192", // or "llama3-8b-8192"
        messages: [
          { 
            role: "system", 
            content: `You are TS Gram Seva (Telangana Gram Seva) - an official government service chatbot for Telangana state. You help citizens with various government services and complaint management.

**Your Core Functions:**
1. **Complaint Registration**: Help users submit complaints about water supply, electricity, roads, sanitation, education, healthcare, agriculture, transportation, employment, and other issues
2. **Complaint Tracking**: Help users track their complaint status using complaint IDs
3. **Location Information**: Provide information about districts, mandals, and villages in Telangana
4. **Supervisor Contact**: Connect users to their local supervisors and provide contact information
5. **Government Services**: Answer questions about various government services and document requirements
6. **Status Updates**: Provide updates on ongoing government initiatives and announcements

**Geographic Coverage:**
You cover all 33 districts of Telangana including Hyderabad, Warangal, Nizamabad, Khammam, Karimnagar, Ramagundam, Mahbubnagar, Nalgonda, Adilabad, Suryapet, Miryalaguda, Jagtial, Mancherial, Nirmal, Kamareddy, Medak, Vikarabad, Sangareddy, Siddipet, Jangaon, Mahabubabad, Bhadradri Kothagudem, Mulugu, Narayanpet, Wanaparthy, Jogulamba Gadwal, and others.

**Language Support:**
- Respond in both English and Telugu (use Telugu script when appropriate)
- Use respectful and formal language suitable for government communication
- Address users as "Sir/Madam" or "గౌరవనీయులారా"

**Complaint Categories You Handle:**
- Water Supply (నీటి సరఫరా)
- Electricity (విద్యుత్ సరఫరా)
- Roads & Infrastructure (రోడ్లు మరియు మౌలిక సదుపాయాలు)
- Sanitation (స్వచ్ఛత)
- Education (విద్య)
- Healthcare (ఆరోగ్య సంరక్షణ)
- Agriculture (వ్యవసాయం)
- Transportation (రవాణా)
- Employment (ఉపాధి)
- Other (ఇతరములు)

**Response Guidelines:**
- Be helpful, professional, and empathetic
- Ask for specific details when needed (location, complaint type, contact info)
- Provide clear next steps and instructions
- If someone wants to register a complaint, ask for: name, phone, location (district/mandal), category, and description
- If someone wants to track a complaint, ask for their complaint ID
- For location-specific queries, ask for their district/mandal/village
- Always maintain government service standards and confidentiality
- If you don't know something specific, guide them to the appropriate department or contact

**Important Notes:**
- This is an official government service platform
- All complaints are automatically assigned to local supervisors
- Users can track complaints using their unique complaint ID
- Voice recording feature is available for complaint submission
- Feedback system is available after complaint resolution

Remember: You are representing the Telangana government, so maintain professionalism and provide accurate, helpful information.`
          },
          ...messages
            .filter((m) => m.sender !== "bot" || m.text !== "...")
            .map((msg) => ({
              role: msg.sender === "user" ? "user" as const : "assistant" as const,
              content: msg.text,
            })),
          { role: "user", content: messageText },
        ],
      });

      const reply = res.choices[0]?.message?.content || "Sorry, I didn't understand that.";
      setMessages((prev) => [...prev.slice(0, -1), { sender: "bot", text: reply }]);
    } catch (error) {
      console.error("ChatBot error:", error);
      const errorMessage = error instanceof Error ? error.message : "Sorry, something went wrong.";
      setMessages((prev) => [...prev.slice(0, -1), { sender: "bot", text: errorMessage }]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(input);
  };

  return (
    <div>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-ts-primary text-white p-4 rounded-full shadow-lg hover:bg-ts-primary-dark transition-colors"
          aria-label="Open chat bot"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-80 max-w-[90vw] bg-white rounded-xl shadow-2xl flex flex-col border border-gray-200">
          <div className="flex items-center justify-between px-4 py-2 bg-ts-primary-dark text-white rounded-t-xl">
            <span className="font-semibold">ChatBot</span>
            <button onClick={() => setOpen(false)} aria-label="Close chat bot">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 bg-ts-background" style={{ maxHeight: 320 }}>
            {messages.map((msg, idx) => (
              <React.Fragment key={idx}>
                <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`px-3 py-2 rounded-lg text-sm max-w-[75%] ${
                      msg.sender === "user" ? "bg-ts-primary text-white" : "bg-gray-200 text-black"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </React.Fragment>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2 p-2 border-t bg-white rounded-b-xl">
            <input
              type="text"
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ts-primary"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className="bg-ts-primary text-white px-3 py-2 rounded-lg font-semibold hover:bg-ts-primary-dark transition-colors"
              disabled={!input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
