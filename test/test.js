import Character, { classes } from '../src/js/Character.js';

test('Создание Bowman', () => {
  const expected = {
    level: 1,    
    health: 50,
    type: 'bowman',
    attack: 25,
    defence: 25,
    distance: 4,
    distanceAttack: 1,     
 }
  const received = new classes[0](1);
  expect(received).toEqual(expected);
});

test('Создание Character', () => {
  expect(() => {
	new Character;
  }).toThrow();
});


import GamePlay from '../src/js/GamePlay.js';
import GameController from '../src/js/GameController.js';
import GameStateService from '../src/js/GameStateService.js';


const gamePlay = new GamePlay();
const stateService = new GameStateService(localStorage);
const gameCtrl = new GameController(gamePlay, stateService);


test('Вывод информации о персонаже', () => {
    
    const bowman = {
        level: 1,    
        health: 50,
        type: 'bowman',
        attack: 25,
        defence: 25,
        distance: 4,
        distanceAttack: 1,     
     }
    
    const expected = '🎖1 ⚔ 25 🛡 25 ❤ 50'
    const received = gameCtrl.descript(bowman);
    expect(received).toEqual(expected);
  });
  
  test('Наведение мыши на игрока', () => {    
    gameCtrl.gamPos = [8, 56];
    gameCtrl.pcPos = [23, 15];       
    const expected = 'pointer';
    const received = gameCtrl.onCellEnterCursor(8);
    expect(received).toEqual(expected);
  });

  test('Наведение мыши на чужого игрока для атаки', () => {    
    gameCtrl.gamPos = [8, 56];
    gameCtrl.pcPos = [9, 15];  
    gameCtrl.selectAllowedAttack  = [1, 2, 9, 16, 17];  
    const expected = 'crosshair';
    const received = gameCtrl.onCellEnterCursor(9);
    expect(received).toEqual(expected);
  });

  test('Наведение мыши на клетку для перехода', () => {    
    gameCtrl.gamPos = [8, 56];
    gameCtrl.pcPos = [9, 15];  
    gameCtrl.selectAllowedMove  = [0, 1];  
    const expected = 'pointer';
    const received = gameCtrl.onCellEnterCursor(1);
    expect(received).toEqual(expected);
  });

  test('Недопустимое действие', () => {    
    gameCtrl.gamPos = [8, 56];
    gameCtrl.pcPos = [9, 15];        
    const expected = 'not-allowed';
    const received = gameCtrl.onCellEnterCursor(45);
    expect(received).toEqual(expected);
  });
