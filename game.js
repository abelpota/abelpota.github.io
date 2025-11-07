// Game configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const wallModeCheckbox = document.getElementById('wallMode');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const resumeBtn = document.getElementById('resumeBtn');
const homeBtn = document.getElementById('homeBtn');
const overlay = document.getElementById('gameOverlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayMessage = document.getElementById('overlayMessage');

// Screen elements
const startScreen = document.getElementById('startScreen');
const gameHeader = document.querySelector('.game-header');
const controlsPanel = document.querySelector('.controls-panel');
const gameContent = document.querySelector('.game-content');

// Settings elements
const fullscreenBtn = document.getElementById('fullscreenBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const darkModeBtn = document.getElementById('darkModeBtn');
const lightModeBtn = document.getElementById('lightModeBtn');
const pcModeBtn = document.getElementById('pcModeBtn');
const mobileModeBtn = document.getElementById('mobileModeBtn');
const tabletModeBtn = document.getElementById('tabletModeBtn');
const eraseHighscoreBtn = document.getElementById('eraseHighscoreBtn');

// Mobile controls
const mobileControls = document.getElementById('mobileControls');
const dpadButtons = document.querySelectorAll('.dpad-btn');

// Game constants
const GRID_SIZE = 20;

// Difficulty settings (speed in ms and canvas size)
const DIFFICULTY_SETTINGS = {
    easy: { speed: 150, canvasSize: 400 },
    medium: { speed: 100, canvasSize: 500 },
    hard: { speed: 60, canvasSize: 600 }
};

let TILE_COUNT = canvas.width / GRID_SIZE;

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
let currentSpeed = DIFFICULTY_SETTINGS.medium.speed;
let baseSpeed = DIFFICULTY_SETTINGS.medium.speed; // Base speed without multipliers
let moveQueue = []; // Queue for storing next move

// Screen management
function showStartScreen() {
    startScreen.classList.remove('hidden');
    gameHeader.classList.add('hidden');
    controlsPanel.classList.add('hidden');
    gameContent.classList.add('hidden');
    if (gameLoop) clearInterval(gameLoop);
}

function showGameScreen() {
    startScreen.classList.add('hidden');
    gameHeader.classList.remove('hidden');
    controlsPanel.classList.remove('hidden');
    gameContent.classList.remove('hidden');
}

function startGameWithDifficulty(difficulty) {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    baseSpeed = settings.speed;
    currentSpeed = baseSpeed;

    // Apply speed multiplier for mobile/tablet modes (20% slower)
    if (document.body.classList.contains('mobile-mode') ||
        document.body.classList.contains('tablet-mode')) {
        currentSpeed = Math.floor(currentSpeed * 1.2);
    }

    // Update canvas size
    canvas.width = settings.canvasSize;
    canvas.height = settings.canvasSize;
    TILE_COUNT = canvas.width / GRID_SIZE;

    // Show game screen and start game
    showGameScreen();
    initGame();
}

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
        score += 1;
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
            // Head - brighter with yellow accent
            gradient.addColorStop(0, '#ffeb3b');
            gradient.addColorStop(0.5, '#667eea');
            gradient.addColorStop(1, '#764ba2');
        } else {
            // Body - gradient fade
            const opacity = 1 - (index / snake.length) * 0.3;
            gradient.addColorStop(0, `rgba(102, 126, 234, ${opacity})`);
            gradient.addColorStop(1, `rgba(118, 75, 162, ${opacity})`);
        }

        ctx.fillStyle = gradient;

        if (index === 0) {
            // Head - stronger glow
            ctx.shadowBlur = 25;
            ctx.shadowColor = '#ffeb3b';
        } else {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#667eea';
        }

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

        // Add eyes to the head
        if (index === 0) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#1a1a2e';

            // Determine eye positions based on direction
            const centerX = segment.x * GRID_SIZE + GRID_SIZE / 2;
            const centerY = segment.y * GRID_SIZE + GRID_SIZE / 2;
            const eyeSize = 3;
            const eyeOffset = 4;

            let eye1X, eye1Y, eye2X, eye2Y;

            if (dx === 1) { // Moving right
                eye1X = centerX + eyeOffset;
                eye1Y = centerY - eyeOffset;
                eye2X = centerX + eyeOffset;
                eye2Y = centerY + eyeOffset;
            } else if (dx === -1) { // Moving left
                eye1X = centerX - eyeOffset;
                eye1Y = centerY - eyeOffset;
                eye2X = centerX - eyeOffset;
                eye2Y = centerY + eyeOffset;
            } else if (dy === -1) { // Moving up
                eye1X = centerX - eyeOffset;
                eye1Y = centerY - eyeOffset;
                eye2X = centerX + eyeOffset;
                eye2Y = centerY - eyeOffset;
            } else { // Moving down
                eye1X = centerX - eyeOffset;
                eye1Y = centerY + eyeOffset;
                eye2X = centerX + eyeOffset;
                eye2Y = centerY + eyeOffset;
            }

            // Draw eyes
            ctx.beginPath();
            ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
            ctx.fill();
        }
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
    homeBtn.style.display = 'inline-block'; // Show home button on game over
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
        homeBtn.style.display = 'none'; // Hide home button when paused
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

    // Determine the reference direction for validation
    // If queue is empty: validate against current direction (dx, dy)
    // If queue has 1 move: validate against that queued move
    // If queue has 2 moves: ignore (queue is full)
    let referenceDx, referenceDy;

    if (moveQueue.length === 0) {
        // Validate against current direction
        referenceDx = dx;
        referenceDy = dy;
    } else if (moveQueue.length === 1) {
        // Validate against the queued move
        referenceDx = moveQueue[0].dx;
        referenceDy = moveQueue[0].dy;
    } else {
        // Queue is full, ignore input
        return;
    }

    // Arrow keys and WASD - validate against reference direction
    let newDx = null;
    let newDy = null;

    if ((e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') && referenceDy === 0) {
        newDx = 0;
        newDy = -1;
    } else if ((e.key === 'ArrowDown' || e.key.toLowerCase() === 's') && referenceDy === 0) {
        newDx = 0;
        newDy = 1;
    } else if ((e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') && referenceDx === 0) {
        newDx = -1;
        newDy = 0;
    } else if ((e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') && referenceDx === 0) {
        newDx = 1;
        newDy = 0;
    }

    // Only queue the move if it's valid
    if (newDx !== null && newDy !== null) {
        // Allow up to 2 moves in the queue
        if (moveQueue.length < 2) {
            moveQueue.push({ dx: newDx, dy: newDy });
        }
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

// Settings modal event listeners
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
});

closeSettings.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
});

