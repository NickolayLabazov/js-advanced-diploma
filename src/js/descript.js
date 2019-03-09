export default function descript(obj) {
  const smileLevel = String.fromCodePoint(0x1F396);
  const smileAtack = String.fromCodePoint(0x2694);
  const smileDefence = String.fromCodePoint(0x1F6E1);
  const smileHealth = String.fromCodePoint(0x2764);
  const result = `${smileLevel}${obj.level} ${smileAtack} ${obj.attack} ${smileDefence} ${obj.defence} ${smileHealth} ${obj.health}`;
  return result;
}
