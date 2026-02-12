// src/context/ActiveRideContext.jsx
import { createContext, useState } from "react";

export const ActiveRideContext = createContext(null);

export const ActiveRideProvider = ({ children }) => {
  const [activeRide, setActiveRide] = useState(null);

  return (
    <ActiveRideContext.Provider value={{ activeRide, setActiveRide }}>
      {children}
    </ActiveRideContext.Provider>
  );
};
