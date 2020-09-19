var socket = io();

var params = new URLSearchParams(window.location.search);

if (!params.has('nombre') || !params.has('sala'))
  window.location = 'index.html';

var usuario = {
  nombre: params.get('nombre'),
  sala: params.get('sala'),
};

socket.on('connect', function () {
  socket.emit('getInChat', usuario, function (resp) {
    console.log('Usuarios conectados', resp);
    renderUsers(resp);
  });
});

socket.on('notifyUserDisconected', function (message) {
  console.log(message);
  renderUsers(message.conectados);
  notifyUserDisconected(message);
  scrollBottom();
});

socket.on('notifyUserConected', function (message) {
  console.log(message);
  renderUsers(message.conectados);
  notifyUserConected(message);
  scrollBottom();
});

socket.on('sendMessage', function (message) {
  console.log(message);
  renderMessages(message, false);
  scrollBottom();
});

socket.on('privateMessage', function (message) {
  console.log(message);
});
