const { io } = require('../server');
const { Users } = require('../classes/users');
const { createMessage } = require('../utils/utils');

const usuarios = new Users();

io.on('connection', (client) => {
  client.on('getInChat', (usuario, callback) =>
    getInChat(usuario, callback, client)
  );

  client.on('disconnect', () => disconnect(client));

  client.on('sendMessage', (data, callback) =>
    sendMessage(data.message, callback, client)
  );

  client.on('privateMessage', (data, callback) =>
    privateMessage(data.message, data.to, callback, client)
  );
});

/**
 * Almacena un nuevo cliente en el arreglo de usuarios y lo une a una sala.
 * Regresa como respuesta el arreglo de personas.
 * Emite el evento notifyUserConected a todos los usuarios de la misma sala.
 * @param {Object} usuario Objeto con el nombre y la sala del usuario
 * @param {Function} callback Funcion en donde se regresa la lista de personas conectadas
 */
function getInChat(usuario, callback, client) {
  if (!usuario.nombre || !usuario.sala) {
    return callback({
      error: true,
      mensaje: 'El nombre y la sala es necesario',
    });
  }

  client.join(usuario.sala);
  usuarios.addPerson(client.id, usuario.nombre, usuario.sala);

  callback(usuarios.getPeopleByRoom(usuario.sala));

  notifyUserConected(usuario.nombre, usuario.sala, client);
}

/**
 * Emite el evento notifyUserConected a todos los usuarios de la misma sala.
 * Se manada un mensaje en donde se regresa la lista de personas conectadas
 * @param {String} nombre Nombre del usuario conectado
 * @param {String} sala Sal del usuario conectado
 */
function notifyUserConected(nombre, sala, client) {
  let message = createMessage('Administrador', `${nombre} se unió al chat`);
  message.conectados = usuarios.getPeopleByRoom(sala);

  //notificar a los usuarios de la misma sala que alguien se ha conectado
  client.broadcast.to(sala).emit('notifyUserConected', message);
}

/**
 * Elimina el usuario desconectado del arreglo de usuarios
 * Y notifica a los usuarios de la misma sala
 */
function disconnect(client) {
  let deletedPerson = usuarios.deletePerson(client.id);
  let message = createMessage(
    'Administrador',
    `${deletedPerson.nombre} abandonó el chat`
  );
  message.conectados = usuarios.getPeopleByRoom(deletedPerson.sala);
  client.broadcast
    .to(deletedPerson.sala)
    .emit('notifyUserDisconected', message);
}

/**
 * Envia un mensaje a todas las personas de la misma sala
 * @param {String} message Mensaje a enviar
 */
function sendMessage(message, callback, client) {
  let persona = usuarios.getPerson(client.id);
  let newMessage = createMessage(persona.nombre, message);
  client.broadcast.to(persona.sala).emit('sendMessage', newMessage);
  callback(newMessage);
}

/**
 * Envia un mensaje privado cliente-cliente
 * @param {String} message Mensaje a enviar
 * @param {String} to ID del cliente a quien se envia el mensaje
 */
function privateMessage(message, to, callback, client) {
  let persona = usuarios.getPerson(client.id);
  let newMessage = createMessage(persona.nombre, message);
  client.broadcast.to(to).emit('privateMessage', newMessage);
  callback(newMessage);
}
