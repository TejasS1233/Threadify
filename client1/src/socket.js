import { io } from "socket.io-client";

// Connect to your live Render server
export const socket = io("https://threadify-1.onrender.com");