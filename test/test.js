import Character, { classes } from '../src/js/Character.js';
/*
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
*/

import GameController from '../src/js/GameController.js';

let gamectrl = new GameController;

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
    const received = gamectrl.descript(bowman);
    expect(received).toEqual(expected);
  });
