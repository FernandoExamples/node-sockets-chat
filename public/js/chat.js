var params = new URLSearchParams(window.location.search);
if (!params.get('nombre').trim() || !params.get('sala').trim()) {
  window.location = 'index.html';
}
var currentId = null;

//referenias del DOM
var divUsuarios = $('#divUsuarios');
var formEnviar = $('#formEnviar');
var txtMensaje = $('#txtMensaje');
var divChatbox = $('#divChatbox');
var box_title = $('#box-title');
var checkboxAll = $('#checkboxAll');
var btnOpenPanel = $('#btnOpenPanel');
var chatLeftAside = $('#chatLeftAside');

$('#box-title small').text(params.get('sala'));
$('#chat-title span').text(params.get('sala'));

//Funciones para renderizar el DOM
function renderUsers(personas) {
  var html = '';

  for (let i = 0; i < personas.length; i++) {
    let nombre = personas[i].nombre;
    let id = personas[i].id;
    html += `<li>`;
    html += `  <a data-id='${id}' data-nombre='${nombre}' href="javascript:void(0)"><img src="assets/images/users/1.jpg" alt="user-img" class="img-circle">`;
    html += `    <span>${nombre} <small class="text-success">online</small></span></a>`;
    html += `</li>`;
  }

  divUsuarios.html(html);
}

function renderMessages(mensaje, isMe) {
  var html = '';
  var fecha = new Date(mensaje.fecha);
  var hora = fecha.getHours() + ':' + fecha.getMinutes();

  if (isMe) {
    html += `<li class="reverse animated fadeIn">`;
    html += `<div class="chat-content">`;
    html += `  <h5>${mensaje.sendBy}</h5>`;
    html += `  <div class="box bg-light-inverse">${mensaje.message}</div>`;
    html += `</div>`;
    html += `<div class="chat-img"><img src="assets/images/users/5.jpg" alt="user" /></div>`;
    html += `<div class="chat-time">${hora}</div>`;
    html += `</li> `;
  } else {
    html += `<li class='animated fadeIn'>`;
    html += `  <div class="chat-img"><img src="assets/images/users/1.jpg" alt="user" /></div>`;
    html += `  <div class="chat-content">`;
    html += `    <h5>${mensaje.sendBy}</h5>`;
    html += `    <div class="box bg-light-info">${mensaje.message}</div>`;
    html += `  </div>`;
    html += `  <div class="chat-time">${hora}</div>`;
    html += `</li>`;
  }

  divChatbox.append(html);
}

function notifyUserDisconected(mensaje) {
  var fecha = new Date(mensaje.fecha);
  var hora = fecha.getHours() + ':' + fecha.getMinutes();
  var html = '';
  html += `<li class='animated fadeIn'>`;
  html += `  <div class="chat-content">`;
  html += `    <h5>${mensaje.sendBy}</h5>`;
  html += `    <div class="box bg-light-danger">${mensaje.message}</div>`;
  html += `  </div>`;
  html += `  <div class="chat-time">${hora}</div>`;
  html += `</li>`;
  divChatbox.append(html);
}

function notifyUserConected(mensaje) {
  var fecha = new Date(mensaje.fecha);
  var hora = fecha.getHours() + ':' + fecha.getMinutes();
  var html = '';
  html += `<li class='animated fadeIn'>`;
  html += `  <div class="chat-content">`;
  html += `    <h5>${mensaje.sendBy}</h5>`;
  html += `    <div class="box bg-light-info">${mensaje.message}</div>`;
  html += `  </div>`;
  html += `  <div class="chat-time">${hora}</div>`;
  html += `</li>`;
  divChatbox.append(html);
}

function scrollBottom() {
  // selectors
  var newMessage = divChatbox.children('li:last-child');

  // heights
  var clientHeight = divChatbox.prop('clientHeight');
  var scrollTop = divChatbox.prop('scrollTop');
  var scrollHeight = divChatbox.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight() || 0;

  if (
    clientHeight + scrollTop + newMessageHeight + lastMessageHeight >=
    scrollHeight
  ) {
    divChatbox.scrollTop(scrollHeight);
  }
}

//Listeners
divUsuarios.on('click', 'a', function () {
  var id = $(this).data('id');
  var nombre = $(this).data('nombre');
  if (!id) return;

  console.log(id);
  console.log(nombre);

  checkboxAll.prop('checked', false);
  divChatbox.html('');
  $('a').removeClass('selected');
  $(this).addClass('selected');
  $('#box-title small').text(nombre);
  chatLeftAside.toggleClass('show-aside');
  
  currentId = id;
});

checkboxAll.on('click', function () {
  checkboxAll.prop('checked', true);
  $('a').removeClass('selected');
  $('#box-title small').text(params.get('sala'));
  currentId = null;
});

formEnviar.submit(function (e) {
  e.preventDefault();
  if (!txtMensaje.val().trim()) return;

  if (currentId) {
    socket.emit(
      'privateMessage',
      {
        message: txtMensaje.val(),
        to: currentId,
      },
      function (message) {
        console.log(message);
        txtMensaje.val('');
        renderMessages(message, true);
        scrollBottom();
      }
    );
  } else {
    socket.emit(
      'sendMessage',
      {
        message: txtMensaje.val(),
      },
      function (message) {
        console.log(message);
        txtMensaje.val('');
        renderMessages(message, true);
        scrollBottom();
      }
    );
  }
});

btnOpenPanel.click(function (e) {
  e.preventDefault();
  chatLeftAside.toggleClass('show-aside');
});
