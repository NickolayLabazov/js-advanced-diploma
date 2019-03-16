export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.health = 50;
    this.type = type;
    // if (!(this.type === 'generic')) { throw 'Ошибка'; }
    // if ((this.type === 'generic') && (new.target)) { throw 'Ошибка'; }
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
    constructor(level) {
      super(level);
      this.type = 'bowman';
      this.attack = 25;
      this.defence = 25;
      this.distance = 4;
      this.distanceAttack = 1;
    }
  },

  class Undead extends Character {
    constructor(level) {
      super(level);
      this.type = 'undead';
      this.attack = 25;
      this.defence = 25;
      this.distance = 4;
      this.distanceAttack = 1;
    }
  },

  class Swordsman extends Character {
    constructor(level) {
      super(level);
      this.type = 'swordsman';
      this.attack = 40;
      this.defence = 10;
      this.distance = 2;
      this.distanceAttack = 2;
    }
  },

  class Vampire extends Character {
    constructor(level) {
      super(level);
      this.type = 'vampire';
      this.attack = 40;
      this.defence = 10;
      this.distance = 2;
      this.distanceAttack = 2;
    }
  },

  class Magician extends Character {
    constructor(level) {
      super(level);
      this.type = 'magician';
      this.attack = 10;
      this.defence = 40;
      this.distance = 1;
      this.distanceAttack = 4;
    }
  },

  class Daemon extends Character {
    constructor(level) {
      super(level);
      this.type = 'daemon';
      this.attack = 10;
      this.defence = 40;
      this.distance = 1;
      this.distanceAttack = 4;
    }
  },
];
