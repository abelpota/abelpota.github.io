# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a classic Snake game built with vanilla JavaScript, HTML5 Canvas, and CSS. The game runs entirely in the browser with no build process or dependencies.

## Running the Game

Simply open `index.html` in a web browser. No build step or server required.

## Architecture

### File Structure
- `index.html` - Homepage portal with game tiles and navigation
- `homepage.css` - Styling for the homepage portal
- `snake.html` - Snake game HTML structure with game UI and canvas
- `game.js` - All game logic, rendering, and input handling
- `style.css` - Modern styling for the Snake game with gradients and flexbox layout
- `CLAUDE.md` - Development documentation
- `README.md` - Project documentation

### Game Loop Architecture

The game uses a simple interval-based game loop (`setInterval`) that calls `update()` at speeds determined by difficulty level (30ms-150ms). The update function:
1. Processes queued movement from `moveQueue`
2. Calculates new snake head position
3. Checks collisions (walls, self)
4. Handles food consumption
5. Calls `draw()` to render

### Critical: Movement Queue System

**The movement queue prevents the "double-turn bug"** where pressing two keys before the snake moves a grid square would cause it to turn 180° into itself.

Key implementation details in `game.js`:
- `moveQueue` stores up to **TWO** pending moves (allows queuing second input)
- Validation logic:
  - If queue is empty: validate against current direction (`dx`, `dy`)
  - If queue has 1 move: validate against that queued move
  - If queue has 2 moves: ignore additional inputs
- This ensures responsive controls while preventing invalid 180° turns

Example flow:
1. Snake moving RIGHT (dx=1, dy=0)
2. Player presses UP → Valid (dy === 0), queued as [{dx:0, dy:-1}]
3. Player presses LEFT immediately → Valid against queued UP (referenceDx === 0), queued as [{dx:0, dy:-1}, {dx:-1, dy:0}]
4. Next `update()` → Processes UP from queue, queue becomes [{dx:-1, dy:0}]
5. Next `update()` → Processes LEFT from queue, queue is empty

### Canvas Rendering

The `draw()` function renders to a dynamically sized canvas with a 40px grid:
- **Dynamic Canvas Sizing**: Canvas size changes based on difficulty (larger tiles for better visibility)
  - Easy: 400x400px (10x10 tiles, 40px each)
  - Medium: 600x600px (15x15 tiles, 40px each)
  - Hard: 800x800px (20x20 tiles, 40px each)
  - EXTREME: 1000x1000px (25x25 tiles, 40px each)
- Grid background with subtle lines
- Snake segments with gradient effects and shadows
- **Snake head visual indicators**:
  - Yellow accent gradient (`#ffeb3b`) to distinguish from body
  - Stronger yellow glow effect
  - Dynamic eyes that face the direction of movement
  - Eyes reposition based on `dx` and `dy` values
- Food with pulsing animation using `Date.now()` for timing
- All shapes use rounded corners for modern appearance

### State Management

Game state is managed through module-level variables:
- `snake` - Array of {x, y} positions (head at index 0)
- `dx, dy` - Current movement direction
- `moveQueue` - Array storing up to 2 queued direction changes
- `food` - Current food position
- `score, highScore` - Score tracking (high score persists in localStorage)
- `isPaused, isGameOver` - Game state flags

### Features

**Start Screen:**
- Difficulty selection screen with three colorful buttons
- Shows tile count and speed for each difficulty
- No auto-start - player must choose difficulty first
- Home button on game over screen returns to start screen

**Game Mechanics:**
- Score: 1 point per food collected
- **Separate high scores** saved for each difficulty level (including custom mode)
- Five difficulty levels with dynamic canvas sizing (40px tiles):
  - Easy: 10x10 tiles, 150ms speed
  - Medium: 15x15 tiles, 100ms speed
  - Hard: 20x20 tiles, 60ms speed
  - **EXTREME**: 25x25 tiles, 30ms speed (extremely fast and challenging)
  - **Custom**: Fully customizable (10-30 tiles, 20-200ms speed)
