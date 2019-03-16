import { classes } from './Character.js';

export default class Team {
  constructor() {
    this.gamerTeam = [new classes[0](1), new classes[3](1)];
    this.pcTeam = [];
  }
}
