import Team from './Team.js';
import { classes } from './Character.js';
import { generateTeam } from './generators.js';
import PositionedCharacter from './PositionedCharacter.js';
import GamePlay from './GamePlay.js';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.gamerPositions = [];// персонажи и позиции, где находится персонаж игрока
    this.pcPositions = [];// Персонажи и позиции, где находится персонаж компьютера
    this.gamPos = [];// позиции, где находится персонаж игрока
    this.pcPos = [];// позиции, где находится персонаж компьютера
    this.allPositions = [];
    this.selected = 1;
    this.select = false;
    this.positions = [0, 1]; // позиции, где может находится персонаж игрока
    this.positionsPC = []; // позиции, где может находится персонаж компьютера
    this.selectPers = 0;
    this.selectAllowedMove = [];
    this.selectAllowedAttack = [];
    this.actCounter = 0;
  }

  allowedMove(position, pers) {
    const boardArray = [];
    let arrayString = [];
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) {
      arrayString.push(i);
      if (arrayString.length === this.gamePlay.boardSize) {
        boardArray.push(arrayString);
        arrayString = [];
      }
    }

    const indexStr = Math.ceil(((position - position % this.gamePlay.boardSize) / this.gamePlay.boardSize));
    const indexColumn = position % this.gamePlay.boardSize;
    const allowedCell = [];
    for (let i = 1; i <= pers.distance; i += 1) {
      let alloweddColumn = indexColumn + i;
      if (alloweddColumn < this.gamePlay.boardSize) { allowedCell.push(boardArray[indexStr][alloweddColumn]); }

      let allowedStr = indexStr + i;
      if (allowedStr < this.gamePlay.boardSize) { allowedCell.push(boardArray[allowedStr][indexColumn]); }

      if ((alloweddColumn < this.gamePlay.boardSize) && (allowedStr < this.gamePlay.boardSize)) { allowedCell.push(boardArray[allowedStr][alloweddColumn]); }

      alloweddColumn = indexColumn - i;
      if (alloweddColumn >= 0) { allowedCell.push(boardArray[indexStr][alloweddColumn]); }
      if ((alloweddColumn >= 0) && (allowedStr < this.gamePlay.boardSize)) { allowedCell.push(boardArray[allowedStr][alloweddColumn]); }

      allowedStr = indexStr - i;
      if (allowedStr >= 0) { allowedCell.push(boardArray[allowedStr][indexColumn]); }
      if ((alloweddColumn >= 0) && (allowedStr >= 0)) { allowedCell.push(boardArray[allowedStr][alloweddColumn]); }

      alloweddColumn = indexColumn + i;
      if ((alloweddColumn < this.gamePlay.boardSize) && (allowedStr >= 0)) { allowedCell.push(boardArray[allowedStr][alloweddColumn]); }
    }

    return allowedCell;
  }

  allowedAttack(position, pers) {
    const boardArray = [];
    let arrayString = [];
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) {
      arrayString.push(i);
      if (arrayString.length === this.gamePlay.boardSize) {
        boardArray.push(arrayString);
        arrayString = [];
      }
    }

    const indexStr = Math.ceil(((position - position % this.gamePlay.boardSize) / this.gamePlay.boardSize));
    const indexColumn = position % this.gamePlay.boardSize;

    let indexStrMin = indexStr - pers.distanceAttack;
    if (indexStrMin < 0) { indexStrMin = 0; }
    let indexStrMax = indexStr + pers.distanceAttack;
    if (indexStrMax > this.gamePlay.boardSize - 1) { indexStrMax = this.gamePlay.boardSize - 1; }

    let indexColumnMin = indexColumn - pers.distanceAttack;
    if (indexColumnMin < 0) { indexColumnMin = 0; }
    let indexColumnMax = indexColumn + pers.distanceAttack;
    if (indexColumnMax > this.gamePlay.boardSize - 1) { indexColumnMax = this.gamePlay.boardSize - 1; }

    const allowedCell = [];
    for (let i = indexStrMin; i <= indexStrMax; i += 1) {
      for (let j = indexColumnMin; j <= indexColumnMax; j += 1) {
        allowedCell.push(boardArray[i][j]);
      }
    }
    return allowedCell;
  }

  checkIndex(index, array) {
    for (const position of array) {
      if (position.position === index) { // Проверка, есть ли в клетке персонаж игрока
        return position.character;
      }
    }
    return false;
  }

  move(index, pers) {
    if (this.actCounter % 2 === 0) {
      for (const elem of this.gamerPositions) { // Если выбранная клетка свободна, выбранному игроку присваивается новая позиция
        if (elem.character === pers) {
          elem.position = index;
        }
      }
    } else {
      for (const elem of this.pcPositions) { // Если выбранная клетка свободна, выбранному игроку присваивается новая позиция
        if (elem.character === pers) {
          elem.position = index;
        }
      }
    }


    this.allPositions = this.pcPositions.concat(this.gamerPositions);
    this.gamePlay.deselectCell(this.selected);// Снятие выделения
    this.gamePlay.redrawPositions(this.allPositions); // Отрисовка персонажей с новой позицией

    this.selected = 1;
    this.select = false;
    this.selectPers = 0;
    this.selectAllowedMove = [];
    this.gamPos = [];
    this.pcPos = [];
    for (const elem of this.gamerPositions) {
      this.gamPos.push(elem.position);
    }

    for (const elem of this.pcPositions) {
      this.pcPos.push(elem.position);
    }
  }

  pcAction() {
    const pcPositions = this.pcPositions;

    for (const position of pcPositions) {
      for (const gameCharacter of this.gamerPositions) {
        const attackCells = this.allowedAttack(position.position, position.character).indexOf(gameCharacter.position);
        if (attackCells >= 0) {
          this.gamePlay.selectCell(gameCharacter.position, 'red');
          this.selected = gameCharacter.position;
          this.attack(position.character, gameCharacter.character);
          this.actCounter += 1;
          return;
        }
      }
    }


    let dangerCells = [];
    for (const position of this.gamerPositions) { // Формирование ячеек, находящихся в поле действия атаки
      const danger = this.allowedAttack(position.position, position.character);
      dangerCells = dangerCells.concat(danger);
    }

    for (const pers of this.pcPositions) { // Проверка нахождения игрока ПК в поле действия атаки
      if (dangerCells.indexOf(pers.position) >= 0) {
        const allovedMovePC = this.allowedMove(pers.position, pers.character);
        for (const cell of allovedMovePC) {
          if ((dangerCells.indexOf(cell) === -1) && (this.checkIndex(cell, this.pcPositions) === false)) {
            this.move(cell, pers.character);
            this.actCounter += 1;
            return;
          }
        }
      }
    }

    const allovedMovePC = this.allowedMove(pcPositions[0].position, pcPositions[0].character);
    const boardArray = [];
    let arrayString = [];
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) {
      arrayString.push(i);
      if (arrayString.length === this.gamePlay.boardSize) {
        boardArray.push(arrayString);
        arrayString = [];
      }
      const gamerPositions = this.gamerPositions;
      let newCall = [this.gamePlay.boardSize, pcPositions[0].position];
      const indexStrGame = Math.ceil(((gamerPositions[0].position - gamerPositions[0].position % this.gamePlay.boardSize) / this.gamePlay.boardSize));
      const indexColumnGame = gamerPositions[0].position % this.gamePlay.boardSize;
      for (const position of this.allowedMove(pcPositions[0].position, pcPositions[0].character)) {
        const indexStrNew = Math.ceil(((position - position % this.gamePlay.boardSize) / this.gamePlay.boardSize));
        const indexColumnNew = position % this.gamePlay.boardSize;
        const dist = ((indexStrNew - indexStrGame) ** 2 + (indexColumnNew - indexColumnGame) ** 2) ** 0.5;
        if ((dist < newCall[0] && (this.checkIndex(position, this.pcPositions) === false) && (this.checkIndex(position, this.gamerPositions) === false))) { newCall = [dist, position]; }
      }

      for (const cell of allovedMovePC) {
        if ((dangerCells.indexOf(cell) < 0) && (this.checkIndex(cell, this.pcPositions) === false)) {
          this.move(newCall[1], pcPositions[0].character);
          this.actCounter += 1;
          return;
        }
      }
    }
  }

  attack(att, def) {
    def.health -= (att.attack - def.defence);
    if (def.health <= 0) {
      this.pcPositions = this.pcPositions.filter(elem => elem.character.health > 0);

      this.allPositions = this.pcPositions.concat(this.gamerPositions);
      this.gamePlay.redrawPositions(this.allPositions); // Отрисовка персонажей
    }
  }

  descript(obj) {
    const smileLevel = String.fromCodePoint(0x1F396);
    const smileAtack = String.fromCodePoint(0x2694);
    const smileDefence = String.fromCodePoint(0x1F6E1);
    const smileHealth = String.fromCodePoint(0x2764);
    const result = `${smileLevel}${obj.level} ${smileAtack} ${obj.attack} ${smileDefence} ${obj.defence} ${smileHealth} ${obj.health}`;
    return result;
  }

  init() {
    const themes = 'prairie';
    this.gamePlay.drawUi(themes); // Отрисовка поля

    const team = new Team();

    for (let i = 2; i < this.gamePlay.boardSize ** 2; i += 1) { // Заполнение this.positions возможными позициями
      if ((i % this.gamePlay.boardSize === 0) || (i % this.gamePlay.boardSize === 1)) { this.positions.push(i); }
    }

    let pos = -1; // Последняя сгенерированная позиция для игрока

    function positionNumber(num, boardSize) { // Определение случайной позиции для игрока
      let posNumber = Math.ceil(Math.random() * (boardSize * 2)) - 1;
      if (posNumber === num) { posNumber = positionNumber(num, boardSize); }
      return posNumber;
    }

    for (const elem of team.gamerTeam) { // Выбор случайной позиции, где находится персонаж игрока
      pos = positionNumber(pos, this.gamePlay.boardSize);
      const position = new PositionedCharacter(elem, this.positions[pos]);
      this.gamerPositions.push(position); // Заполнение this.gamerPositions случайными позициями
    }

    team.pcTeam = generateTeam(classes, 1, 2); // Генерация команды компьютера

    for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) { // Заполнение this.positionsPC возможными позициями
      if ((i % this.gamePlay.boardSize === 6) || (i % this.gamePlay.boardSize === 7)) { this.positionsPC.push(i); }
    }

    for (const elem of team.pcTeam) { // Выбор случайной позиции, где находится персонаж компьютера
      pos = positionNumber(pos, this.gamePlay.boardSize);
      const position = new PositionedCharacter(elem, this.positionsPC[pos]);
      this.pcPositions.push(position); // Заполнение this.gamerPositions случайными позициями
    }

    this.allPositions = this.pcPositions.concat(this.gamerPositions);
    this.gamePlay.redrawPositions(this.allPositions); // Отрисовка персонажей

    for (const elem of this.gamerPositions) {
      this.gamPos.push(elem.position);
    }

    for (const elem of this.pcPositions) {
      this.pcPos.push(elem.position);
    }


    for (let i = 0; i < this.gamePlay.cells.length; i += 1) {
      this.gamePlay.cells[i].addEventListener('mouseenter', () => this.onCellEnter(i)); // Вызов реакции на наведение мыши
      this.gamePlay.cells[i].addEventListener('click', () => this.onCellClick(i));// Вызов реакции на клик
      this.gamePlay.cells[i].addEventListener('mouseleave', () => this.onCellLeave(i));// Вызов реакции на вывод мыши
    }

    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  onCellClick(index) {
    this.gamePlay.deselectCell(this.selected);// Снятие выделения
    const hero = this.checkIndex(index, this.gamerPositions);
    if (hero) {
      if (!((hero.type === 'bowman') || (hero.type === 'swordsman') || (hero.type === 'magician') || (hero.type === 'undead') || (hero.type === 'vampire') || (hero.type === 'daemon'))) {
        GamePlay.showError('Некорректный тип');
      } else {
        this.gamePlay.selectCell(index); // Выделение позиции с игроком
        this.selected = index;
        this.select = true;
        this.selectPers = hero;
        this.selectAllowedMove = this.allowedMove(this.selected, this.selectPers); // Создание массива клеток, разрешенных для перехода
        this.selectAllowedAttack = this.allowedAttack(this.selected, this.selectPers); // Создание массива клеток, разрешенных для атаки
      }
    } else if (this.select) { // Проверка наличия игрока выбранной клетке в случае наличия выбранного игрока
      if (!(this.checkIndex(index, this.pcPositions)) && (this.selectAllowedMove.indexOf(index) >= 0)) {
        this.move(index, this.selectPers);
        this.actCounter += 1;
        this.pcAction();
      } else if (this.selectAllowedAttack.indexOf(index) >= 0) {
        const pers = this.checkIndex(index, this.pcPositions);

        this.attack(this.selectPers, pers);
        this.actCounter += 1;
        this.pcAction();
      }
    }
    // TODO: react to click
  }


  onCellEnter(index) {
    let positions = false;
    let positionsPC = false;
    let allowedMove = false;
    let allowedAttack = false;


    if (this.gamPos.indexOf(index) >= 0) { positions = true; }
    if (this.pcPos.indexOf(index) >= 0) { positionsPC = true; }
    if (this.selectAllowedMove.indexOf(index) >= 0) { allowedMove = true; }
    if (this.selectAllowedAttack.indexOf(index) >= 0) { allowedAttack = true; }

    if (positions) {
      this.gamePlay.setCursor('pointer');
      for (const position of this.gamerPositions) {
        if (position.position === index) {
          this.gamePlay.showCellTooltip(this.descript(position.character), index); // Вызов описания
        }
      }
    } else if (positionsPC && allowedAttack) { // Поправить !
      this.gamePlay.setCursor('crosshair');
      for (const position of this.pcPositions) {
        if (position.position === index) {
          this.gamePlay.showCellTooltip(this.descript(position.character), index); // Вызов описания
        }
      }
    } else if (positionsPC && !allowedAttack) {
      this.gamePlay.setCursor('not-allowed');
      for (const position of this.pcPositions) {
        if (position.position === index) {
          this.gamePlay.showCellTooltip(this.descript(position.character), index); // Вызов описания
        }
      }
    } else if (!positions && !positionsPC && allowedMove) {
      this.gamePlay.setCursor('pointer');
    } else { this.gamePlay.setCursor('not-allowed'); }


    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    this.gamePlay.setCursor('auto');
    // TODO: react to mouse leave
  }
}
