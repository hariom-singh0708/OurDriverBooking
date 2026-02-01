export default function MapView({ driverLocation }) {
  return (
    <div className="border h-64 flex items-center justify-center bg-gray-100">
      {driverLocation ? (
        <div>
          <p className="font-bold">Driver Live Location</p>
          <p>Lat: {driverLocation.lat}</p>
          <p>Lng: {driverLocation.lng}</p>
        </div>
      ) : (
        <p>Waiting for driver location...</p>
      )}
    </div>
  );
}
