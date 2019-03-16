export default class GameState {
  static from(object) {
    if (typeof (object) === 'object') {
      return {
        gamerPositions: object.gamerPositions,
        pcPositions: object.pcPositions,
        gamPos: object.gamPos,
        pcPos: object.pcPos,
        allPositions: object.allPositions,
        selected: object.selected,
        select: object.select,
        selectPers: object.selectPers,
        actCounter: object.actCounter,
        level: object.level,
        lock: object.lock,
        team: object.team,
      };
    }
    return null;
  }
}
