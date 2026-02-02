import { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../context/SocketContext";
import { getChatHistory, sendMessage } from "../services/chat.api";

export default function ChatBox({ rideId }) {
  const { socket } = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  /* ===== JOIN RIDE + LOAD CHAT ===== */
  useEffect(() => {
    if (!socket || !rideId) return;

    socket.emit("join_ride", rideId);

    getChatHistory(rideId).then((res) => {
      setMessages(res.data.data || []);
    });

    socket.on("chat_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("chat_message");
  }, [rideId, socket]);

  /* ===== AUTO SCROLL ===== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===== SEND MESSAGE ===== */
  const send = async () => {
    if (!text.trim()) return;

    await sendMessage({ rideId, message: text.trim() });
    setText("");
  };

  /* ===== ENTER KEY HANDLER ===== */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // stop new line
      send();
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col h-72 text-gray-200">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        💬 Chat with Client
      </h3>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className="max-w-[80%] p-2 rounded-lg text-sm bg-gray-800"
          >
            {m.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="flex gap-2 mt-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Type a message..."
          className="flex-1 resize-none bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={send}
          className="bg-blue-600 hover:bg-blue-700 px-4 rounded font-semibold text-white"
        >
          Send
        </button>
      </div>
    </div>
  );
}
