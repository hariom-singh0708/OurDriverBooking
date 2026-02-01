import { useEffect, useState } from "react";
import { getClientHistory } from "../../services/history.api";
import RideSummary from "../common/RideSummary";

export default function ClientHistory() {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    getClientHistory().then((res) => setRides(res.data.data));
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">My Rides</h1>

      {rides.length === 0 && <p>No rides yet</p>}

      {rides.map((ride) => (
        <RideSummary key={ride._id} ride={ride} />
      ))}
    </div>
  );
}
