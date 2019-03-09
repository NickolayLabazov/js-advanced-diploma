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
  }
  
  allowedMove() {
    const boardArray = [];
    let arrayString = [];
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) {
      arrayString.push(i);
      if (arrayString.length === this.gamePlay.boardSize) {
        boardArray.push(arrayString);
        arrayString = [];
      }
    }
  
    const indexStr = Math.ceil(((this.selected - this.selected % this.gamePlay.boardSize) / this.gamePlay.boardSize));
    const indexColumn = this.selected % this.gamePlay.boardSize;
      const allowedCell = [];
    for (let i = 1; i <= this.selectPers.distance; i += 1) {
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
  
  allowedAttack() {
    const boardArray = [];
    let arrayString = [];
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i += 1) {
      arrayString.push(i);
      if (arrayString.length === this.gamePlay.boardSize) {
        boardArray.push(arrayString);
        arrayString = [];
      }
    }
  
    const indexStr = Math.ceil(((this.selected - this.selected % this.gamePlay.boardSize) / this.gamePlay.boardSize));
    const indexColumn = this.selected % this.gamePlay.boardSize;
  
  let indexStrMin = indexStr - this.selectPers.distanceAttack;
  if(indexStrMin < 0){indexStrMin = 0}
  let indexStrMax = indexStr + this.selectPers.distanceAttack;
  if(indexStrMax > this.gamePlay.boardSize-1){indexStrMax = this.gamePlay.boardSize-1}
    
  let indexColumnMin = indexColumn - this.selectPers.distanceAttack;
  if(indexColumnMin < 0){indexColumnMin = 0}
  let indexColumnMax = indexColumn + this.selectPers.distanceAttack;
  if(indexColumnMax > this.gamePlay.boardSize-1){indexColumnMax = this.gamePlay.boardSize-1}
  
    const allowedCell = [];
for (let i = indexStrMin; i <=indexStrMax; i+=1){
  for (let j = indexColumnMin; j <=indexColumnMax; j+=1){    
    allowedCell.push(boardArray[i][j]);
  }
}
    return allowedCell;
  }

  attack(att, def){
    console.log(att.attack);
    console.log(def.defence);
    def.health = def.health - (att.attack - def.defence);
    if(def.health<=0){
      console.log(this.pcPositions);
      this.pcPositions = this.pcPositions.filter(elem => elem.character.health>0);
      console.log(this.pcPositions);
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

for(let elem of this.gamerPositions){
  this.gamPos.push(elem.position);
}

for(let elem of this.pcPositions){  
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
    for (const position of this.gamerPositions) {
      if (position.position === index) { // Проверка, есть ли в клетке персонаж игрока
        if (!((position.character.type === 'bowman') || (position.character.type === 'swordsman') || (position.character.type === 'magician') || (position.character.type === 'undead') || (position.character.type === 'vampire') || (position.character.type === 'daemon'))) {
          GamePlay.showError('Некорректный тип');
        } else {
          this.gamePlay.deselectCell(this.selected);// Снятие выделения
          this.gamePlay.selectCell(index); // Выделение позиции с игроком
          this.selected = index;
          this.select = true;
          this.selectPers = position.character;
        }
      }
    }

    this.selectAllowedMove = this.allowedMove(); // Создание массива клеток, разрешенных для перехода
    this.selectAllowedAttack = this.allowedAttack(); // Создание массива клеток, разрешенных для атаки

    let cellOpen = true;
    if (this.select) { // Проверка наличия игрока выбранной клетке в случае наличия выбранного игрока
      for (const elem of this.allPositions) {
        if (elem.position === index) {
          cellOpen = false;
        }
      }

      if ((cellOpen) && (this.selectAllowedMove.indexOf(index) >= 0)) {
        for (const elem of this.allPositions) { // Если выбранная клетка свободна, выбранному игроку присваивается новая позиция
          if (elem.character === this.selectPers) {
            cellOpen = false;
            elem.position = index;
          }
        }
        this.gamePlay.deselectCell(this.selected);// Снятие выделения
        this.gamePlay.redrawPositions(this.allPositions); // Отрисовка персонажей с новой позицией
        this.selected = 1;
        this.select = false;
        this.selectPers = 0;
        this.selectAllowedMove = [];
        this.gamPos = [];
        this.pcPos = [];
        for(let elem of this.gamerPositions){
          this.gamPos.push(elem.position);
        }
        
        for(let elem of this.pcPositions){  
          this.pcPos.push(elem.position);  
        }
      }

      if (this.selectAllowedAttack.indexOf(index) >= 0) {
        for (const elem of this.pcPositions) { // Если выбранная клетка свободна, выбранному игроку присваивается новая позиция
          if (elem.position === index) {
            this.gamePlay.setCursor('crosshair');
            console.log('Атака');
            let pc = 0;
            for (const position of this.pcPositions) {
              if (position.position === index) {      
                pc = position.character;
              }
            }
            this.attack(this.selectPers, pc);
          }
        }
        
      }
    }    
// TODO: react to click
  }
  
  

  onCellEnter(index) {
           
    let positions = false;
    let positionsPC = false;
    let allowedMove = false;
    let allowedAttack = false


    if(this.gamPos.indexOf(index) >= 0){positions = true};
    if(this.pcPos.indexOf(index) >= 0){positionsPC = true};    
    if(this.selectAllowedMove.indexOf(index) >= 0){allowedMove = true};
    if(this.selectAllowedAttack.indexOf(index) >= 0){allowedAttack = true};

if(positions){
  this.gamePlay.setCursor('pointer');
  for (const position of this.gamerPositions) {
    if (position.position === index) {      
      this.gamePlay.showCellTooltip(this.descript(position.character), index); // Вызов описания      
    }
  }
}else if(positionsPC && allowedAttack){ //Поправить !
  this.gamePlay.setCursor('crosshair');
  for (const position of this.pcPositions) {
    if (position.position === index) {      
      this.gamePlay.showCellTooltip(this.descript(position.character), index); // Вызов описания      
    }
  }
}else if(positionsPC && !allowedAttack){
  this.gamePlay.setCursor('not-allowed');
  for (const position of this.pcPositions) {
    if (position.position === index) {      
      this.gamePlay.showCellTooltip(this.descript(position.character), index); // Вызов описания      
    }
  }
}else if(!positions && !positionsPC && allowedMove){
  this.gamePlay.setCursor('pointer');
}
else{this.gamePlay.setCursor('not-allowed')}  


    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    this.gamePlay.setCursor('auto');
    // TODO: react to mouse leave
  }
}
