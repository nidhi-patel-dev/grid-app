import { Server as HttpServer } from "http";
import { Server } from "socket.io";

let io: Server;

export const initializeSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: "*",
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });

        socket.on("tile:capture", (data) => {
            console.log("Tile captured:", data);

            io.emit("tile:update", data);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }

    return io;
};