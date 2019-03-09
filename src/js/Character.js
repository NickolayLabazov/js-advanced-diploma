export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.health = 50;
    this.type = type;
    this.distance = 3;
    this.distanceAttack = 2;
    if (!new.target) { throw 'Ошибка'; }
    // TODO: throw error if user use "new Character()"
  }

  levelUp() {
    this.level += 1;
    const health = this.health + 80;
    if (health <= 100) { this.health = health; } else { this.health = 100; }
  }
}


export const classes = [
  class Bowman extends Character {
    constructor() {
      super();
      this.type = 'bowman';
      this.attack = 25;
      this.defence = 25;
    }
  },

  class Undead extends Character {
    constructor() {
      super();
      this.type = 'undead';
      this.attack = 25;
      this.defence = 25;
    }
  },

  class Swordsman extends Character {
    constructor() {
      super();
      this.type = 'swordsman';
      this.attack = 40;
      this.defence = 10;
    }
  },

  class Vampire extends Character {
    constructor() {
      super();
      this.type = 'vampire';
      this.attack = 40;
      this.defence = 10;
    }
  },

  class Magician extends Character {
    constructor() {
      super();
      this.type = 'magician';
      this.attack = 10;
      this.defence = 40;
    }
  },

  class Daemon extends Character {
    constructor() {
      super();
      this.type = 'daemon';
      this.attack = 10;
      this.defence = 40;
    }
  },
];
