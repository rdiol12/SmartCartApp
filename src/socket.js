import { io } from 'socket.io-client';

const BASE_URL = 'http://10.0.2.2:3000'; // Match api.js URL

const socket = io(BASE_URL, {
  autoConnect: true,
  transports: ['websocket'],
});

export default socket;
