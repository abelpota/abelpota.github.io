// Game configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const difficultySelect = document.getElementById('difficulty');
const wallModeCheckbox = document.getElementById('wallMode');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const resumeBtn = document.getElementById('resumeBtn');
const overlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');

// Game constants
const GRID_SIZE = 20;
const TILE_COUNT = canvas.width / GRID_SIZE;

// Difficulty settings (speed in ms)
const DIFFICULTY_SPEEDS = {
    easy: 150,
    medium: 100,
    hard: 60
};

// Game state
let snake = [];
let food = {};
let dx = 0;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let gameLoop = null;
let isPaused = false;
let isGameOver = false;
let currentSpeed = DIFFICULTY_SPEEDS.medium;
let moveQueue = []; // Queue for storing next move

// Initialize game
function initGame() {
    // Reset snake to center
    snake = [
        { x: Math.floor(TILE_COUNT / 2), y: Math.floor(TILE_COUNT / 2) },
        { x: Math.floor(TILE_COUNT / 2) - 1, y: Math.floor(TILE_COUNT / 2) },
        { x: Math.floor(TILE_COUNT / 2) - 2, y: Math.floor(TILE_COUNT / 2) }
    ];

    // Start moving right
    dx = 1;
    dy = 0;

    // Clear move queue
    moveQueue = [];

    // Reset score
    score = 0;
    updateScore();

    // Generate first food
    generateFood();

    // Reset game state
    isPaused = false;
    isGameOver = false;
    hideOverlay();

    // Start game loop
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, currentSpeed);
}

// Generate food at random position
function generateFood() {
    let validPosition = false;

    while (!validPosition) {
        food = {
            x: Math.floor(Math.random() * TILE_COUNT),
            y: Math.floor(Math.random() * TILE_COUNT)
        };

        // Check if food is not on snake
        validPosition = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

// Update game state
function update() {
    if (isPaused || isGameOver) return;

    // Process queued move if available
    if (moveQueue.length > 0) {
        const nextMove = moveQueue.shift();
        dx = nextMove.dx;
        dy = nextMove.dy;
    }

    // Calculate new head position
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Check wall collision
    if (wallModeCheckbox.checked) {
        // Game over on wall collision
        if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) {
            gameOver();
            return;
        }
    } else {
        // Wrap around
        if (head.x < 0) head.x = TILE_COUNT - 1;
        if (head.x >= TILE_COUNT) head.x = 0;
        if (head.y < 0) head.y = TILE_COUNT - 1;
        if (head.y >= TILE_COUNT) head.y = 0;
    }

    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver();
        return;
    }

    // Add new head
    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        updateScore();
        generateFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }

    // Draw game
    draw();
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid (subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= TILE_COUNT; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(canvas.width, i * GRID_SIZE);
        ctx.stroke();
    }

    // Draw snake with gradient
    snake.forEach((segment, index) => {
        const gradient = ctx.createLinearGradient(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            segment.x * GRID_SIZE + GRID_SIZE,
            segment.y * GRID_SIZE + GRID_SIZE
        );

        if (index === 0) {
            // Head - brighter
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
        } else {
            // Body - gradient fade
            const opacity = 1 - (index / snake.length) * 0.3;
            gradient.addColorStop(0, `rgba(102, 126, 234, ${opacity})`);
            gradient.addColorStop(1, `rgba(118, 75, 162, ${opacity})`);
        }

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#667eea';

        // Rounded rectangle
        const x = segment.x * GRID_SIZE + 2;
        const y = segment.y * GRID_SIZE + 2;
        const width = GRID_SIZE - 4;
        const height = GRID_SIZE - 4;
        const radius = 5;

        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        ctx.fill();
    });

    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw food with pulsing effect
    const time = Date.now() / 200;
    const pulse = Math.sin(time) * 0.2 + 1;

    const foodGradient = ctx.createRadialGradient(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        0,
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2
    );
    foodGradient.addColorStop(0, '#ff6b6b');
    foodGradient.addColorStop(1, '#ee5a6f');

    ctx.fillStyle = foodGradient;
    ctx.shadowBlur = 20 * pulse;
    ctx.shadowColor = '#ff6b6b';

    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        (GRID_SIZE / 2 - 3) * pulse,
        0,
        Math.PI * 2
    );
    ctx.fill();

    ctx.shadowBlur = 0;
}

// Update score display
function updateScore() {
    scoreElement.textContent = score;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
    }

    highScoreElement.textContent = highScore;
}

// Game over
function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);

    overlayTitle.textContent = 'Game Over!';
    overlayMessage.textContent = `Your score: ${score}`;
    resumeBtn.textContent = 'Play Again';
    showOverlay();
}

// Pause game
function togglePause() {
    if (isGameOver) return;

    isPaused = !isPaused;

    if (isPaused) {
        pauseBtn.textContent = 'Resume';
        overlayTitle.textContent = 'Game Paused';
        overlayMessage.textContent = 'Press Space or click Resume to continue';
        resumeBtn.textContent = 'Resume';
        showOverlay();
    } else {
        pauseBtn.textContent = 'Pause';
        hideOverlay();
    }
}

// Show overlay
function showOverlay() {
    overlay.classList.remove('hidden');
}

// Hide overlay
function hideOverlay() {
    overlay.classList.add('hidden');
}

// Restart game
function restartGame() {
    if (gameLoop) clearInterval(gameLoop);
    initGame();
}

// Change difficulty
function changeDifficulty() {
    const difficulty = difficultySelect.value;
    currentSpeed = DIFFICULTY_SPEEDS[difficulty];

    if (!isPaused && !isGameOver) {
        clearInterval(gameLoop);
        gameLoop = setInterval(update, currentSpeed);
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    // Prevent default for game keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' ', 'r'].includes(e.key.toLowerCase())) {
        e.preventDefault();
    }

    // Pause/Resume
    if (e.key === ' ') {
        if (isGameOver) {
            restartGame();
        } else {
            togglePause();
        }
        return;
    }

    // Restart
    if (e.key.toLowerCase() === 'r') {
        restartGame();
        return;
    }

    // Prevent input during pause or game over
    if (isPaused || isGameOver) return;

    // IMPORTANT: Always validate against the CURRENT direction (dx, dy)
    // NOT against what's in the queue, to prevent 180° turns
    const currentDx = dx;
    const currentDy = dy;

    // Arrow keys and WASD - validate against CURRENT direction only
    let newDx = null;
    let newDy = null;

    if ((e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') && currentDy === 0) {
        newDx = 0;
        newDy = -1;
    } else if ((e.key === 'ArrowDown' || e.key.toLowerCase() === 's') && currentDy === 0) {
        newDx = 0;
        newDy = 1;
    } else if ((e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') && currentDx === 0) {
        newDx = -1;
        newDy = 0;
    } else if ((e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') && currentDx === 0) {
        newDx = 1;
        newDy = 0;
    }

    // Only queue the move if it's valid from the CURRENT direction
    if (newDx !== null && newDy !== null) {
        // Only allow one move in the queue
        // If queue is empty, add the move
        // If queue already has a move, only replace if new move is still valid from current direction
        if (moveQueue.length === 0) {
            moveQueue.push({ dx: newDx, dy: newDy });
        }
        // If there's already a queued move, ignore subsequent inputs
        // This prevents chaining invalid turns
    }
});

// Button event listeners
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', restartGame);
resumeBtn.addEventListener('click', () => {
    if (isGameOver) {
        restartGame();
    } else {
        togglePause();
    }
});

difficultySelect.addEventListener('change', changeDifficulty);

// Initialize high score display
highScoreElement.textContent = highScore;

// Start game
initGame();