- **Custom Mode**: Adjustable sliders for map size and snake speed
  - Map size: 10-30 tiles (10x10 to 30x30 grid)
  - Speed: 20ms (fastest) to 200ms (slowest)
  - Separate high score tracking for custom mode
- Toggleable wall collision mode (game over vs. wrap-around)
- Pause/resume functionality (Space key or button)
- Keyboard controls: WASD and Arrow keys
- Mobile touch controls: D-pad interface

**Visual Features:**
- Modern gradient design with smooth shadows
- Dark purple theme with dark UI elements
- Distinguishable snake head with yellow glow and directional eyes
- Pulsing food animation
- Responsive layout that adapts to window size
- No page scrolling when using arrow keys

**UI Elements:**
- **Fullscreen Button** (top-left): Toggle fullscreen mode with ⛶ icon
  - Scales on hover
  - Uses browser's native fullscreen API
- **Version Number** (top-right): Displays current version (v1.0)
  - Subtle purple color with opacity
- **Settings Button** (top-right): Gear icon that rotates on hover

**Settings System:**
- Gear icon button in top-right corner opens modal
- **Theme Toggle**: Switch between Dark mode (default) and Light mode
  - Dark: Dark purple gradient background (#1a0b2e to #2d1b4e) with dark UI, white fullscreen button
  - Light: Blue/pink gradient background with light gray canvas, purple fullscreen button
  - Theme preference saved in localStorage
- **Control Mode Toggle**: Switch between PC, Mobile, and Tablet modes with icons (🖥️ PC, 📱 Mobile, 📲 Tablet)
  - **Auto-detection**: On first visit, automatically detects device type (PC/Mobile/Tablet)
  - PC Mode: Keyboard controls with instruction panel, normal speed
  - Mobile Mode: Touch D-pad controls below game, optimized mobile layout, 40% slower speed
  - Tablet Mode: Touch D-pad controls to the right of game, 40% slower speed
  - Control mode preference saved in localStorage
  - **Dynamic Speed Adjustment**: Switching modes during gameplay updates speed in real-time
- **Erase High Score**: Red button with confirmation dialog
- Settings modal can be closed via × button or clicking outside

**Mobile Mode Features:**
- Large touch-friendly D-pad controls (70x70px buttons) positioned below game
- **Immediate touch response**: D-pad responds instantly on touchstart (not touchend)
- Visual feedback with active state during touch
- Hides keyboard instructions panel
- Optimized canvas sizing for mobile viewport (35vh max-height)
- Reduced padding and margins for compact layout
- Touch and click event support for buttons
- Vertical layout (D-pad below canvas)
- Prevents top/bottom overflow with proper spacing
- **40% slower game speed** for fairer touch control (210ms easy, 140ms medium, 84ms hard)

**Tablet Mode Features:**
- Same touch-friendly D-pad controls as mobile
- D-pad positioned to the right of the game canvas
- Horizontal layout (D-pad beside canvas)
- Canvas max size: 60vw width, 70vh height
- Better suited for landscape orientation
- **40% slower game speed** for fairer touch control (same as mobile)

**Auto-Detection System:**
- Detects device type on first visit using user agent and touch capabilities
- Checks for iPad, Android tablets, and screen size (768-1024px = tablet)
- Mobile phones detected by touch + small screen (<768px) or mobile user agent
- Falls back to PC mode for desktop browsers
- User can manually override at any time via settings

**LocalStorage Persistence:**
- Separate high scores per difficulty:
  - `snakeHighScore_easy`
  - `snakeHighScore_medium`
  - `snakeHighScore_hard`
  - `snakeHighScore_extreme`
- Theme preference (`snakeTheme`)
- Control mode preference (`snakeControlMode`)

### Responsive Design

**Page Scroll Prevention:**
- HTML and body have `overflow: hidden` to prevent page scrolling
- Body is `position: fixed` to lock viewport in place
- Arrow keys won't trigger page scroll during gameplay

**Canvas Sizing:**
- Canvas size is dynamic based on difficulty (400px/600px/800px/1000px with 40px tiles)
- Uses `max-width: 100%` and adaptive `max-height` calculations
- Maintains square aspect ratio without squashing
- Minimum height constraints prevent over-compression
- Mobile mode reduces canvas to 35vh max-height for better fit and overflow prevention
- Tablet mode uses 60vw/70vh max sizing for horizontal layout

**Layout Adaptation:**
- Container uses `max-height: calc(100vh - 20px)` to fit viewport
- Container has `overflow-y: auto` in mobile mode to prevent content cutoff
- Game content wraps responsively on smaller screens
- Mobile mode forces vertical column layout for better touch experience
- Tablet mode uses horizontal row layout with D-pad on the right
- All changes maintain the GRID_SIZE ratio (40px per tile)

### Version

**Snake Game Version:** **v5.1.0**
- Displayed in top-right corner of the Snake game (in snake.html)
- Tracks changes specific to the Snake game

**Homepage Version:** **v1.2.1**
- Displayed in top-right corner of the homepage (in index.html)
- Tracks changes specific to the homepage portal

**Version Format**: `vMAJOR.MINOR.PATCH`
- **Major (first number)**: Incremented for new features or major updates
- **Minor (second number)**: Incremented for smaller features and enhancements
- **Patch (third number)**: Incremented for bug fixes and minor tweaks
- Patch resets to 0 when minor is incremented
- Minor resets to 0 when major is incremented
- Each page (homepage and Snake game) maintains its own independent version number
- Update version numbers in the respective HTML files and this documentation when releasing new versions

**Snake Game Version History:**
- **v5.1.0**: Wall collision toggle now affects high score eligibility (disabling prevents high score tracking for that round)
- **v5.0.1**: Fixed Mystery mode bug where food always spawned at center of zone (now spawns randomly within zone)
- **v5.0.0**: Added Mystery game mode with zone-based food location, game mode selector on start screen
- **v4.5.2**: Fixed changelog modal overflow bug in Snake game
- **v4.5.1**: Updated version format to include PATCH number
- **v4.5.0**: Added clickable version history modal with improved dark/light mode styling
- **v4.4**: Added favicon icons (🎮 for homepage, 🐍 for Snake game)
- **v4.3**: Custom mode multi-color gradient, reduced Coming Soon tiles to one, renamed to OciGames
- **v4.2**: Added home button and replaced emojis with Material Icons
- **v4.1**: Created homepage portal (index.html) with game tile navigation, moved Snake game to snake.html
- **v4.0**: Added Custom game mode with adjustable map size (10-30 tiles) and speed (20-200ms)
- **v3.2**: Snake waits for first player input before moving (keyboard and mobile D-pad support)
- **v3.1**: Added 1-second delay before snake starts moving, difficulty-specific high score labels
- **v3.0**: Increased tile size to 40px (larger tiles with 400-1000px canvases), per-difficulty high score tracking, added EXTREME difficulty mode
- **v2.1**: Added icons to control mode buttons (🖥️📱📲), improved touch response (touchstart)
- **v2.0**: Added tablet mode, fullscreen toggle, device auto-detection, and balanced mobile/tablet speed (40% slower)
- **v1.0**: Initial release with dark theme, mobile mode, settings modal, and dynamic difficulty

**Homepage Version History:**
- **v1.2.1**: Fixed changelog modal overflow (items now clip properly when scrolling)
- **v1.2.0**: Added homepage version number with clickable changelog modal
- **v1.1**: Added favicon (🎮), reduced placeholder tiles to one, rebranded to OciGames
- **v1.0**: Initial homepage creation with game portal design, game tiles with hover effects
