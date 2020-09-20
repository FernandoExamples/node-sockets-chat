class Users {
  constructor() {
    this.personas = [];
  }

  addPerson(id, nombre, sala) {
    let persona = { id, nombre, sala };
    this.personas.push(persona);
    return persona;
  }

  getPerson(id) {
    let persona = this.personas.find((persona) => {
      return persona.id === id;
    });

    return persona;
  }

  getPeople() {
    return this.personas;
  }

  /**
   * Regresa todos los clientes conectados a una sala especifica.
   */
  getPeopleByRoom(sala) {
    let peopleByRoom = this.personas.filter((persona) => {
      return persona.sala === sala;
    });
    return peopleByRoom;
  }

  deletePerson(id) {
    let persona = this.getPerson(id);

    this.personas = this.personas.filter((persona) => {
      return persona.id !== id;
    });

    return persona;
  }
}

module.exports = {
  Users,
};
