let welcome_msg = document.getElementById('welcome');
let messageInput = document.getElementById("messageInput");
let chatMessages = document.getElementById("chatMessages");
let connectedUsers = document.getElementById("connected_users");
let clients = document.getElementById("count");
let typingIndicator = document.getElementById("typingIndicator");
let typingTimer;

// Making a socket server connection
const socket = io.connect("http://localhost:3000");
const username = prompt("Enter your name");

// Check if the username is provided
if (!username || username.trim() === "") {
    // Handle the case where the user canceled or provided an empty username
    alert("Invalid username. Please refresh the page and provide a valid username.");
    throw new Error("Invalid username");
}

// Event: Emit Join
socket.emit("join", username);

welcome_msg.innerHTML = `<span id="status-dot" class="mx-1"></span> Welcome, <b>${username}</b>`;

// Event: Connected clients
socket.on('connected_clients', (users) => {
    connectedUsers.innerHTML = "";
    users.forEach((user) => {
        appendClient(user.username);
    });
    // Increase the client count
    clients.innerText = connectedUsers.childElementCount;
});

// Event: User Joined
socket.on('user_joined', (username) => {
    let leftMsg = document.createElement('div');
    leftMsg.classList.add('left_User');
    leftMsg.innerHTML = `
    <div class="alert alert-success text-center w-50 p-0">
      <strong>${username}</strong> joined the chat.
    </div>
    `
    chatMessages.append(leftMsg);
})

// Event: Load messages
socket.on("load_messages", (messages) => {
    messages.map((message) => {
        appendMessage(message);
    });
});

// Event: Broadcast message
socket.on("broadcast_message", (userMessage) => {
    appendMessage(userMessage);
});

// Event: User left chat
socket.on('left_chat', (users, username) => {
    // display user left message
    let leftMsg = document.createElement('div');
    leftMsg.classList.add('left_User');
    leftMsg.innerHTML = `
    <div class="alert alert-info text-center w-50 p-0">
      <strong>${username}</strong> left the chat.
    </div>
    `
    chatMessages.append(leftMsg);

    // Updating connected clients
    connectedUsers.innerHTML = "";
    users.forEach((user) => {
        appendClient(user.username);
    });
    // Update clients count
    clients.innerText = connectedUsers.childElementCount;
});


/*  Functional components  */

// Append messages to the chat
function appendMessage(message) {
    let messageDiv = document.createElement("div");
    messageDiv.classList.add('chat');
    messageDiv.innerHTML = `
    <div class="yours messages">
        <img src="https://png.pngtree.com/png-vector/20220511/ourmid/pngtree-superhero-icon-hero-super-symbol-png-image_4585497.png" alt="" style="height:30px" />
        <div class="message">
            ${message.username}<span>${message.timestamp}</span>
            <div>${message.message}</div>
        </div>
    </div>`;
    chatMessages.appendChild(messageDiv);
}

// Append a client to the connected clients list
function appendClient(username) {
    const connected_client = document.createElement('div');
    connected_client.id = 'connectedUsers'
    connected_client.classList.add('list-group');
    connected_client.innerHTML = `
    <button type="button"
    class="list-group-item list-group-item-success">
        <span id="status-dot" class="mx-1"></span>
        ${username}
    </button>`;
    connectedUsers.appendChild(connected_client);
};

// Handle send message
function sendMessage(e) {
    e.preventDefault();
    const message = messageInput.value;
    if (messageInput.value.trim() !== "") {
        // send new_message socket event
        socket.emit('new_message', message);
        // append message to the list
        myMessage({
            username: username,
            message: message,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        // Clear the input field after sending the message
        messageInput.value = "";
        // Scroll to the bottom of the chat messages
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Append own message to the chat
function myMessage(message) {
    let messageDiv = document.createElement("div");
    messageDiv.classList.add('chat');
    messageDiv.innerHTML = `
    <img src="https://png.pngtree.com/png-vector/20220511/ourmid/pngtree-superhero-icon-hero-super-symbol-png-image_4585497.png" alt="" style="height:0px" />
    <div class="mine messages">
        <div class="message last">
            ${message.username}<span> ${message.timestamp}</span>
            <div>${message.message}</div>
        </div>
    </div>`;
    chatMessages.appendChild(messageDiv);
}

// Typing events

// Emit 'typing' event when user starts typing
messageInput.addEventListener('input', () => {
    // Clear the previous typing timer
    clearTimeout(typingTimer);

    // Emit 'typing' event to the server
    socket.emit('typing');

    // Set a new timer to detect when the user stops typing after 2 second (adjust as needed)
    typingTimer = setTimeout(() => {
        socket.emit('stop_typing');
    }, 2000);
});

// Listen for 'user typing' events
socket.on('user_typing', (data) => {
    typingIndicator.style.display = "block";
    typingIndicator.innerHTML = `${data.username} is typing...`;
});

// Listen for 'user stopped typing' events
socket.on('user_stopped_typing', (data) => {
    typingIndicator.style.display = "none";
    typingIndicator.innerHTML = '';
});



/* Tooltip DriverCode */
// document.addEventListener('DOMContentLoaded', function () {
// Select all elements with the class 'message'
// let messages = document.querySelector('.yours');
// console.log(messages);

// Iterate over each message and create a Popper instance for it
// messages.forEach((message)=> {
//     // Create a new Popper instance for each message
//     let tooltip = new Popper(message, {
//         placement: 'top',
//         content: 'This is a tooltip',
//         modifiers: {
//             offset: {
//                 offset: '0,10'
//             }
//         }
//     });

//     // Show and hide the tooltip on mouseover and mouseout
//     message.addEventListener('mouseover', function () {
//         console.log('hey');
//         tooltip.update();
//         tooltip.show();
//     });

//     message.addEventListener('mouseout', function () {
//         tooltip.hide();
//     });
// });
// });