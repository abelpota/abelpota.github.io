// Game configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('highScore');
const highScoreLabel = document.getElementById('highScoreLabel');
const highScoreContainer = document.getElementById('highScoreContainer');
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
const customScreen = document.getElementById('customScreen');
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
const mobileSlowdownCheckbox = document.getElementById('mobileSlowdownCheckbox');
const mobileSlowdownSetting = document.getElementById('mobileSlowdownSetting');
const eraseHighscoreBtn = document.getElementById('eraseHighscoreBtn');

// Mobile controls
const mobileControls = document.getElementById('mobileControls');
const dpadButtons = document.querySelectorAll('.dpad-btn');

// Custom mode elements
const customSizeSlider = document.getElementById('customSize');
const customSpeedSlider = document.getElementById('customSpeed');
const customSizeValue = document.getElementById('customSizeValue');
const customSizeValue2 = document.getElementById('customSizeValue2');
const customSpeedValue = document.getElementById('customSpeedValue');
const startCustomBtn = document.getElementById('startCustomBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');

// Difficulty settings (speed in ms, tile count, and grid size)
const DIFFICULTY_SETTINGS = {
    easy: { speed: 150, tiles: 10, gridSize: 40 },      // 10x10 tiles, 40px each = 400x400
    medium: { speed: 100, tiles: 15, gridSize: 40 },    // 15x15 tiles, 40px each = 600x600
    hard: { speed: 60, tiles: 20, gridSize: 40 },       // 20x20 tiles, 40px each = 800x800
    extreme: { speed: 30, tiles: 25, gridSize: 40 }     // 25x25 tiles, 40px each = 1000x1000
};

let GRID_SIZE = 40;
let currentDifficulty = 'medium';
let currentGameMode = 'classic'; // 'classic' or 'mystery'

let TILE_COUNT = canvas.width / GRID_SIZE;

// Game state
let snake = [];
let food = {};
let foodZone = {}; // Mystery mode: stores the top-left corner of the 3x3 zone
let dx = 0;
let dy = 0;
let score = 0;
let highScore = 0;
let gameLoop = null;
let isPaused = false;
let isGameOver = false;
let currentSpeed = DIFFICULTY_SETTINGS.medium.speed;
let baseSpeed = DIFFICULTY_SETTINGS.medium.speed; // Base speed without multipliers
let moveQueue = []; // Queue for storing next move
let canSaveHighScore = true; // Tracks if current round can save high score

// Hell mode easter egg state
let hellModeProgress = 0; // 0-100 percentage
let hellModeActive = false;
let hellModeRoundsRemaining = 0;
let hellModeDecayTimer = null;
let controlMapping = null; // Stores randomized control mapping for hell mode

// Function to get high score for current difficulty
function getHighScore(difficulty) {
    return parseInt(localStorage.getItem(`snakeHighScore_${difficulty}`)) || 0;
}

// Function to save high score for current difficulty
function saveHighScore(difficulty, score) {
    localStorage.setItem(`snakeHighScore_${difficulty}`, score);
}

// Hell mode functions
function updateHellModeProgress(button) {
    hellModeProgress = Math.min(100, hellModeProgress + 10);
    const angle = (hellModeProgress / 100) * 360;

    button.classList.add('hell-progress');
    button.style.setProperty('--progress-angle', `${angle}deg`);

    if (hellModeProgress >= 100) {
        activateHellMode();
        resetHellModeProgress(button);
    }

    // Reset decay timer
    if (hellModeDecayTimer) {
        clearTimeout(hellModeDecayTimer);
    }

    // Start decay timer (2 seconds of inactivity)
    hellModeDecayTimer = setTimeout(() => {
        decayHellModeProgress(button);
    }, 2000);
}

