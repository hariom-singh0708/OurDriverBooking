import { createContext, useEffect, useState } from "react";
import socket from "../services/socket";

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    return () => socket.disconnect();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
