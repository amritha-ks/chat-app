const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/users')

const app = express();
const server = http.createServer(app); //created server outside express app
const io = socketio(server);

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {

    // socket.emit('message', generateMessage('Welcome'));
    // socket.broadcast.emit('message', generateMessage('A new user has joined'));

    // socket.on('join', ({ username, room }, callback) => {

    // const { error, user } = addUser({ id: socket.id, username, room });
    // if (error) {
    //     return callback(error);
    // }

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options });
        if (error) {
            return callback(error);
        }
        socket.join(user.room)//allows to join individual rooms, emit events to that specfic room
        socket.emit('message', generateMessage('Admin', 'Welcome'));
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined`));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    })


    socket.on('sendmessage', (res, callback) => {
        const user = getUser(socket.id);
        const filter = new Filter()
        if (filter.isProfane(res)) {
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username, res));
        callback()
    })

    socket.on('sendLocation', (res, callback) => {
        const msg = `https://google.com/maps?q=${res.latitude},${res.longitude}`;
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, msg));
        callback();
    })

    // upon closing of broswer
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})
// //print msg to terminal when client connects
// let count = 0;
// io.on('connection', (socket) => {
//     console.log('New web socket connection')
//     socket.emit('countUpdated', count);
//     socket.on('increment', (res) => {
//         count++;
//         // socket.emit('countUpdated', count);// only on refresh works, emits to that single connection
//         io.emit('countUpdated', count) // send to every connection
//     })
// })

server.listen(port, () => {
    console.log(`Server is up on port ${port}`);
})

//socket.emit                 //emits to that particual connection
//socket.broadcast.to.emit    //send msg to evry1 except to new socket
//io.emit                     //send to every connection

//io.to.emit                  //emits to evryone in that room
//socket.broadcast.to.emit    //send msg to evry1 except to new socket on that room