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

// 👤 Human (driver going to pickup)
const humanIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3048/3048122.png",
  iconSize: [32, 32],
});

// 🚗 Car (ride started)
const carIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/744/744465.png",
  iconSize: [32, 32],
});

/* ================= NORMALIZE ================= */
const normalize = (loc) => {
  if (!loc) return null;

  if (typeof loc.lat === "number" && typeof loc.lng === "number") {
    return { lat: loc.lat, lng: loc.lng };
  }

  if (Array.isArray(loc.coordinates) && loc.coordinates.length === 2) {
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
      console.log("🗺️ AutoCenter →", position);
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, map]);

  return null;
}

/* ================= MAIN ================= */
export default function MapView({
  driverLocation,
  pickup,
  drop,
  rideStatus,
}) {
  const [routeCoords, setRouteCoords] = useState([]);
  const [smoothDriver, setSmoothDriver] = useState(null);

  const targetLocation = useRef(null);
  const lastRouteRef = useRef("");

  /* ================= DRIVER ICON ================= */
  const getDriverIcon = () => {
    if (
      ["ACCEPTED", "ASSIGNED", "ARRIVED"].includes(rideStatus)
    ) {
      return humanIcon;
    }

    if (rideStatus === "ON_RIDE") {
      return carIcon;
    }

    return carIcon;
  };

  /* ================= INIT / UPDATE DRIVER ================= */
  useEffect(() => {
    const d = normalize(driverLocation);

    console.log("📍 RAW driverLocation:", driverLocation);
    console.log("📍 NORMALIZED driver:", d);

    if (d) {
      targetLocation.current = d;

      if (!smoothDriver) {
        console.log("🚗 INIT smoothDriver");
        setSmoothDriver(d);
      }
    }
  }, [driverLocation]);

  /* ================= SMOOTH DRIVER MOVEMENT ================= */
  useEffect(() => {
    if (!smoothDriver || !targetLocation.current) return;

    const interval = setInterval(() => {
      setSmoothDriver((prev) => {
        if (!prev) return prev;

        return {
          lat:
            prev.lat +
            (targetLocation.current.lat - prev.lat) * 0.15,
          lng:
            prev.lng +
            (targetLocation.current.lng - prev.lng) * 0.15,
        };
      });
    }, 300);

    return () => clearInterval(interval);
  }, [smoothDriver]);

  /* ================= ROUTE LOGIC ================= */
  useEffect(() => {
    let start, end;

    const driver = normalize(smoothDriver);
    const pick = normalize(pickup);
    const dropLoc = normalize(drop);

    console.log("🧭 RIDE STATUS:", rideStatus);
    console.log("🧭 DRIVER:", driver);
    console.log("🧭 PICKUP:", pick);
    console.log("🧭 DROP:", dropLoc);

    // 🚶 Driver → Pickup
    if (
      ["ACCEPTED", "ASSIGNED", "ARRIVED"].includes(rideStatus) &&
      driver &&
      pick
    ) {
      start = driver;
      end = pick;
      console.log("➡️ ROUTE: DRIVER → PICKUP");
    }

    // 🚗 Pickup → Drop
    if (rideStatus === "ON_RIDE" && pick && dropLoc) {
      start = pick;
      end = dropLoc;
      console.log("➡️ ROUTE: PICKUP → DROP");
    }

    if (!start || !end) {
      console.log("❌ Route skipped (start/end missing)");
      setRouteCoords([]);
      return;
    }

    const routeKey = `${start.lat},${start.lng}-${end.lat},${end.lng}`;

    // ⛔ prevent duplicate OSRM calls
    if (lastRouteRef.current === routeKey) {
      console.log("⏭️ Route unchanged, skipping OSRM");
      return;
    }

    lastRouteRef.current = routeKey;

    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;

    console.log("🌐 OSRM URL:", url);

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (!data.routes?.length) {
          console.log("❌ No route found");
          setRouteCoords([]);
          return;
        }

        const coords = data.routes[0].geometry.coordinates.map(
          ([lng, lat]) => [lat, lng]
        );

        console.log("🟣 ROUTE POINTS:", coords.length);
        setRouteCoords(coords);
      })
      .catch((err) => {
        console.error("❌ OSRM ERROR:", err);
      });
  }, [rideStatus, pickup, drop]);

  /* ================= UI ================= */
  const pick = normalize(pickup);
  const dropLoc = normalize(drop);

  return (
    <div className="h-[70vh] w-full">
      <MapContainer
        center={
          smoothDriver
            ? [smoothDriver.lat, smoothDriver.lng]
            : pick
            ? [pick.lat, pick.lng]
            : [28.6139, 77.209]
        }
        zoom={14}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* PICKUP */}
        {pick && <Marker position={[pick.lat, pick.lng]} />}

        {/* DROP */}
        {dropLoc && <Marker position={[dropLoc.lat, dropLoc.lng]} />}

        {/* DRIVER */}
        {smoothDriver && (
          <>
            <Marker
              position={[smoothDriver.lat, smoothDriver.lng]}
              icon={getDriverIcon()}
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
            color="#4f46e5"
            weight={5}
          />
        )}
      </MapContainer>
    </div>
  );
}
