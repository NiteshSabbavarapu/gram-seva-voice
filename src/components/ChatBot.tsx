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
          { role: "system", content: "You are a helpful chatbot." },
          ...messages
            .filter((m) => m.sender !== "bot" || m.text !== "...")
            .map((msg) => ({
              role: msg.sender === "user" ? "user" : "assistant",
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
