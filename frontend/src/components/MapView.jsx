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

/* ================= ICONS ================= */

// 👤 Driver walking (before pickup)
const humanIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3048/3048122.png",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

// 🚗 Driver car (on ride)
const carIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
  iconSize: [36, 36],
  iconAnchor: [18, 36],
});

// 📍 Pickup
const pickupIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

// 🏁 Drop
const dropIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/252/252025.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

/* ================= HELPERS ================= */

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
      map.setView(position, map.getZoom(), {
        animate: true,
        duration: 0.5,
      });
    }
  }, [position, map]);

  return null;
}

/* ================= MAIN COMPONENT ================= */

export default function MapView({
  driverLocation,
  pickup,
  drop,
  rideStatus,
}) {
  const [driverPos, setDriverPos] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);

  const targetRef = useRef(null);
  const abortRef = useRef(null);
  const lastKeyRef = useRef("");

  const driver = normalize(driverLocation);
  const pick = normalize(pickup);
  const dropLoc = normalize(drop);

  /* ================= DRIVER ICON ================= */

  const driverIcon =
    rideStatus === "ON_RIDE" ? carIcon : humanIcon;

  /* ================= INIT DRIVER ================= */

  useEffect(() => {
    if (driver) {
      targetRef.current = driver;
      if (!driverPos) setDriverPos(driver);
    }
  }, [driverLocation]);

  /* ================= SMOOTH DRIVER MOVE ================= */

  useEffect(() => {
    if (!driverPos || !targetRef.current) return;

    const id = setInterval(() => {
      setDriverPos((prev) => ({
        lat: prev.lat + (targetRef.current.lat - prev.lat) * 0.2,
        lng: prev.lng + (targetRef.current.lng - prev.lng) * 0.2,
      }));
    }, 300);

    return () => clearInterval(id);
  }, [driverPos]);
  
/* ================= ROUTE FETCH ================= */
  useEffect(() => {
  let start = null;
  let end = null;

  // Determine route direction
  if (
    ["ACCEPTED", "ASSIGNED", "ARRIVED"].includes(rideStatus) &&
    driver &&
    pick
  ) {
    start = driver;
    end = pick;
  } else if (rideStatus === "ON_RIDE" && pick && dropLoc) {
    start = pick;
    end = dropLoc;
  }

  // If route not needed
  if (!start || !end) {
    setRouteCoords([]);
    return;
  }

  // Prevent duplicate route fetch
  const routeKey = `${start.lat},${start.lng}-${end.lat},${end.lng}`;
  if (lastKeyRef.current === routeKey) return;
  lastKeyRef.current = routeKey;

  // Abort previous request
  if (abortRef.current) {
    abortRef.current.abort();
  }

  const controller = new AbortController();
  abortRef.current = controller;

  const fetchRoute = async () => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

      // Auto timeout after 8 seconds
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, { signal: controller.signal });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Route request failed (${res.status})`);
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

  return () => {
    controller.abort();
  };

}, [rideStatus, pickup, drop]);

  /* ================= UI ================= */

  return (
    <div className="h-[70vh] w-full rounded-xl overflow-hidden shadow-lg">
      <MapContainer
        center={
          driverPos
            ? [driverPos.lat, driverPos.lng]
            : pick
            ? [pick.lat, pick.lng]
            : [28.6139, 77.209]
        }
        zoom={14}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* PICKUP */}
        {pick && (
          <Marker
            position={[pick.lat, pick.lng]}
            icon={pickupIcon}
          />
        )}

        {/* DROP */}
        {dropLoc && (
          <Marker
            position={[dropLoc.lat, dropLoc.lng]}
            icon={dropIcon}
          />
        )}

        {/* DRIVER */}
        {driverPos && (
          <>
            <Marker
              position={[driverPos.lat, driverPos.lng]}
              icon={driverIcon}
            />
            <AutoCenter
              position={[driverPos.lat, driverPos.lng]}
            />
          </>
        )}

        {/* ROUTE */}
        {routeCoords.length > 0 && (
          <>
            {/* Glow */}
            <Polyline
              positions={routeCoords}
              color="#6366f1"
              weight={10}
              opacity={0.25}
            />
            {/* Main line */}
            <Polyline
              positions={routeCoords}
              color="#4f46e5"
              weight={5}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
