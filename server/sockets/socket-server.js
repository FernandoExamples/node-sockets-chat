const { io } = require('../server');
const { Users } = require('../classes/users');
const { createMessage } = require('../utils/utils');

const usuarios = new Users();

io.on('connection', (client) => {
  client.on('getInChat', function (usuario, callback) {
    if (!usuario.nombre || !usuario.sala) {
      return callback({
        error: true,
        mensaje: 'El nombre y la es necesario',
      });
    }

    client.join(usuario.sala);
    usuarios.addPerson(client.id, usuario.nombre, usuario.sala);

    callback(usuarios.getPeopleByRoom(usuario.sala));

    let message = createMessage(
      'Administrador',
      `${usuario.nombre} se unió al chat`
    );
    message.conectados = usuarios.getPeopleByRoom(usuario.sala);

    //notificar a los usuarios de la misma sala que alguien se ha conectado
    client.broadcast.to(usuario.sala).emit('notifyUserConected', message);
  });

  client.on('disconnect', () => {
    let deletedPerson = usuarios.deletePerson(client.id);
    let message = createMessage(
      'Administrador',
      `${deletedPerson.nombre} abandonó el chat`
    );
    message.conectados = usuarios.getPeopleByRoom(deletedPerson.sala);
    client.broadcast
      .to(deletedPerson.sala)
      .emit('notifyUserDisconected', message);
  });

  client.on('sendMessage', (data) => {
    let persona = usuarios.getPerson(client.id);
    let message = createMessage(persona.nombre, data.message);
    client.broadcast.to(persona.sala).emit('sendMessage', message);
  });

  client.on('privateMessage', (data) => {
    let persona = usuarios.getPerson(client.id);
    client.broadcast
      .to(data.to)
      .emit('privateMessage', createMessage(persona.nombre, data.message));
  });
});
