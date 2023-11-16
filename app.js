// Importing dependencies
import dotenv from 'dotenv';
import express from 'express';
import { Server } from 'socket.io';
import path from 'path';
import http from 'http';

// Importing database models
import connection from './config.js';
import Message from './Models/message_schema.js';
import User from './Models/user_schema.js';

// Initializing environment variables
dotenv.config();

// Initializing Express app and creating an HTTP server
const app = express();
const server = http.createServer(app);

// Creating a Socket.IO server with CORS configuration
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
});

// Serving static files from the 'public' directory
app.use(express.static(path.join(path.resolve(), 'public')));

// Handling socket connection
io.on('connection', (socket) => {
    console.log('Connection established');

    // Handling 'join' socket event
    socket.on('join', async (username) => {
        // Storing a new connected user
        const newUser = new User({
            username: username,
            connected: true,
        });
        await newUser.save();

        // Retrieving all connected users
        const connectedClients = await User.find({ connected: true });

        // User Join display event
        socket.broadcast.emit('user_joined', username);

        // Emitting 'connected_clients' event to all clients
        io.emit('connected_clients', connectedClients);

        // Loading previous messages for the current user
        socket.username = username;
        Message.find().sort({ createdAt: 1 }).limit(50)
            .then(messages => {
                // Emitting 'load_messages' event to the client
                socket.emit('load_messages', messages);
            });

        // Listen for 'typing' events
        socket.on('typing', () => {
            // Broadcast 'user typing' event to all connected clients except the sender
            socket.broadcast.emit('user_typing', { username: socket.username });
        });

        // Listen for 'stop typing' events
        socket.on('stop_typing', () => {
            // Broadcast 'user stopped typing' event to all connected clients except the sender
            socket.broadcast.emit('user_stopped_typing', { username: socket.username });
        });

        // Handling 'new_message' socket event
        socket.on('new_message', async (message) => {
            const userMessage = {
                username: socket.username,
                message: message,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            const newMessage = new Message(userMessage);
            await newMessage.save();

            // Broadcasting messages across all clients
            socket.broadcast.emit('broadcast_message', userMessage);
        });
    });

    // Handling 'disconnect' socket event
    socket.on('disconnect', async () => {
        // Removing the user upon disconnection
        await User.deleteOne({ username: socket.username });
        const connectedUsers = await User.find({ connected: true });

        // Emitting 'left_chat' event to all clients
        io.emit('left_chat', connectedUsers, socket.username);
        console.log('Connection terminated!');
    });
});

// Listening to the server request on port 3000
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    // Establishing a connection to the database
    connection();
});
