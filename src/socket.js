import { io } from 'socket.io-client';

// Tailscale IP of this machine (ron-pc) — must match api.js
const BASE_URL = 'http://100.124.65.107:3000';

const socket = io(BASE_URL, {
  autoConnect: false,
  transports: ['websocket'],
  reconnectionAttempts: 5,
});

export default socket;
