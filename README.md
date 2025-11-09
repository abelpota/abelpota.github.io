# Snake Game

A modern, feature-rich Snake game built with vanilla JavaScript, HTML5 Canvas, and CSS. Play the classic arcade game with multiple difficulty levels, responsive controls, and a beautiful dark theme interface.

## Features

### Game Modes
- **4 Difficulty Levels**: Easy (10×10), Medium (15×15), Hard (20×20), and EXTREME (25×25)
- **Dynamic Speed**: Ranges from 150ms (Easy) to 30ms (EXTREME) for increasingly challenging gameplay
- **Per-Difficulty High Scores**: Track your best score for each difficulty level separately

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
- Pause/resume functionality
- Movement queue system prevents invalid 180° turns
- Smooth controls with input buffering (allows queuing 2 moves)
- Mobile/tablet modes run 40% slower for fairer touch control

## How to Play

### Starting the Game
1. Open `index.html` in your web browser
2. Choose your difficulty level from the start screen
3. Press any direction key (or tap the D-pad on mobile) to begin

### Controls
**Keyboard (PC Mode):**
- Arrow Keys or WASD to move
- Space to pause/resume
- R to restart

**Mobile/Tablet:**
- Tap the D-pad buttons to control direction
- Tap Pause button to pause/resume

### Objective
- Eat food to grow longer and earn points (1 point per food)
- Avoid hitting walls (if enabled) or yourself
- Try to beat your high score for each difficulty!

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
Current version: **v3.2**

### Version History
- **v3.2**: Snake waits for first player input before moving (keyboard and mobile D-pad support)
- **v3.1**: Added 1-second delay before snake starts moving, difficulty-specific high score labels
- **v3.0**: Increased tile size to 40px (larger tiles with 400-1000px canvases), per-difficulty high score tracking, added EXTREME difficulty mode
- **v2.1**: Added icons to control mode buttons (🖥️📱📲), improved touch response (touchstart)
- **v2.0**: Added tablet mode, fullscreen toggle, device auto-detection, and balanced mobile/tablet speed (40% slower)
- **v1.0**: Initial release with dark theme, mobile mode, settings modal, and dynamic difficulty

## Running Locally
Simply open `index.html` in your web browser. No build step or server required!

## File Structure
```
├── index.html      # Main HTML structure
├── game.js         # Game logic and controls
├── style.css       # Styling and themes
├── CLAUDE.md       # Development documentation
└── README.md       # This file
```

## License
This project is open source and available for personal and educational use.

## Credits
Developed with assistance from Claude Code (claude.ai/code)
