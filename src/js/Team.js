import { classes } from './Character.js';

const bowman = new classes[0]();
const vampire = new classes[3]();
export default class Team {
  constructor() {
    this.gamerTeam = [bowman, vampire];
    this.pcTeam = [];
  }
}
