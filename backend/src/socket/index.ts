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


        socket.on("disconnect", () => {

        });

        socket.on("tile:capture", (data) => {
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