import Team from './Team.js';
import { classes } from './Character.js';
import { characterGenerator, generateTeam } from './generators.js';
import PositionedCharacter from './PositionedCharacter.js';
import GamePlay from './GamePlay.js';
import themes from './themes.js';
import GameState from './GameState.js';


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
    this.level = 1;
    this.lock = true;
    this.team = [];
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
    const compareDist = (A, B) => {
      return B.character.distanceAttack - A.character.distanceAttack
    } 

    const pcPositions = this.pcPositions.slice().sort(compareDist);
    for (const position of pcPositions) {
      for (const gameCharacter of this.gamerPositions) {
        const attackCells = this.allowedAttack(position.position, position.character).indexOf(gameCharacter.position);
        if (attackCells >= 0) {
          this.gamePlay.selectCell(gameCharacter.position, 'red');
          this.selected = gameCharacter.position;
          this.attack(position.character, gameCharacter.character, this.selected);
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

      const compareAtack = (A, B) => {
        return B.character.attack - A.character.attack
      } 
  
      const gamerPositions = this.gamerPositions.slice().sort(compareAtack);
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

  attack(att, def, index) {
    let damage = Math.max(att.attack - def.defence, att.attack * 0.1);
    def.health -= damage;     
    let health0 = () => {
      if (def.health <= 0) {
        this.pcPositions = this.pcPositions.filter(elem => elem.character.health > 0);
        this.gamerPositions = this.gamerPositions.filter(elem => elem.character.health > 0);
        this.allPositions = this.pcPositions.concat(this.gamerPositions);
        this.gamePlay.redrawPositions(this.allPositions); // Отрисовка персонажей
        this.gamerPositions.length;
        if (this.gamerPositions.length === 0) {
          this.lock = false;
          this.gamePlay.deselectCell(this.selected);
          alert('Game over');
        } else if (this.pcPositions.length === 0) {
          this.team.gamerTeam.filter(elem => elem.health > 0);
          if (this.level === 4) {
            this.lock = false;
            this.gamePlay.deselectCell(this.selected);
            alert('Победа');
          } else {
            alert('Переход на следующий уровень');
            this.levelUp();
          }
        }
      }
     }
    this.gamePlay.showDamage(index, damage).then(() => health0()
    ).then(() => this.gamePlay.redrawPositions(this.allPositions)) // Отрисовка персонажей 
    
    
  }

  descript(obj) {
    const smileLevel = String.fromCodePoint(0x1F396);
    const smileAtack = String.fromCodePoint(0x2694);
    const smileDefence = String.fromCodePoint(0x1F6E1);
    const smileHealth = String.fromCodePoint(0x2764);
    const result = `${smileLevel}${obj.level} ${smileAtack} ${obj.attack} ${smileDefence} ${obj.defence} ${smileHealth} ${obj.health}`;
    return result;
  }

  levelUp() {
    this.level += 1;
    for (const pers of this.team.gamerTeam) {
      pers.level += 1;
      const attack = pers.attack * (1.8 - 0.01 * pers.health);
      pers.attack = Math.max(pers.attack, attack);
      const defence = pers.defence * (1.8 - 0.01 * pers.health);
      pers.defence = Math.max(pers.defence, defence);
      const health = pers.health + 80;
      if (health <= 100) { pers.health = health; } else { pers.health = 100; }
    }
    const generator = characterGenerator(classes, this.level - 1);
    const newCharacter = generator.next().value;
    this.team.gamerTeam.push(newCharacter);
    this.gamPos = [];// позиции, где находится персонаж игрока
    this.pcPos = [];// позиции, где находится персонаж компьютера
    this.actCounter = 0;
    this.gamerPositions = [];// персонажи и позиции, где находится персонаж игрока
    this.pcPositions = [];// Персонажи и позиции, где находится персонаж компьютера
    this.init();
  }

  init() {
    let theme = themes.prairie;
    if (this.level === 2) { theme = themes.desert; }
    if (this.level === 3) { theme = themes.arctic; }
    if (this.level === 4) { theme = themes.mountain; }

    this.gamePlay.drawUi(theme); // Отрисовка поля

    if (this.level === 1) {
      this.team = new Team();
    }

    for (let i = 2; i < this.gamePlay.boardSize ** 2; i += 1) { // Заполнение this.positions возможными позициями
      if ((i % this.gamePlay.boardSize === 0) || (i % this.gamePlay.boardSize === 1)) { this.positions.push(i); }
    }

    const closedPos = [-1]; // Последняя сгенерированная позиция для игрока

    function positionNumber(num, boardSize) { // Определение случайной позиции для игрока
      let posNumber = Math.ceil(Math.random() * (boardSize * 2)) - 1;
      if (num.indexOf(posNumber) >= 0) { posNumber = positionNumber(num, boardSize); }
      return posNumber;
    }


    for (const elem of this.team.gamerTeam) { // Выбор случайной позиции, где находится персонаж игрока
      const pos = positionNumber(closedPos, this.gamePlay.boardSize);
      closedPos.push(pos);
      const position = new PositionedCharacter(elem, this.positions[pos]);
      this.gamerPositions.push(position); // Заполнение this.gamerPositions случайными позициями
    }

    this.team.pcTeam = generateTeam(classes, this.level, this.team.gamerTeam.length); // Генерация команды компьютера

    for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) { // Заполнение this.positionsPC возможными позициями
      if ((i % this.gamePlay.boardSize === 6) || (i % this.gamePlay.boardSize === 7)) { this.positionsPC.push(i); }
    }

    for (const elem of this.team.pcTeam) { // Выбор случайной позиции, где находится персонаж компьютера
      const pos = positionNumber(closedPos, this.gamePlay.boardSize);
      closedPos.push(pos);
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
    this.eventList();
  }

  eventList() {
    for (let i = 0; i < this.gamePlay.cells.length; i += 1) {
      this.gamePlay.cells[i].addEventListener('mouseenter', () => this.onCellEnter(i)); // Вызов реакции на наведение мыши
      this.gamePlay.cells[i].addEventListener('mouseenter', () => this.gamePlay.setCursor(this.onCellEnterCursor(i))); // Вызов реакции на наведение мыши
      this.gamePlay.cells[i].addEventListener('click', () => this.onCellClick(i));// Вызов реакции на клик
      this.gamePlay.cells[i].addEventListener('mouseleave', () => this.onCellLeave(i));// Вызов реакции на вывод мыши
    }

    this.gamePlay.newGameEl.addEventListener('click', () => this.onNewGameClick()); // Вызов реакции на нажатие кнопки New Game
    this.gamePlay.newGameEl.addEventListener('mouseenter', () => this.onNewGameEnter());
    this.gamePlay.newGameEl.addEventListener('mouseleave', () => this.onNewGameLeave());

    this.gamePlay.saveGameEl.addEventListener('click', () => this.onSaveGameElClick()); // Вызов реакции на нажатие кнопки Save Game
    this.gamePlay.saveGameEl.addEventListener('mouseenter', () => this.onSaveGameElEnter());
    this.gamePlay.saveGameEl.addEventListener('mouseleave', () => this.onSaveGameElLeave());

    this.gamePlay.loadGameEl.addEventListener('click', () => this.onloadGameElClick()); // Вызов реакции на нажатие кнопки Load Game
    this.gamePlay.loadGameEl.addEventListener('mouseenter', () => this.onloadGameElEnter());
    this.gamePlay.loadGameEl.addEventListener('mouseleave', () => this.onloadGameElLeave());
  }

  onSaveGameElClick() {
    const status = {
      gamerPositions: this.gamerPositions,
      pcPositions: this.pcPositions,
      gamPos: this.gamPos,
      pcPos: this.pcPos,
      allPositions: this.allPositions,
      selected: this.selected,
      select: this.select,
      selectPers: this.selectPers,
      actCounter: this.actCounter,
      level: this.level,
      lock: this.lock,
    };

    this.stateService.save(GameState.from(status));
  }

  onSaveGameElEnter() {
    this.gamePlay.saveGameEl.style.cursor = 'pointer';
  }

  onSaveGameElLeave() {
    this.gamePlay.saveGameEl.style.cursor = 'auto';
  }

  onloadGameElClick() {
    const load = this.stateService.load();
    this.gamerPositions = load.gamerPositions;
    this.pcPositions = load.pcPositions;
    this.gamPos = load.gamPos;
    this.pcPos = load.pcPos;
    this.allPositions = load.allPositions;
    this.selected = load.selected;
    this.select = load.select;
    this.selectPers = load.selectPers;
    this.actCounter = load.actCounter;
    this.level = load.level;
    this.lock = load.lock;
    let theme = themes.prairie;
    if (this.level === 2) { theme = themes.desert; }
    if (this.level === 3) { theme = themes.arctic; }
    if (this.level === 4) { theme = themes.mountain; }
    this.gamePlay.drawUi(theme); // Отрисовка поля
    this.eventList();
    this.gamePlay.redrawPositions(this.allPositions);
  }

  onloadGameElEnter() {
    this.gamePlay.loadGameEl.style.cursor = 'pointer';
  }

  onloadGameElLeave() {
    this.gamePlay.loadGameEl.style.cursor = 'auto';
  }

  onNewGameClick() {
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
    this.level = 1;
    this.lock = true;
    this.init();
  }

  onNewGameEnter() {
    this.gamePlay.newGameEl.style.cursor = 'pointer';
  }

  onNewGameLeave() {
    this.gamePlay.newGameEl.style.cursor = 'auto';
  }

  onCellClick(index) {
    if (this.lock) {
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
          this.selected = index;
          this.attack(this.selectPers, pers, index);
          this.actCounter += 1;
          if (((this.level > 1) && (this.actCounter === 1))) {
            this.actCounter += 1 ;
          } else {
            this.pcAction();
          }
        }
      }
    }
  }

  onCellEnter(index) {
    if (this.lock) {
      let positions = false;
      let positionsPC = false;
      let allowedMove = false;
      let allowedAttack = false;
      if (this.gamPos.indexOf(index) >= 0) { positions = true; }
      if (this.pcPos.indexOf(index) >= 0) { positionsPC = true; }
      if (this.selectAllowedMove.indexOf(index) >= 0) { allowedMove = true; }
      if (this.selectAllowedAttack.indexOf(index) >= 0) { allowedAttack = true; }

      if (positions) {        
        for (const position of this.gamerPositions) {
          if (position.position === index) {
            this.gamePlay.showCellTooltip(this.descript(position.character), index); // Вызов описания
          }
        }
      } else if (positionsPC && allowedAttack) {        
        this.gamePlay.selectCell(index, 'red');
        for (const position of this.pcPositions) {
          if (position.position === index) {
            this.gamePlay.showCellTooltip(this.descript(position.character), index); // Вызов описания
          }
        }
      } else if (positionsPC && !allowedAttack) {        
        for (const position of this.pcPositions) {
          if (position.position === index) {
            this.gamePlay.showCellTooltip(this.descript(position.character), index); // Вызов описания
          }
        }
      } else if (!positions && !positionsPC && allowedMove) {        
        this.gamePlay.selectCell(index, 'green');
      } 
    }
  }

  onCellEnterCursor(index) {
    if (this.lock) {
      let positions = false;
      let positionsPC = false;
      let allowedMove = false;
      let allowedAttack = false;
      if (this.gamPos.indexOf(index) >= 0) { positions = true; }
      if (this.pcPos.indexOf(index) >= 0) { positionsPC = true; }
      if (this.selectAllowedMove.indexOf(index) >= 0) { allowedMove = true; }
      if (this.selectAllowedAttack.indexOf(index) >= 0) { allowedAttack = true; }

      if (positions) {
       return 'pointer';        
      } else if (positionsPC && allowedAttack) { 
        return 'crosshair';
        } else if (positionsPC && !allowedAttack) {
        return 'not-allowed';        
      } else if (!positions && !positionsPC && allowedMove) {
        return 'pointer';        
      } else { return 'not-allowed' }
    }
  }

  onCellLeave(index) {
    if(this.selected != index){this.gamePlay.deselectCell(index)}
    this.gamePlay.setCursor('auto');
  }
}
