import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join_ride", (rideId) => {
      socket.join(rideId);
      console.log(`Joined ride room ${rideId}`);
    });

    socket.on("driver_location_update", (data) => {
      io.to(data.rideId).emit("driver_location_update", data);
    });

    socket.on("ride_status_update", (data) => {
      io.to(data.rideId).emit("ride_status_update", data);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

export const getIO = () => io;
