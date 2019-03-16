/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */

// import { classes } from './Character';

export function* characterGenerator(allowedTypes, maxLevel) {
  const compareRandom = (A, B) => Math.random() - 0.5;
  const arr = [];
  for (const elem of allowedTypes) {
    arr.push(elem);
  }
  const hero = arr.sort(compareRandom);
  for (let i = 0; i < allowedTypes.length; i += 1) {
    const level = Math.ceil(Math.random() * (maxLevel - 1));
    const pers = new hero[i](level);
    maxLevel += 1;
    yield pers;
  }
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const compareRandom = (A, B) => Math.random() - 0.5;
  const arr = [];
  for (const elem of allowedTypes) {
    arr.push(elem);
  }

  const hero = arr.sort(compareRandom);
  const charact = [];
  for (let i = 0; i < characterCount; i += 1) {
    const level = Math.ceil(Math.random() * (maxLevel));
    const pers = new hero[i](level);
    charact.push(pers);
  }
  return charact;
  // TODO: write logic here
}
