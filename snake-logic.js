export const GRID_SIZE = 16;
export const INITIAL_DIRECTION = "right";
export const TICK_MS = 140;

const DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITES = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function createInitialState(size = GRID_SIZE, rng = Math.random) {
  const center = Math.floor(size / 2);
  const snake = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];

  return {
    size,
    snake,
    direction: INITIAL_DIRECTION,
    pendingDirection: INITIAL_DIRECTION,
    food: createFoodPosition(size, snake, rng),
    score: 0,
    isGameOver: false,
    isPaused: false,
    hasStarted: false,
    rng,
  };
}

export function setDirection(state, nextDirection) {
  if (!DIRECTION_VECTORS[nextDirection]) {
    return state;
  }

  if (state.pendingDirection !== state.direction) {
    return state;
  }

  if (state.snake.length > 1 && OPPOSITES[state.direction] === nextDirection) {
    return state;
  }

  return {
    ...state,
    pendingDirection: nextDirection,
    hasStarted: true,
  };
}

export function togglePause(state) {
  if (state.isGameOver || !state.hasStarted) {
    return state;
  }

  return {
    ...state,
    isPaused: !state.isPaused,
  };
}

export function advanceState(state) {
  if (state.isGameOver || state.isPaused || !state.hasStarted) {
    return state;
  }

  const direction = state.pendingDirection ?? state.direction;
  const vector = DIRECTION_VECTORS[direction];
  const head = state.snake[0];
  const nextHead = {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };

  if (isWallCollision(nextHead, state.size)) {
    return {
      ...state,
      direction,
      pendingDirection: direction,
      isGameOver: true,
    };
  }

  const eatsFood = positionsEqual(nextHead, state.food);
  const bodyToCheck = eatsFood ? state.snake : state.snake.slice(0, -1);

  if (bodyToCheck.some((segment) => positionsEqual(segment, nextHead))) {
    return {
      ...state,
      direction,
      pendingDirection: direction,
      isGameOver: true,
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!eatsFood) {
    nextSnake.pop();
  }

  return {
    ...state,
    snake: nextSnake,
    direction,
    pendingDirection: direction,
    food: eatsFood ? createFoodPosition(state.size, nextSnake, state.rng) : state.food,
    score: eatsFood ? state.score + 1 : state.score,
  };
}

export function createFoodPosition(size, snake, rng = Math.random) {
  const occupied = new Set(snake.map((segment) => toKey(segment)));
  const openCells = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const key = toKey({ x, y });
      if (!occupied.has(key)) {
        openCells.push({ x, y });
      }
    }
  }

  if (openCells.length === 0) {
    return snake[0];
  }

  return openCells[Math.floor(rng() * openCells.length)];
}

export function positionsEqual(a, b) {
  return a.x === b.x && a.y === b.y;
}

function isWallCollision(position, size) {
  return position.x < 0 || position.y < 0 || position.x >= size || position.y >= size;
}

function toKey(position) {
  return `${position.x},${position.y}`;
}
