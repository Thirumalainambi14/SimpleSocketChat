const socket = io('http://localhost:3000');

const messageContainer = document.getElementById('message-container');
const roomContainer = document.getElementById('room-container');
const messageForm = document.getElementById("send-container");
const messageInput = document.getElementById('message-input');

if (messageForm != null) {

  let name = prompt("What's your name ?");
  appendMessage("You Joined");
  socket.emit('new-user', roomName, name);


  messageForm.addEventListener('submit', e => {
    e.preventDefault();
    const message = messageInput.value;
    console.log(message);
    appendMessage(`You: ${message}`);
    socket.emit('send-chat-message', roomName, { name, message });
    messageInput.value = '';
  });


}

function appendMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  messageContainer.append(messageElement);
}

socket.on('room-created', room => {
  const roomElement = document.createElement('div');
  roomElement.innerText = room;
  const roomLink = document.createElement('a');
  roomLink.href = `/${room}`;
  roomLink.innerText = 'Join'
  roomContainer.append(roomElement);
  roomContainer.append(roomLink);
})

socket.on('chat-message', data => {
  console.log(data);
  appendMessage(`${data.name}: ${data.message.message}`);
});

socket.on('user-connected', name => {
  appendMessage(`${name} connected`);
});

socket.on('user-disconnected', name => {
  appendMessage(`${name} disconnected`);
})
