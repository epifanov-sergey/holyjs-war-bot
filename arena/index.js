const getNearestEnemy = require('./src/getNearestEnemy');
const getNextCoordinates = require('./src/getNextCoordinates');
const maxActionPoints = 3;


function getSafeZones(dangerZones) {
  let safeZone = [];
  for (let i = 0; i < API.getArenaSize(); i++) {
    for (let j = 0; j < API.getArenaSize(); j++) {
      const pointExists = dangerZones.filter(({ x, y }) => x === i && y === j);
      if (!pointExists.length) {
        safeZone.push({ x: i, y: j });
      }
    }
  }
  return safeZone;
}

function getPossiblyEnemyRoutes(enemyPosition) {
  const xArr = [];
  const yArr = [];
  let currentX = enemyPosition.x - maxActionPoints;
  let endX = enemyPosition.x + maxActionPoints;
  let currentY = enemyPosition.y - maxActionPoints;
  let endY = enemyPosition.y + maxActionPoints;
  while (currentX < endX) {
    if (checkBoundaries(currentX)) {
      xArr.push(currentX);
    }
    currentX++;
  }
  while (currentY < endY) {
    if (checkBoundaries(currentY)) {
      yArr.push(currentY);
    }
    currentY++;
  }
  const possiblyDangerZone = [];
  for (let i = 0; i < xArr.length; i++) {
    for (let j = 0; j < yArr.length; j++) {
      const currentPoint = { x: xArr[i], y: yArr[j] };
      if (getDistance(enemyPosition, currentPoint) <= maxActionPoints) {
        possiblyDangerZone.push(currentPoint);
      }
    }
  }
  return possiblyDangerZone;
}

function checkBoundaries(coordinate) {
  return coordinate >= 0 && coordinate < API.getArenaSize();
}

function getRandInBoundary(coordinate, type) {
  if (type === 'increase') {
    if (coordinate + 1 < API.getArenaSize() - 1) {
      return coordinate + 1;
    } else {
      return coordinate - 1;
    }
  } else {
    if (coordinate - 1 > 0) {
      return coordinate - 1;
    } else {
      return coordinate + 1;
    }
  }
}

function getDistance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

console.log('===========================');

let { x, y } = API.getCurrentPosition();
const myPosition = { x, y };
let nextPosition;
const nearestEnemy = getNearestEnemy(myPosition);
if (nearestEnemy) {
  const distanceToEnemy = getDistance(myPosition, nearestEnemy);
  const actionPoints = API.getActionPointsCount();
  if (actionPoints >= distanceToEnemy) {
    const restEnemies = API.getEnemies()
    .filter(({ position }) => position.x !== nearestEnemy.x && position.y !== nearestEnemy.y);
    if (restEnemies.length) {
      const dangerZones = getDangerZones(restEnemies);
      const isDangerPoint = dangerZones.filter(({ x, y }) => {
        return x === nearestEnemy.x && y === nearestEnemy.y;
      }).length;
      if (isDangerPoint) {
        nextPosition = getNextCoordinates(myPosition, nearestEnemy);
        API.move(nextPosition.x, nextPosition.y);
      } else {
        API.move(nearestEnemy.x, nearestEnemy.y);
      }
    } else {
      console.log('arrack one enemy');
      API.move(nearestEnemy.x, nearestEnemy.y);
    }
  } else {
    nextPosition = getNextCoordinates(myPosition, nearestEnemy);
    API.move(nextPosition.x, nextPosition.y);
  }
} else {
  nextPosition = getNextCoordinates(myPosition);
  console.log('next positin if no enemies', nextPosition);
  API.move(nextPosition.x, nextPosition.y);
}