function decayHellModeProgress(button) {
    if (hellModeProgress > 0 && !settingsModal.classList.contains('hidden')) {
        hellModeProgress = Math.max(0, hellModeProgress - 5);
        const angle = (hellModeProgress / 100) * 360;
        button.style.setProperty('--progress-angle', `${angle}deg`);

        if (hellModeProgress === 0) {
            button.classList.remove('hell-progress');
            if (hellModeDecayTimer) {
                clearTimeout(hellModeDecayTimer);
                hellModeDecayTimer = null;
            }
        } else {
            // Continue decaying
            hellModeDecayTimer = setTimeout(() => {
                decayHellModeProgress(button);
            }, 200);
        }
    }
}

function resetHellModeProgress(button) {
    hellModeProgress = 0;
    button.classList.remove('hell-progress');
    button.style.setProperty('--progress-angle', '0deg');
    if (hellModeDecayTimer) {
        clearTimeout(hellModeDecayTimer);
        hellModeDecayTimer = null;
    }
}

function activateHellMode() {
    hellModeActive = true;
    hellModeRoundsRemaining = 3;

    // Create randomized control mapping
    const directions = [
        { dx: 0, dy: -1 }, // up
        { dx: 0, dy: 1 },  // down
        { dx: -1, dy: 0 }, // left
        { dx: 1, dy: 0 }   // right
    ];

    // Shuffle the directions array
    const shuffled = [...directions].sort(() => Math.random() - 0.5);

    controlMapping = {
        up: shuffled[0],
        down: shuffled[1],
        left: shuffled[2],
        right: shuffled[3]
    };

    console.log('Hell Mode Activated! Controls randomized for 3 rounds.');
}

function deactivateHellMode() {
    hellModeActive = false;
    hellModeRoundsRemaining = 0;
    controlMapping = null;
    console.log('Hell Mode deactivated.');
}

// Screen management
function showStartScreen() {
    startScreen.classList.remove('hidden');
    customScreen.classList.add('hidden');
    gameHeader.classList.add('hidden');
    controlsPanel.classList.add('hidden');
    gameContent.classList.add('hidden');
    if (gameLoop) clearInterval(gameLoop);
}

function showCustomScreen() {
    startScreen.classList.add('hidden');
    customScreen.classList.remove('hidden');
    gameHeader.classList.add('hidden');
    controlsPanel.classList.add('hidden');
    gameContent.classList.add('hidden');
}

function showGameScreen() {
    startScreen.classList.add('hidden');
    customScreen.classList.add('hidden');
    gameHeader.classList.remove('hidden');
    controlsPanel.classList.remove('hidden');
    gameContent.classList.remove('hidden');
}

function startGameWithDifficulty(difficulty) {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    currentDifficulty = difficulty;
    baseSpeed = settings.speed;
    currentSpeed = baseSpeed;

    // Apply speed multiplier for mobile/tablet modes (40% slower) if slowdown is enabled
    const isMobileOrTablet = document.body.classList.contains('mobile-mode') ||
                            document.body.classList.contains('tablet-mode');
    const slowdownEnabled = mobileSlowdownCheckbox.checked;

    if (isMobileOrTablet && slowdownEnabled) {
        currentSpeed = Math.floor(currentSpeed * 1.4);
    }

    // Update grid size and canvas dimensions
    GRID_SIZE = settings.gridSize;
    TILE_COUNT = settings.tiles;
    canvas.width = settings.tiles * settings.gridSize;
    canvas.height = settings.tiles * settings.gridSize;

    // Load high score for this difficulty
    highScore = getHighScore(difficulty);
    updateScore();

    // Show game screen and start game
    showGameScreen();
    initGame();
}

