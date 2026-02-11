import { io } from 'socket.io-client';

// Tailscale IP of permanent server (node) — must match api.js
const BASE_URL = 'http://100.115.197.11:3000';

const socket = io(BASE_URL, {
  autoConnect: false,
  transports: ['websocket'],
  reconnectionAttempts: 5,
});

export default socket;
