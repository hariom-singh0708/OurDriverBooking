import { useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "../context/SocketContext";
import { getChatHistory, sendMessage } from "../services/chat.api";

export default function ChatBox({ rideId, userId, clientPhone }) {
  const { socket } = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const messagesEndRef = useRef(null);

  const quickReplies = ["I've arrived", "OK", "In traffic", "Almost there"];

  /* ===== SOCKET LOGIC ===== */
  useEffect(() => {
    if (!socket || !rideId) return;

    socket.emit("join_ride", rideId);

    getChatHistory(rideId).then((res) => {
      setMessages(res.data.data || []);
    });

    socket.on("chat_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat_message");
    };
  }, [rideId, socket]);

  /* ===== AUTO SCROLL ===== */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ===== SEND MESSAGE FUNCTION ===== */
  const send = async (customText) => {
    const messageToSend = customText || text.trim();
    if (!messageToSend) return;

    await sendMessage({ rideId, message: messageToSend });

    if (!customText) setText("");
  };

  /* ===== ENTER KEY SEND LOGIC ===== */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden relative">
      
      {/* HEADER */}
      <div className="px-5 py-2.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Secure Channel
          </h3>
        </div>
{
  clientPhone &&
    <a
      href={`tel:${clientPhone}`}
      className="h-7 w-7 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-[10px] border border-green-100 shadow-sm active:scale-90 transition-all"
    >
      📞
    </a>
  
}
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#FCFDFF] scrollbar-hide">
        {messages.map((m, i) => {
          const roleFromHistory = m.senderId?.role;
          const roleFromSocket = m.senderRole;

          const finalRole = roleFromHistory || roleFromSocket;

          const isMe =
            finalRole?.toLowerCase() === userId?.toLowerCase();

          return (
            <div
              key={i}
              className={`flex w-full ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] flex flex-col ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                {/* SENDER LABEL */}
                <span
                  className={`text-[8px] font-black uppercase tracking-widest mb-1 ${
                    isMe ? "text-brand" : "text-slate-400"
                  }`}
                >
                  {finalRole === "driver" ? "Driver" : "Client"}{" "}
                  {isMe && "(You)"}
                </span>

                {/* MESSAGE BUBBLE */}
                <div
                  className={`px-4 py-2.5 shadow-sm text-sm leading-relaxed ${
                    isMe
                      ? "bg-brand text-white rounded-2xl rounded-tr-none"
                      : "bg-white text-[#2D1B18] rounded-2xl rounded-tl-none border border-slate-200"
                  }`}
                >
                  {m.message}

                  <div
                    className={`text-[7px] mt-1 font-bold uppercase opacity-60 ${
                      isMe ? "text-right" : "text-left"
                    }`}
                  >
                    {new Date(
                      m.createdAt || Date.now()
                    ).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* QUICK REPLIES */}
      <div className="px-2 py-2 bg-white border-t border-slate-50 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
        {quickReplies.map((reply) => (
          <button
            key={reply}
            onClick={() => send(reply)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full border border-slate-100 text-[9px] font-black uppercase tracking-tight text-slate-500 hover:bg-brand hover:text-white transition-all"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* INPUT AREA */}
      <div className="p-3 bg-white border-t border-slate-100 shrink-0">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type message..."
            className="flex-1 resize-none bg-transparent py-2 text-[13px] focus:outline-none text-slate-700 placeholder:text-slate-400"
          />

          <button
            onClick={() => send()}
            className="h-8 w-8 flex items-center justify-center bg-brand text-white rounded-lg shadow-md active:scale-90 transition-all"
          >
            <svg
              className="w-3.5 h-3.5 rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
                d="M12 19l9-7-9-7V12H3v2h9v7z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