// Close modal when clicking outside
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
    }
});

// Theme toggle
darkModeBtn.addEventListener('click', () => {
    document.body.classList.remove('light-mode');
    darkModeBtn.classList.add('active');
    lightModeBtn.classList.remove('active');
    localStorage.setItem('snakeTheme', 'dark');
});

lightModeBtn.addEventListener('click', () => {
    document.body.classList.add('light-mode');
    lightModeBtn.classList.add('active');
    darkModeBtn.classList.remove('active');
    localStorage.setItem('snakeTheme', 'light');
});

// Function to update game speed based on control mode
function updateGameSpeed() {
    // Recalculate speed based on current control mode
    if (document.body.classList.contains('mobile-mode') ||
        document.body.classList.contains('tablet-mode')) {
        currentSpeed = Math.floor(baseSpeed * 1.2); // 20% slower
    } else {
        currentSpeed = baseSpeed;
    }

    // If game is running, restart the game loop with new speed
    if (gameLoop && !isPaused && !isGameOver) {
        clearInterval(gameLoop);
        gameLoop = setInterval(update, currentSpeed);
    }
}

// Control mode toggle
pcModeBtn.addEventListener('click', () => {
    document.body.classList.remove('mobile-mode', 'tablet-mode');
    pcModeBtn.classList.add('active');
    mobileModeBtn.classList.remove('active');
    tabletModeBtn.classList.remove('active');
    localStorage.setItem('snakeControlMode', 'pc');
    updateGameSpeed();
});

mobileModeBtn.addEventListener('click', () => {
    document.body.classList.remove('tablet-mode');
    document.body.classList.add('mobile-mode');
    mobileModeBtn.classList.add('active');
    pcModeBtn.classList.remove('active');
    tabletModeBtn.classList.remove('active');
    localStorage.setItem('snakeControlMode', 'mobile');
    updateGameSpeed();
});

tabletModeBtn.addEventListener('click', () => {
    document.body.classList.remove('mobile-mode');
    document.body.classList.add('tablet-mode');
    tabletModeBtn.classList.add('active');
    pcModeBtn.classList.remove('active');
    mobileModeBtn.classList.remove('active');
    localStorage.setItem('snakeControlMode', 'tablet');
    updateGameSpeed();
});

