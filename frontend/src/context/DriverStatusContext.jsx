import { createContext, useState, useEffect } from "react";
import { getDriverStatus } from "../services/driver.api";

export const DriverStatusContext = createContext();

export const DriverStatusProvider = ({ children }) => {
  const [driverOnline, setDriverOnline] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getDriverStatus();
        setDriverOnline(res.data.data.isOnline);
      } catch {
        setDriverOnline(false);
      }
    };

    load();
  }, []);

  return (
    <DriverStatusContext.Provider
      value={{ driverOnline, setDriverOnline }}
    >
      {children}
    </DriverStatusContext.Provider>
  );
};
