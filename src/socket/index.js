import io from "socket.io-client";
// let api = 'http://localhost:2999';
let api = 'http://ec2-54-198-43-159.compute-1.amazonaws.com:2999';
export const socket = io(api+'/');
localStorage.debug = '';
socket.on('connect', () => console.log(socket));
socket.on('connect_error',console.war);
socket.on('connect_timeout',console.warn);
socket.on('error',console.warn);
socket.on('disconnect',console.warn);
socket.emit('debug',true);