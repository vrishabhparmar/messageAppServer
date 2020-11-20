const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const cors = require('cors');
const router = require('./router')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./users.js')

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app)
const io = socketio(server);

app.use(cors());
app.use(router);
///socket.io code

io.on('connection', (socket) => {
   
    console.log("lo"+socket);
    // When a user sends a 'join' request 
    //This fucntion takes two parameter 
    socket.on('join', ({name, room}, callback) => {

        console.log("server works");
        const {error, user} = addUser({id: socket.id, name, room})

        if(error) return callback(error);

        socket.join(user.room);

        //this is a simple welcome message to the user s
        socket.emit('message', {user: 'admin', text : `${user.name}, welcome to the room ${user.room}`});

        

       

        /// broadcast
        socket.broadcast.to(user.room).emit('message', {user:'admin', text: `${user.name} has joined`});

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room) });

       

        callback();

       
    })

    socket.on('sendMessage',(message, callback) => {

        const user = getUser(socket.id);

        console.log(socket.id);

        io.to(user.room).emit('message', {user : user.name, text: message});

        callback();

    } )


    socket.on('disconnect', () => {

       const user = removeUser(socket.id);

       if(user)
       {
           io.to(user.room).emit('message', {user: 'admin', text: `${user.name} has left`});

    }
    
})

})



///////

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));



