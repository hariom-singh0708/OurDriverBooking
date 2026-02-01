import { useEffect, useState } from "react";

export default function WaitingTimer({ active }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!active) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [active]);

  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="text-sm">
      Waiting Time: {minutes}m {secs}s
    </div>
  );
}
