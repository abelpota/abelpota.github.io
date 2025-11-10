# OciGames - Snake Game

A modern, feature-rich Snake game built with vanilla JavaScript, HTML5 Canvas, and CSS. Play the classic arcade game with multiple difficulty levels, game modes, responsive controls, and a beautiful dark theme interface.

## Features

### Game Modes
- **Classic Mode**: Traditional Snake gameplay - eat food and grow!
- **Mystery Mode**: Find food hidden within a 3×3 zone for added challenge
- **5 Difficulty Levels**: Easy (10×10), Medium (15×15), Hard (20×20), EXTREME (25×25), and Custom
- **Custom Mode**: Fully customizable map size (10-30 tiles) and speed (20-200ms)
- **Dynamic Speed**: Ranges from 150ms (Easy) to 30ms (EXTREME) for increasingly challenging gameplay
- **Per-Difficulty High Scores**: Track your best score for each difficulty level separately
- **High Score Eligibility**: Wall collision mode must be enabled to save high scores

### Controls
- **PC Mode**: Keyboard controls (WASD or Arrow keys)
- **Mobile Mode**: Touch-friendly D-pad positioned below the game
- **Tablet Mode**: Touch D-pad positioned beside the game for landscape play
- **Auto-Detection**: Automatically detects your device type on first visit

### Visual Features
- Modern gradient design with smooth shadows
- Dark and Light theme options
- Snake head with directional eyes and yellow accent glow
- Pulsing food animation
- Fullscreen mode support
- Responsive design that adapts to any screen size

### Gameplay Features
- Snake waits for first input before moving
- Toggle between wall collision (game over) and wrap-around modes
- **High score tracking** only available with wall collision enabled
- **Visual feedback**: High score display turns gray when ineligible to save
- Pause/resume functionality
- Movement queue system prevents invalid 180° turns
- Smooth controls with input buffering (allows queuing 2 moves)
- Mobile/tablet modes run 40% slower for fairer touch control
- Clickable version number with full changelog history

## How to Play

### Starting the Game
1. Open `index.html` in your web browser to see the OciGames homepage
2. Click on the Snake Game tile
3. Select your game mode (Classic or Mystery)
4. Choose your difficulty level from the start screen
5. Press any direction key (or tap the D-pad on mobile) to begin

### Controls
**Keyboard (PC Mode):**
- Arrow Keys or WASD to move
- Space to pause/resume
- R to restart

**Mobile/Tablet:**
- Tap the D-pad buttons to control direction
- Tap Pause button to pause/resume

### Objective
- **Classic Mode**: Eat food to grow longer and earn points (1 point per food)
- **Mystery Mode**: Find and eat food hidden within the glowing 3×3 zone
- Avoid hitting walls (if enabled) or yourself
- Try to beat your high score for each difficulty!
- Note: High scores can only be saved when wall collision is enabled

## Settings
Access settings via the gear icon (⚙️) in the top-right corner:
- **Theme**: Switch between Dark and Light modes
- **Control Mode**: Choose PC, Mobile, or Tablet mode (with device auto-detection)
- **Erase High Scores**: Clear all high scores with confirmation

## Technical Details

### Technologies Used
- Pure HTML5, CSS3, and JavaScript
- HTML5 Canvas for rendering
- localStorage for high score persistence
- No external dependencies or build process

### Browser Compatibility
Works in all modern browsers that support:
- HTML5 Canvas
- CSS3 (Grid, Flexbox, Gradients)
- ES6 JavaScript
- localStorage API

## Version

### Snake Game Version: **v5.3.2**

#### Recent Updates
- **v5.3.2**: Fixed critical bug where pressing the opposite direction to snake movement caused instant death (in both normal and Hell mode)
- **v5.3.1**: Improved Hell Mode mechanics - red border now persists through all 3 rounds and decays by 1/3 per game over. Button is disabled during active Hell mode. Switching control modes immediately deactivates Hell mode.
- **v5.3.0**: Added hidden "Hell Mode" easter egg - repeatedly click an active control mode button in settings to activate randomized controls for 3 rounds. Features animated red border progress indicator and automatic decay system.
- **v5.2.0**: Added optional mobile slowdown toggle in settings (mobile/tablet modes only). Slowdown is enabled by default but can be disabled to play at full speed. Setting persists across sessions via localStorage.
- **v5.1.1**: High score display now turns gray when player is no longer eligible to save high scores
- **v5.1.0**: Wall collision toggle now affects high score eligibility (disabling prevents high score tracking for that round)
- **v5.0.1**: Fixed Mystery mode bug where food always spawned at center of zone (now spawns randomly within zone)
- **v5.0.0**: Added Mystery game mode with zone-based food location, game mode selector on start screen
- **v4.5.2**: Fixed changelog modal overflow bug in Snake game
- **v4.5.1**: Updated version format to include PATCH number (vMAJOR.MINOR.PATCH)
- **v4.5.0**: Added clickable version history modal with improved dark/light mode styling
- **v4.4**: Added favicon icons (🎮 for homepage, 🐍 for Snake game)
- **v4.3**: Custom mode multi-color gradient, reduced Coming Soon tiles to one, renamed to OciGames
- **v4.2**: Added home button and replaced emojis with Material Icons
- **v4.1**: Created homepage portal (index.html) with game tile navigation, moved Snake game to snake.html
- **v4.0**: Added Custom game mode with adjustable map size (10-30 tiles) and speed (20-200ms)

#### Full Version History
- **v3.2**: Snake waits for first player input before moving (keyboard and mobile D-pad support)
- **v3.1**: Added 1-second delay before snake starts moving, difficulty-specific high score labels
- **v3.0**: Increased tile size to 40px (larger tiles with 400-1000px canvases), per-difficulty high score tracking, added EXTREME difficulty mode
- **v2.1**: Added icons to control mode buttons (🖥️📱📲), improved touch response (touchstart)
- **v2.0**: Added tablet mode, fullscreen toggle, device auto-detection, and balanced mobile/tablet speed (40% slower)
- **v1.0**: Initial release with dark theme, mobile mode, settings modal, and dynamic difficulty

### Homepage Version: **v1.2.1**
- **v1.2.1**: Fixed changelog modal overflow (items now clip properly when scrolling)
- **v1.2.0**: Added homepage version number with clickable changelog modal
- **v1.1**: Added favicon (🎮), reduced placeholder tiles to one, rebranded to OciGames
- **v1.0**: Initial homepage creation with game portal design, game tiles with hover effects

## Running Locally
Simply open `index.html` in your web browser. No build step or server required!

## File Structure
```
├── index.html      # Homepage portal with game tiles
├── homepage.css    # Homepage styling
├── snake.html      # Snake game HTML structure
├── game.js         # Snake game logic and controls
├── style.css       # Snake game styling and themes
├── CLAUDE.md       # Development documentation
└── README.md       # This file
```

## License
This project is open source and available for personal and educational use.

## Credits
Developed with assistance from Claude Code (claude.ai/code)
