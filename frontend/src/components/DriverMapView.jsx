import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* ================= ICON ================= */
const driverIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
  iconSize: [32, 32],
});

/* ================= NORMALIZE ================= */
const normalize = (loc) => {
  if (!loc) return null;

  if (typeof loc.lat === "number" && typeof loc.lng === "number") {
    return { lat: loc.lat, lng: loc.lng };
  }

  if (Array.isArray(loc.coordinates)) {
    return {
      lat: loc.coordinates[1],
      lng: loc.coordinates[0],
    };
  }

  return null;
};

/* ================= AUTO CENTER ================= */
function AutoCenter({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);

  return null;
}

/* ================= MAIN ================= */
export default function DriverMapView({
  driverLocation,
  pickupLocation,
  dropLocation,
  rideStatus,
}) {
  const [smoothDriver, setSmoothDriver] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  const targetRef = useRef(null);
  const lastRouteRef = useRef("");

  /* ================= DRIVER SMOOTH MOVE ================= */
  useEffect(() => {
    const d = normalize(driverLocation);
    if (!d) return;

    targetRef.current = d;
    if (!smoothDriver) setSmoothDriver(d);
  }, [driverLocation]);

  useEffect(() => {
    if (!smoothDriver || !targetRef.current) return;

    const interval = setInterval(() => {
      setSmoothDriver((prev) => ({
        lat: prev.lat + (targetRef.current.lat - prev.lat) * 0.15,
        lng: prev.lng + (targetRef.current.lng - prev.lng) * 0.15,
      }));
    }, 300);

    return () => clearInterval(interval);
  }, [smoothDriver]);

  /* ================= ROUTE LOGIC ================= */
  // useEffect(() => {
  //   const driver = normalize(smoothDriver);
  //   const pickup = normalize(pickupLocation);
  //   const drop = normalize(dropLocation);

  //   let start = null;
  //   let end = null;

  //   // 🚶 Driver ➜ Pickup (before ride start)
  //   if (
  //     ["ACCEPTED", "ASSIGNED", "DRIVER_ARRIVED"].includes(rideStatus) &&
  //     driver &&
  //     pickup
  //   ) {
  //     start = driver;
  //     end = pickup;
  //   }

  //   // 🚗 Pickup ➜ Drop (ride started)
  //   if (rideStatus === "ON_RIDE" && pickup && drop) {
  //     start = pickup;
  //     end = drop;
  //   }

  //   if (!start || !end) {
  //     setRouteCoords([]);
  //     return;
  //   }

  //   const routeKey = `${start.lat},${start.lng}-${end.lat},${end.lng}`;
  //   if (lastRouteRef.current === routeKey) return;

  //   lastRouteRef.current = routeKey;

  //   const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

  //   fetch(url)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (!data.routes?.length) return;

  //       const coords = data.routes[0].geometry.coordinates.map(
  //         ([lng, lat]) => [lat, lng]
  //       );
  //       setRouteCoords(coords);
  //     })
  //     .catch(console.error);
  // }, [smoothDriver, pickupLocation, dropLocation, rideStatus]);







useEffect(() => {
  const pickup = normalize(pickupLocation);
  const drop = normalize(dropLocation);
  const driver = normalize(driverLocation); // use real driver, not smooth

  let start = null;
  let end = null;

  // Driver ➜ Pickup
  if (
    ["ACCEPTED", "ASSIGNED", "DRIVER_ARRIVED"].includes(rideStatus) &&
    driver &&
    pickup
  ) {
    start = driver;
    end = pickup;
  }

  // Pickup ➜ Drop
  if (rideStatus === "ON_RIDE" && pickup && drop) {
    start = pickup;
    end = drop;
  }

  if (!start || !end) {
    setRouteCoords([]);
    return;
  }

  const routeKey = `${start.lat},${start.lng}-${end.lat},${end.lng}`;
  if (lastRouteRef.current === routeKey) return;

  lastRouteRef.current = routeKey;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

  const fetchRoute = async () => {
    try {
      const res = await fetch(url, { signal: controller.signal });

      clearTimeout(timeout);

      if (!res.ok) {
        throw new Error("Route request failed");
      }

      const data = await res.json();

      if (!data.routes?.length) {
        setRouteCoords([]);
        return;
      }

      const coords = data.routes[0].geometry.coordinates.map(
        ([lng, lat]) => [lat, lng]
      );

      setRouteCoords(coords);
    } catch (err) {
      if (err.name !== "AbortError") {
        console.warn("Route fetch failed:", err.message);
        setRouteCoords([]);
      }
    }
  };

  fetchRoute();

  return () => controller.abort();

}, [rideStatus, pickupLocation, dropLocation, driverLocation]);


  const pickup = normalize(pickupLocation);
  const drop = normalize(dropLocation);

  return (
    <div className="h-full w-full rounded-xl overflow-hidden">
      <MapContainer
        center={
          smoothDriver
            ? [smoothDriver.lat, smoothDriver.lng]
            : pickup
            ? [pickup.lat, pickup.lng]
            : [28.6139, 77.209]
        }
        zoom={15}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* PICKUP */}
        {pickup && <Marker position={[pickup.lat, pickup.lng]} />}

        {/* DROP */}
        {drop && <Marker position={[drop.lat, drop.lng]} />}

        {/* DRIVER */}
        {smoothDriver && (
          <>
            <Marker
              position={[smoothDriver.lat, smoothDriver.lng]}
              icon={driverIcon}
            />
            <AutoCenter
              position={[smoothDriver.lat, smoothDriver.lng]}
            />
          </>
        )}

        {/* ROUTE */}
        {routeCoords.length > 0 && (
          <Polyline
            positions={routeCoords}
            color="#2563eb"
            weight={5}
          />
        )}
      </MapContainer>
    </div>
  );
}