function startCustomGame(tiles, speed) {
    currentDifficulty = 'custom';
    baseSpeed = speed;
    currentSpeed = baseSpeed;

    // Apply speed multiplier for mobile/tablet modes (40% slower) if slowdown is enabled
    const isMobileOrTablet = document.body.classList.contains('mobile-mode') ||
                            document.body.classList.contains('tablet-mode');
    const slowdownEnabled = mobileSlowdownCheckbox.checked;

    if (isMobileOrTablet && slowdownEnabled) {
        currentSpeed = Math.floor(currentSpeed * 1.4);
    }

    // Update grid size and canvas dimensions
    GRID_SIZE = 40;
    TILE_COUNT = tiles;
    canvas.width = tiles * 40;
    canvas.height = tiles * 40;

    // Load high score for custom mode
    highScore = getHighScore('custom');
    updateScore();

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

    // Start with no movement - will start on first input
    dx = 0;
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
    canSaveHighScore = wallModeCheckbox.checked; // Only eligible if wall mode is enabled at start

    // Update visual feedback for high score eligibility
    if (canSaveHighScore) {
        highScoreContainer.classList.remove('ineligible');
    } else {
        highScoreContainer.classList.add('ineligible');
    }

    hideOverlay();

    // Start game loop
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, currentSpeed);

    // Initial draw to show the starting position
    draw();
}

// Generate food at random position
function generateFood() {
    let validPosition = false;

    while (!validPosition) {
        if (currentGameMode === 'mystery') {
            // Mystery mode: First pick a random 3x3 zone, then place food randomly within it
            // Zone top-left corner can be from 0 to (TILE_COUNT - 3)
            const maxZoneStart = Math.max(0, TILE_COUNT - 3);
            foodZone = {
                x: Math.floor(Math.random() * (maxZoneStart + 1)),
                y: Math.floor(Math.random() * (maxZoneStart + 1))
            };

            // Place food randomly within the zone (0-2 offset from zone corner)
            food = {
                x: foodZone.x + Math.floor(Math.random() * 3),
                y: foodZone.y + Math.floor(Math.random() * 3)
            };
        } else {
            // Classic mode: Place food anywhere on the grid
            food = {
                x: Math.floor(Math.random() * TILE_COUNT),
                y: Math.floor(Math.random() * TILE_COUNT)
            };
        }

        // Check if food is not on snake
        validPosition = !snake.some(segment => segment.x === food.x && segment.y === food.y);
    }
}

