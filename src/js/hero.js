import Character from './Character.js';

export class Bowman extends Character {
  constructor() {
    super();
    this.attack = 25;
    this.defence = 25;
  }
}

export class Undead extends Character {
  constructor() {
    super();
    this.attack = 25;
    this.defence = 25;
  }
}

export class Swordsman extends Character {
  constructor() {
    super();
    this.attack = 40;
    this.defence = 10;
  }
}

export class Vampire extends Character {
  constructor() {
    super();
    this.attack = 40;
    this.defence = 10;
  }
}

export class Magician extends Character {
  constructor() {
    super();
    this.attack = 10;
    this.defence = 40;
  }
}

export class Datmon extends Character {
  constructor() {
    super();
    this.attack = 10;
    this.defence = 40;
  }
}
