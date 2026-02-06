const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const startBtn = document.getElementById("start");
const pauseBtn = document.getElementById("pause");
const resetBtn = document.getElementById("reset");

const state = {
  plane: {
    x: 120,
    y: 320,
    width: 52,
    height: 24,
    velocity: 0,
    lift: -6.8,
  },
  gravity: 0.35,
  towers: [],
  gap: 150,
  speed: 2.4,
  frame: 0,
  score: 0,
  best: 0,
  running: false,
  paused: false,
  gameOver: false,
};

const colors = {
  planeBody: "#f97316",
  planeWing: "#fde68a",
  tower: "#94a3b8",
  towerHighlight: "#e2e8f0",
  city: "#0f172a",
};

const skyline = Array.from({ length: 8 }, (_, index) => ({
  x: index * 80,
  width: 60,
  height: 40 + Math.random() * 80,
}));

function resetGame() {
  state.plane.y = 320;
  state.plane.velocity = 0;
  state.towers = [];
  state.frame = 0;
  state.score = 0;
  state.running = false;
  state.paused = false;
  state.gameOver = false;
  scoreEl.textContent = state.score;
}

function spawnTowers() {
  const minHeight = 80;
  const maxHeight = canvas.height - state.gap - minHeight;
  const topHeight = minHeight + Math.random() * (maxHeight - minHeight);
  state.towers.push({
    x: canvas.width + 40,
    topHeight,
    width: 70,
    scored: false,
  });
}

function updatePlane() {
  state.plane.velocity += state.gravity;
  state.plane.y += state.plane.velocity;
}

function updateTowers() {
  state.towers.forEach((tower) => {
    tower.x -= state.speed;
  });
  state.towers = state.towers.filter((tower) => tower.x + tower.width > -40);
}

function checkScore() {
  state.towers.forEach((tower) => {
    if (!tower.scored && tower.x + tower.width < state.plane.x) {
      tower.scored = true;
      state.score += 1;
      state.speed = 2.4 + Math.min(state.score * 0.05, 2);
      scoreEl.textContent = state.score;
      if (state.score > state.best) {
        state.best = state.score;
        bestEl.textContent = state.best;
      }
    }
  });
}

function isCollision() {
  if (state.plane.y < 20 || state.plane.y + state.plane.height > canvas.height - 20) {
    return true;
  }
  return state.towers.some((tower) => {
    const planeRight = state.plane.x + state.plane.width;
    const planeBottom = state.plane.y + state.plane.height;
    const topCollision = planeRight > tower.x &&
      state.plane.x < tower.x + tower.width &&
      state.plane.y < tower.topHeight;
    const bottomCollision = planeRight > tower.x &&
      state.plane.x < tower.x + tower.width &&
      planeBottom > tower.topHeight + state.gap;
    return topCollision || bottomCollision;
  });
}

function drawBackground() {
  ctx.fillStyle = "rgba(15, 23, 42, 0.8)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = colors.city;
  skyline.forEach((building) => {
    ctx.fillRect(building.x, canvas.height - building.height, building.width, building.height);
    building.x -= 0.3;
    if (building.x + building.width < 0) {
      building.x = canvas.width + 40;
      building.height = 40 + Math.random() * 80;
    }
  });
}

function drawPlane() {
  const { x, y, width, height } = state.plane;
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(state.plane.velocity * 0.04);
  ctx.translate(-width / 2, -height / 2);

  ctx.fillStyle = colors.planeBody;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = colors.planeWing;
  ctx.beginPath();
  ctx.moveTo(width * 0.35, height * 0.2);
  ctx.lineTo(width * 0.9, height * 0.5);
  ctx.lineTo(width * 0.35, height * 0.8);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.fillRect(width * 0.1, height * 0.15, width * 0.2, height * 0.7);

  ctx.restore();
}

function drawTowers() {
  state.towers.forEach((tower) => {
    ctx.fillStyle = colors.tower;
    ctx.fillRect(tower.x, 0, tower.width, tower.topHeight);
    ctx.fillRect(
      tower.x,
      tower.topHeight + state.gap,
      tower.width,
      canvas.height - tower.topHeight - state.gap
    );

    ctx.fillStyle = colors.towerHighlight;
    ctx.fillRect(tower.x + 8, tower.topHeight - 20, tower.width - 16, 12);
    ctx.fillRect(tower.x + 8, tower.topHeight + state.gap + 8, tower.width - 16, 12);
  });
}

function drawMessage() {
  if (state.running) {
    return;
  }
  ctx.fillStyle = "rgba(15, 23, 42, 0.7)";
  ctx.fillRect(40, 220, canvas.width - 80, 140);
  ctx.fillStyle = "#f8fafc";
  ctx.font = "bold 20px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText("Нажми Старт или пробел", canvas.width / 2, 270);
  ctx.font = "16px Segoe UI";
  ctx.fillText("Пролети между башнями!", canvas.width / 2, 305);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawTowers();
  drawPlane();
  drawMessage();
}

function tick() {
  if (!state.running || state.paused) {
    render();
    requestAnimationFrame(tick);
    return;
  }

  state.frame += 1;
  if (state.frame % 90 === 0) {
    spawnTowers();
  }

  updatePlane();
  updateTowers();
  checkScore();

  if (isCollision()) {
    state.running = false;
    state.gameOver = true;
    state.plane.velocity = 0;
  }

  render();
  requestAnimationFrame(tick);
}

function flap() {
  if (state.gameOver) {
    return;
  }
  if (!state.running) {
    state.running = true;
  }
  state.plane.velocity = state.plane.lift;
}

startBtn.addEventListener("click", () => {
  if (state.gameOver) {
    resetGame();
  }
  state.running = true;
  state.paused = false;
});

pauseBtn.addEventListener("click", () => {
  state.paused = !state.paused;
});

resetBtn.addEventListener("click", () => {
  resetGame();
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    flap();
  }
});

canvas.addEventListener("click", () => flap());

resetGame();
requestAnimationFrame(tick);
