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
    if (rand()) {
      newX = getRandInBoundary(pos.x, pos.x < enemy.x ? 'increase' : '');
    } else {
      newY = getRandInBoundary(pos.y, pos.y < enemy.y ? 'increase' : '');
    }
  }
  return { x: newX, y: newY };
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

let { x, y } = API.getCurrentPosition();
const myPosition = { x, y };
let nextPosition;
const nearestEnemy = getNearestEnemy(myPosition);
if (nearestEnemy) {
  const distanceToEnemy = getDistance(myPosition, nearestEnemy);
  const actionPoints = API.getActionPointsCount();
  if (actionPoints >= distanceToEnemy) {
    API.move(nearestEnemy.x, nearestEnemy.y);
  } else {
    nextPosition = getNextCoordinate(myPosition, nearestEnemy);
    API.move(nextPosition.x, nextPosition.y);
  }
} else {
  nextPosition = getNextCoordinate(myPosition);
  API.move(nextPosition.x, nextPosition.y);
}
