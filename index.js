const maxActionPoints = 3;

function rand() {
  return Math.round(Math.random());
}

function getNextCoordinate(pos, enemy) {
  let newX = pos.x, newY = pos.y;
  if (!enemy) {
    if (rand()) {
      newX = rand() ? getRandInBoundary(pos.x, 'increase') : getRandInBoundary(pos.x);
    } else {
      newY = rand() ? getRandInBoundary(pos.y, 'increase') : getRandInBoundary(pos.y);
    }
  } else {
    const enemies = API.getEnemies();
    const dangerZones = getDangerZones(enemies);
    const safeZones = getSafeZones(dangerZones);
    const safeZonesWithDistance = safeZones.map((point, key) => ({
      key,
      distance: getDistance(point, pos),
    }));
    const res = safeZonesWithDistance.reduce((acc, currentValue) => {
      if (currentValue.distance < acc.distance && currentValue.distance > 0) {
        return {
          x: safeZones[currentValue.key].x,
          y: safeZones[currentValue.key].y,
          distance: currentValue.distance,
        };
      } else {
        return acc;
      }
    }, { distance: API.getArenaSize(), x: pos.x, y: pos.y });
    newX = res.x;
    newY = res.y;
  }
  return { x: newX, y: newY };
}

function getDangerZones(enemies) {
  const dangerZone = [];
  for (let key in enemies) {
    const { position } = enemies[key];
    const dangerZoneForEnemy = getPossiblyEnemyRoutes(position);
    for (let zone in dangerZoneForEnemy) {
      const zoneExists = dangerZone.filter(({ x, y }) =>
        x === dangerZoneForEnemy[zone].x && dangerZoneForEnemy[zone].y === zone.y,
      );
      if (!zoneExists.length) {
        dangerZone.push(dangerZoneForEnemy[zone]);
      }
    }
  }
  return dangerZone;
}

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

function getNearestEnemy(position) {
  let nearestEnemy;
  const enemies = API.getEnemies();
  let nearestDistance = API.getArenaSize();
  enemies.forEach(enemy => {
    const distance = getDistance(
      { x: position.x, y: position.y },
      { x: enemy.position.x, y: enemy.position.y },
    );
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestEnemy = { x: enemy.position.x, y: enemy.position.y };
    }
  });
  return nearestEnemy;
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
      const isDangerPoint = dangerZones.filter(({ x, y }) => x === nearestEnemy.x && y === nearestEnemy.y).length;
      if (isDangerPoint) {
        nextPosition = getNextCoordinate(myPosition, nearestEnemy);
        API.move(nextPosition.x, nextPosition.y);
      } else {
        API.move(nearestEnemy.x, nearestEnemy.y);
      }
    } else {
      API.move(nearestEnemy.x, nearestEnemy.y);
    }
  } else {
    nextPosition = getNextCoordinate(myPosition, nearestEnemy);
    API.move(nextPosition.x, nextPosition.y);
  }
} else {
  nextPosition = getNextCoordinate(myPosition);
  API.move(nextPosition.x, nextPosition.y);
}