// Update game state
function update() {
    if (isPaused || isGameOver) return;

    // Don't move if snake hasn't started yet (initial delay)
    if (dx === 0 && dy === 0) {
        draw();
        return;
    }

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

    // Draw food based on game mode
    const time = Date.now() / 200;
    const pulse = Math.sin(time) * 0.2 + 1;

    if (currentGameMode === 'mystery') {
        // Mystery mode: Draw zone (3x3 area) instead of exact food location
        const zoneSize = 3; // 3x3 tiles

        // Draw semi-transparent zone
        ctx.fillStyle = 'rgba(255, 107, 107, 0.15)';
        ctx.fillRect(
            foodZone.x * GRID_SIZE + 2,
            foodZone.y * GRID_SIZE + 2,
            zoneSize * GRID_SIZE - 4,
            zoneSize * GRID_SIZE - 4
        );

        // Draw pulsing border around zone
        ctx.strokeStyle = `rgba(255, 107, 107, ${0.3 + pulse * 0.2})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(
            foodZone.x * GRID_SIZE + 2,
            foodZone.y * GRID_SIZE + 2,
            zoneSize * GRID_SIZE - 4,
            zoneSize * GRID_SIZE - 4
        );
    } else {
        // Classic mode: Draw food at exact location
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
}

// Update score display
function updateScore() {
    scoreElement.textContent = score;

    // Only update high score if this round is eligible (wall mode was enabled at start)
    if (canSaveHighScore && score > highScore) {
        highScore = score;
        saveHighScore(currentDifficulty, highScore);
    }

    highScoreElement.textContent = highScore;

    // Update high score label with difficulty name
    const difficultyName = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
    highScoreLabel.textContent = `${difficultyName} High Score:`;
}

// Game over
function gameOver() {
    isGameOver = true;
    clearInterval(gameLoop);

    // Decrement Hell mode rounds if active
    if (hellModeActive && hellModeRoundsRemaining > 0) {
        hellModeRoundsRemaining--;
        if (hellModeRoundsRemaining === 0) {
            deactivateHellMode();
        }
    }

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

    // Check if this is the first input (game hasn't started yet)
    const isFirstInput = (dx === 0 && dy === 0);

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
    let direction = null;

    // Determine intended direction from key press
    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        direction = 'up';
    } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') {
        direction = 'down';
    } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        direction = 'left';
    } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        direction = 'right';
    }

    // Apply Hell mode mapping if active
    if (direction && hellModeActive && controlMapping) {
        const mapped = controlMapping[direction];
        if (isFirstInput || (mapped.dx !== 0 ? referenceDy === 0 : referenceDx === 0)) {
            newDx = mapped.dx;
            newDy = mapped.dy;
        }
    } else if (direction) {
        // Normal mapping
        if (direction === 'up' && (isFirstInput || referenceDy === 0)) {
            newDx = 0;
            newDy = -1;
        } else if (direction === 'down' && (isFirstInput || referenceDy === 0)) {
            newDx = 0;
            newDy = 1;
        } else if (direction === 'left' && (isFirstInput || referenceDx === 0)) {
            newDx = -1;
            newDy = 0;
        } else if (direction === 'right' && (isFirstInput || referenceDx === 0)) {
            newDx = 1;
            newDy = 0;
        }
    }

    // Only queue the move if it's valid
    if (newDx !== null && newDy !== null) {
        // If this is the first input, set direction immediately
        if (isFirstInput) {
            dx = newDx;
            dy = newDy;
        } else {
            // Allow up to 2 moves in the queue
            if (moveQueue.length < 2) {
                moveQueue.push({ dx: newDx, dy: newDy });
            }
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

// Wall mode checkbox listener - disables high score eligibility if unchecked during game
wallModeCheckbox.addEventListener('change', () => {
    // If wall mode is disabled during a game, that round can no longer save high score
    if (!wallModeCheckbox.checked && !isGameOver) {
        canSaveHighScore = false;
        highScoreContainer.classList.add('ineligible');
    }
    // Re-enabling wall mode mid-game does NOT restore high score eligibility
});

// Settings modal event listeners
settingsBtn.addEventListener('click', () => {
    settingsModal.classList.remove('hidden');
});

closeSettings.addEventListener('click', () => {
    settingsModal.classList.add('hidden');
    // Reset hell mode progress when settings close
    resetHellModeProgress(pcModeBtn);
    resetHellModeProgress(mobileModeBtn);
    resetHellModeProgress(tabletModeBtn);
});

// Close modal when clicking outside
settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.classList.add('hidden');
        // Reset hell mode progress when settings close
        resetHellModeProgress(pcModeBtn);
        resetHellModeProgress(mobileModeBtn);
        resetHellModeProgress(tabletModeBtn);
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
    // Recalculate speed based on current control mode and slowdown setting
    const isMobileOrTablet = document.body.classList.contains('mobile-mode') ||
                            document.body.classList.contains('tablet-mode');
    const slowdownEnabled = mobileSlowdownCheckbox.checked;

    if (isMobileOrTablet && slowdownEnabled) {
        currentSpeed = Math.floor(baseSpeed * 1.4); // 40% slower
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
    // Check if already active (easter egg trigger)
    if (pcModeBtn.classList.contains('active')) {
        updateHellModeProgress(pcModeBtn);
        return;
    }

    document.body.classList.remove('mobile-mode', 'tablet-mode');
    pcModeBtn.classList.add('active');
    mobileModeBtn.classList.remove('active');
    tabletModeBtn.classList.remove('active');
    mobileSlowdownSetting.classList.add('hidden');
    localStorage.setItem('snakeControlMode', 'pc');
    updateGameSpeed();

    // Reset progress on other buttons
    resetHellModeProgress(mobileModeBtn);
    resetHellModeProgress(tabletModeBtn);
});

mobileModeBtn.addEventListener('click', () => {
    // Check if already active (easter egg trigger)
    if (mobileModeBtn.classList.contains('active')) {
        updateHellModeProgress(mobileModeBtn);
        return;
    }

    document.body.classList.remove('tablet-mode');
    document.body.classList.add('mobile-mode');
    mobileModeBtn.classList.add('active');
    pcModeBtn.classList.remove('active');
    tabletModeBtn.classList.remove('active');
    mobileSlowdownSetting.classList.remove('hidden');
    localStorage.setItem('snakeControlMode', 'mobile');
    updateGameSpeed();

    // Reset progress on other buttons
    resetHellModeProgress(pcModeBtn);
    resetHellModeProgress(tabletModeBtn);
});

tabletModeBtn.addEventListener('click', () => {
    // Check if already active (easter egg trigger)
    if (tabletModeBtn.classList.contains('active')) {
        updateHellModeProgress(tabletModeBtn);
        return;
    }

    document.body.classList.remove('mobile-mode');
    document.body.classList.add('tablet-mode');
    tabletModeBtn.classList.add('active');
    pcModeBtn.classList.remove('active');
    mobileModeBtn.classList.remove('active');
    mobileSlowdownSetting.classList.remove('hidden');
    localStorage.setItem('snakeControlMode', 'tablet');
    updateGameSpeed();

    // Reset progress on other buttons
    resetHellModeProgress(pcModeBtn);
    resetHellModeProgress(mobileModeBtn);
});

// Mobile D-pad controls
dpadButtons.forEach(btn => {
    let touchHandled = false;

    btn.addEventListener('click', (e) => {
        // Prevent click after touch
        if (touchHandled) {
            touchHandled = false;
            return;
        }

        if (isPaused || isGameOver) return;

        const direction = btn.dataset.direction;
        handleMobileInput(direction);
    });

    // Touch support for immediate response on mobile
    btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchHandled = true;

        if (isPaused || isGameOver) return;

        const direction = btn.dataset.direction;
        handleMobileInput(direction);

        // Add active class for visual feedback
        btn.classList.add('dpad-active');
    });

    // Remove visual feedback on touch end
    btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        btn.classList.remove('dpad-active');
    });

    btn.addEventListener('touchcancel', (e) => {
        btn.classList.remove('dpad-active');
    });
});

function handleMobileInput(direction) {
    // Check if this is the first input (game hasn't started yet)
    const isFirstInput = (dx === 0 && dy === 0);

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

    // Apply Hell mode mapping if active
    if (hellModeActive && controlMapping && direction) {
        const mapped = controlMapping[direction];
        if (isFirstInput || (mapped.dx !== 0 ? referenceDy === 0 : referenceDx === 0)) {
            newDx = mapped.dx;
            newDy = mapped.dy;
        }
    } else {
        // Normal mapping
        switch(direction) {
            case 'up':
                if (isFirstInput || referenceDy === 0) {
                    newDx = 0;
                    newDy = -1;
                }
                break;
            case 'down':
                if (isFirstInput || referenceDy === 0) {
                    newDx = 0;
                    newDy = 1;
                }
                break;
            case 'left':
                if (isFirstInput || referenceDx === 0) {
                    newDx = -1;
                    newDy = 0;
                }
                break;
            case 'right':
                if (isFirstInput || referenceDx === 0) {
                    newDx = 1;
                    newDy = 0;
                }
                break;
        }
    }

    if (newDx !== null && newDy !== null) {
        // If this is the first input, set direction immediately
        if (isFirstInput) {
            dx = newDx;
            dy = newDy;
        } else {
            // Allow up to 2 moves in the queue
            if (moveQueue.length < 2) {
                moveQueue.push({ dx: newDx, dy: newDy });
            }
        }
    }
}

// Erase high score
eraseHighscoreBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to erase ALL high scores for ALL difficulties?')) {
        localStorage.removeItem('snakeHighScore_easy');
        localStorage.removeItem('snakeHighScore_medium');
        localStorage.removeItem('snakeHighScore_hard');
        localStorage.removeItem('snakeHighScore_extreme');
        localStorage.removeItem('snakeHighScore_custom');
        highScore = 0;
        highScoreElement.textContent = highScore;
        alert('All high scores have been erased!');
    }
});

// Changelog modal
const versionNumber = document.getElementById('versionNumber');
const changelogModal = document.getElementById('changelogModal');
const closeChangelog = document.getElementById('closeChangelog');

versionNumber.addEventListener('click', () => {
    changelogModal.classList.remove('hidden');
});

closeChangelog.addEventListener('click', () => {
    changelogModal.classList.add('hidden');
});

changelogModal.addEventListener('click', (e) => {
    if (e.target === changelogModal) {
        changelogModal.classList.add('hidden');
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
    mobileSlowdownSetting.classList.remove('hidden');
} else if (savedControlMode === 'tablet') {
    document.body.classList.add('tablet-mode');
    tabletModeBtn.classList.add('active');
    pcModeBtn.classList.remove('active');
    mobileModeBtn.classList.remove('active');
    mobileSlowdownSetting.classList.remove('hidden');
} else {
    pcModeBtn.classList.add('active');
    mobileModeBtn.classList.remove('active');
    tabletModeBtn.classList.remove('active');
    mobileSlowdownSetting.classList.add('hidden');
}

// Initialize mobile slowdown checkbox from localStorage (default: enabled/checked)
const savedSlowdownSetting = localStorage.getItem('snakeMobileSlowdown');
if (savedSlowdownSetting === 'false') {
    mobileSlowdownCheckbox.checked = false;
} else {
    mobileSlowdownCheckbox.checked = true;
}

// Mobile slowdown checkbox listener
mobileSlowdownCheckbox.addEventListener('change', () => {
    localStorage.setItem('snakeMobileSlowdown', mobileSlowdownCheckbox.checked.toString());
    updateGameSpeed();
});

// Difficulty selection from start screen
document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const difficulty = btn.dataset.difficulty;
        if (difficulty === 'custom') {
            showCustomScreen();
        } else {
            startGameWithDifficulty(difficulty);
        }
    });
});

// Home button to return to start screen
homeBtn.addEventListener('click', () => {
    showStartScreen();
    overlay.classList.add('hidden');
    isPaused = false;
    isGameOver = false;
});

// Custom mode slider updates
customSizeSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    customSizeValue.textContent = value;
    customSizeValue2.textContent = value;
});

customSpeedSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    customSpeedValue.textContent = value;
});

// Start custom game
startCustomBtn.addEventListener('click', () => {
    const tiles = parseInt(customSizeSlider.value);
    const speed = parseInt(customSpeedSlider.value);
    startCustomGame(tiles, speed);
});

// Back to menu button
backToMenuBtn.addEventListener('click', () => {
    showStartScreen();
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

// Game mode selector
const classicModeBtn = document.getElementById('classicModeBtn');
const mysteryModeBtn = document.getElementById('mysteryModeBtn');
const gamemodeDescription = document.getElementById('gamemodeDescription');

classicModeBtn.addEventListener('click', () => {
    currentGameMode = 'classic';
    classicModeBtn.classList.add('active');
    mysteryModeBtn.classList.remove('active');
    gamemodeDescription.textContent = 'Classic Snake - Eat the food and grow!';
});

mysteryModeBtn.addEventListener('click', () => {
    currentGameMode = 'mystery';
    mysteryModeBtn.classList.add('active');
    classicModeBtn.classList.remove('active');
    gamemodeDescription.textContent = 'Mystery Mode - Find food in the zone!';
});

// Show start screen on load
showStartScreen();
