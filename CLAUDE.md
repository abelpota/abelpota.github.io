# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a classic Snake game built with vanilla JavaScript, HTML5 Canvas, and CSS. The game runs entirely in the browser with no build process or dependencies.

## Running the Game

Simply open `index.html` in a web browser. No build step or server required.

## Architecture

### File Structure
- `index.html` - Main HTML structure with game UI and canvas
- `game.js` - All game logic, rendering, and input handling
- `style.css` - Modern styling with gradients and flexbox layout

### Game Loop Architecture

The game uses a simple interval-based game loop (`setInterval`) that calls `update()` at speeds determined by difficulty level (60ms-150ms). The update function:
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

The `draw()` function renders to a dynamically sized canvas with a 20px grid:
- **Dynamic Canvas Sizing**: Canvas size changes based on difficulty
  - Easy: 400x400px (20x20 tiles)
  - Medium: 500x500px (25x25 tiles)
  - Hard: 600x600px (30x30 tiles)
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
- Three difficulty levels with dynamic canvas sizing:
  - Easy: 20x20 tiles, 150ms speed
  - Medium: 25x25 tiles, 100ms speed
  - Hard: 30x30 tiles, 60ms speed
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
  - Dark: Dark purple gradient background (#1a0b2e to #2d1b4e) with dark UI
  - Light: Blue/pink gradient background with light gray canvas
  - Theme preference saved in localStorage
- **Control Mode Toggle**: Switch between PC, Mobile, and Tablet modes
  - PC Mode: Keyboard controls with instruction panel
  - Mobile Mode: Touch D-pad controls below game, optimized mobile layout
  - Tablet Mode: Touch D-pad controls to the right of game
  - Control mode preference saved in localStorage
- **Erase High Score**: Red button with confirmation dialog
- Settings modal can be closed via × button or clicking outside

**Mobile Mode Features:**
- Large touch-friendly D-pad controls (70x70px buttons) positioned below game
- Hides keyboard instructions panel
- Optimized canvas sizing for mobile viewport (35vh max-height)
- Reduced padding and margins for compact layout
- Touch and click event support for buttons
- Visual feedback on button press
- Vertical layout (D-pad below canvas)
- Prevents top/bottom overflow with proper spacing

**Tablet Mode Features:**
- Same touch-friendly D-pad controls as mobile
- D-pad positioned to the right of the game canvas
- Horizontal layout (D-pad beside canvas)
- Canvas max size: 60vw width, 70vh height
- Better suited for landscape orientation

**LocalStorage Persistence:**
- High score (`snakeHighScore`)
- Theme preference (`snakeTheme`)
- Control mode preference (`snakeControlMode`)

### Responsive Design

**Page Scroll Prevention:**
- HTML and body have `overflow: hidden` to prevent page scrolling
- Body is `position: fixed` to lock viewport in place
- Arrow keys won't trigger page scroll during gameplay

**Canvas Sizing:**
- Canvas size is dynamic based on difficulty (400px/500px/600px)
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
- All changes maintain the GRID_SIZE ratio (20px per tile)

### Version
Current version: **v1.0**
- Displayed in top-right corner of the UI
- Update this in both `index.html` and this documentation when releasing new versions
