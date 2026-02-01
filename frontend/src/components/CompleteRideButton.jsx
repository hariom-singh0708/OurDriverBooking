import axios from "axios";

export default function CompleteRideButton({ rideId }) {
  const completeRide = async () => {
    await axios.put(
      `http://localhost:5000/rides/${rideId}/complete`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    alert("Ride completed");
  };

  return (
    <button
      onClick={completeRide}
      className="bg-green-700 text-white px-4 py-2"
    >
      Complete Ride
    </button>
  );
}
