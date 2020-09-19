function createMessage(name, message) {
  return {
    sendBy: name,
    message,
    fecha: new Date().getTime(),
  };
}

module.exports = { createMessage };
