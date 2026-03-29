import {
  GRID_SIZE,
  TICK_MS,
  advanceState,
  createInitialState,
  positionsEqual,
  setDirection,
  togglePause,
} from "./snake-logic.js";

const board = document.querySelector("#board");
const scoreElement = document.querySelector("#score");
const bestScoreElement = document.querySelector("#best-score");
const gameStateElement = document.querySelector("#game-state");
const overlay = document.querySelector("#overlay");
const overlayTitle = document.querySelector("#overlay-title");
const overlayCopy = document.querySelector("#overlay-copy");
const pauseButton = document.querySelector("#pause-button");
const restartButton = document.querySelector("#restart-button");
const controlButtons = [...document.querySelectorAll("[data-direction]")];
const HIGH_SCORE_KEY = "snake-best-score";

let state = createInitialState();
let bestScore = loadBestScore();
let timerId = null;

createBoard();
render();
startLoop();

function createBoard() {
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < GRID_SIZE * GRID_SIZE; index += 1) {
    const cell = document.createElement("div");
    cell.className = "cell";
    fragment.appendChild(cell);
  }
  board.appendChild(fragment);
}

function startLoop() {
  stopLoop();
  timerId = window.setInterval(() => {
    const nextState = advanceState(state);
    if (nextState !== state) {
      state = nextState;
      persistBestScore();
      render();
    }
  }, TICK_MS);
}

function stopLoop() {
  if (timerId !== null) {
    window.clearInterval(timerId);
  }
}

function render() {
  const cells = board.children;

  for (let y = 0; y < state.size; y += 1) {
    for (let x = 0; x < state.size; x += 1) {
      const cell = cells[y * state.size + x];
      cell.className = "cell";

      if (positionsEqual(state.food, { x, y })) {
        cell.classList.add("food");
      }

      const snakeIndex = state.snake.findIndex((segment) => segment.x === x && segment.y === y);
      if (snakeIndex >= 0) {
        cell.classList.add("snake");
        if (snakeIndex === 0) {
          cell.classList.add("head");
        }
      }
    }
  }

  scoreElement.textContent = String(state.score);
  bestScoreElement.textContent = String(bestScore);
  gameStateElement.textContent = getGameStateLabel();
  pauseButton.textContent = state.isPaused ? "Resume" : "Pause";

  if (state.isGameOver) {
    overlay.classList.remove("hidden");
    overlayTitle.textContent = "Game Over";
    overlayCopy.textContent = "Press Restart to play again.";
  } else if (!state.hasStarted) {
    overlay.classList.remove("hidden");
    overlayTitle.textContent = "Classic Snake";
    overlayCopy.textContent = "Press an arrow key or WASD to begin.";
  } else if (state.isPaused) {
    overlay.classList.remove("hidden");
    overlayTitle.textContent = "Paused";
    overlayCopy.textContent = "Press Space or Resume to continue.";
  } else {
    overlay.classList.add("hidden");
  }
}

function getGameStateLabel() {
  if (state.isGameOver) {
    return "Over";
  }
  if (state.isPaused) {
    return "Paused";
  }
  if (!state.hasStarted) {
    return "Ready";
  }
  return "Running";
}

function persistBestScore() {
  if (state.score > bestScore) {
    bestScore = state.score;
    saveBestScore(bestScore);
  }
}

function loadBestScore() {
  try {
    const rawValue = window.localStorage.getItem(HIGH_SCORE_KEY);
    const parsedValue = Number(rawValue);
    return Number.isFinite(parsedValue) && parsedValue >= 0 ? parsedValue : 0;
  } catch {
    return 0;
  }
}

function saveBestScore(score) {
  try {
    window.localStorage.setItem(HIGH_SCORE_KEY, String(score));
  } catch {
    return;
  }
}

function updateDirection(direction) {
  const nextState = setDirection(state, direction);
  if (nextState !== state) {
    state = nextState;
    render();
  }
}

function restartGame() {
  state = createInitialState();
  render();
  board.focus();
}

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const directionMap = {
    arrowup: "up",
    w: "up",
    arrowdown: "down",
    s: "down",
    arrowleft: "left",
    a: "left",
    arrowright: "right",
    d: "right",
  };

  if (key === " ") {
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  const direction = directionMap[key];
  if (!direction) {
    return;
  }

  event.preventDefault();
  updateDirection(direction);
});

pauseButton.addEventListener("click", () => {
  state = togglePause(state);
  render();
});

restartButton.addEventListener("click", restartGame);

controlButtons.forEach((button) => {
  button.addEventListener("click", () => {
    updateDirection(button.dataset.direction);
    board.focus();
  });
});

board.addEventListener("click", () => {
  board.focus();
});