// Mobile D-pad controls
dpadButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (isPaused || isGameOver) return;

        const direction = btn.dataset.direction;
        handleMobileInput(direction);
    });

    // Touch support for better mobile experience
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (isPaused || isGameOver) return;

        const direction = btn.dataset.direction;
        handleMobileInput(direction);
    });
});

function handleMobileInput(direction) {
    // Determine the reference direction for validation
    let referenceDx, referenceDy;

    if (moveQueue.length === 0) {
        referenceDx = dx;
        referenceDy = dy;
    } else if (moveQueue.length === 1) {
        referenceDx = moveQueue[0].dx;
        referenceDy = moveQueue[0].dy;
    } else {
        return; // Queue is full
    }

    let newDx = null;
    let newDy = null;

    switch(direction) {
        case 'up':
            if (referenceDy === 0) {
                newDx = 0;
                newDy = -1;
            }
            break;
        case 'down':
            if (referenceDy === 0) {
                newDx = 0;
                newDy = 1;
            }
            break;
        case 'left':
            if (referenceDx === 0) {
                newDx = -1;
                newDy = 0;
            }
            break;
        case 'right':
            if (referenceDx === 0) {
                newDx = 1;
                newDy = 0;
            }
            break;
    }

    if (newDx !== null && newDy !== null) {
        if (moveQueue.length < 2) {
            moveQueue.push({ dx: newDx, dy: newDy });
        }
    }
}

// Erase high score
eraseHighscoreBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to erase your high score?')) {
        localStorage.removeItem('snakeHighScore');
        highScore = 0;
        highScoreElement.textContent = highScore;
        alert('High score has been erased!');
    }
});

// Initialize theme from localStorage
const savedTheme = localStorage.getItem('snakeTheme') || 'dark';
if (savedTheme === 'light') {
    document.body.classList.add('light-mode');
    lightModeBtn.classList.add('active');
    darkModeBtn.classList.remove('active');
}

// Detect device type
function detectDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Check for tablet
    const isTablet = isTouchDevice && (
        /ipad/.test(userAgent) ||
        (/android/.test(userAgent) && !/mobile/.test(userAgent)) ||
        (window.innerWidth >= 768 && window.innerWidth <= 1024)
    );

    // Check for mobile phone
    const isMobile = isTouchDevice && !isTablet && (
        /iphone|ipod|android.*mobile|blackberry|opera mini|iemobile|windows phone/.test(userAgent) ||
        window.innerWidth < 768
    );

    if (isTablet) return 'tablet';
    if (isMobile) return 'mobile';
    return 'pc';
}

// Initialize control mode from localStorage or auto-detect
let savedControlMode = localStorage.getItem('snakeControlMode');
if (!savedControlMode) {
    // First time visit - auto-detect device
    savedControlMode = detectDeviceType();
    localStorage.setItem('snakeControlMode', savedControlMode);
}

if (savedControlMode === 'mobile') {
    document.body.classList.add('mobile-mode');
    mobileModeBtn.classList.add('active');
    pcModeBtn.classList.remove('active');
    tabletModeBtn.classList.remove('active');
} else if (savedControlMode === 'tablet') {
    document.body.classList.add('tablet-mode');
    tabletModeBtn.classList.add('active');
    pcModeBtn.classList.remove('active');
    mobileModeBtn.classList.remove('active');
} else {
    pcModeBtn.classList.add('active');
    mobileModeBtn.classList.remove('active');
    tabletModeBtn.classList.remove('active');
}

// Difficulty selection from start screen
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const difficulty = btn.dataset.difficulty;
        startGameWithDifficulty(difficulty);
    });
});

// Home button to return to start screen
homeBtn.addEventListener('click', () => {
    showStartScreen();
    overlay.classList.add('hidden');
    isPaused = false;
    isGameOver = false;
});

// Fullscreen toggle
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        // Enter fullscreen
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Error attempting to enable fullscreen:', err);
        });
        fullscreenBtn.textContent = '⛶';
    } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
});

// Update fullscreen button when fullscreen state changes
document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
        fullscreenBtn.textContent = '⛶';
    } else {
        fullscreenBtn.textContent = '⛶';
    }
});

// Initialize high score display
highScoreElement.textContent = highScore;

// Show start screen on load
showStartScreen();
