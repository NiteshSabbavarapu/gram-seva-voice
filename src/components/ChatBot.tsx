import { useState, useRef, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "Hi! How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { sender: "user" as const, text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput("");
    setMessages((msgs) => [...msgs, { sender: "bot", text: "..." }]);

    // Detect complaint intent
    if (input.toLowerCase().includes("complaint") || input.toLowerCase().includes("report")) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            try {
              const res = await fetch("http://localhost:3001/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMsg.text, location: { latitude, longitude } })
              });
              const data = await res.json();
              setMessages((msgs) => [...msgs.slice(0, -1), { sender: "bot", text: data.reply }]);
            } catch {
              setMessages((msgs) => [...msgs.slice(0, -1), { sender: "bot", text: "Sorry, something went wrong." }]);
            }
          },
          (error) => {
            setMessages((msgs) => [...msgs.slice(0, -1), { sender: "bot", text: "Could not get your location." }]);
          }
        );
        return;
      } else {
        setMessages((msgs) => [...msgs.slice(0, -1), { sender: "bot", text: "Geolocation is not supported by your browser." }]);
        return;
      }
    }

    // Default: send as usual
    try {
      const res = await fetch("http://localhost:3001/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text })
      });
      const data = await res.json();
      setMessages((msgs) => [...msgs.slice(0, -1), { sender: "bot", text: data.reply }]);
    } catch {
      setMessages((msgs) => [...msgs.slice(0, -1), { sender: "bot", text: "Sorry, something went wrong." }]);
    }
  };

  return (
    <div>
      {/* Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-ts-primary text-white p-4 rounded-full shadow-lg hover:bg-ts-primary-dark transition-colors"
          aria-label="Open chat bot"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}
      {/* Chat Window */}
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
              <div
                key={idx}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-lg text-sm max-w-[75%] ${
                    msg.sender === "user"
                      ? "bg-ts-primary text-white"
                      : "bg-gray-200 text-black"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSend} className="flex items-center gap-2 p-2 border-t bg-white rounded-b-xl">
            <input
              type="text"
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ts-primary"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
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