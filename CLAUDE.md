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

The `draw()` function renders to a 500x500 canvas with a 20px grid (25x25 tiles):
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

**Game Mechanics:**
- Score: 1 point per food collected
- Three difficulty levels: Easy (150ms), Medium (100ms), Hard (60ms)
- Toggleable wall collision mode (game over vs. wrap-around)
- Pause/resume functionality (Space key or button)
- Both WASD and Arrow key controls

**Visual Features:**
- Modern gradient design with smooth shadows
- Distinguishable snake head with yellow glow and directional eyes
- Pulsing food animation
- Responsive layout with instructions panel beside game canvas

**Settings System:**
- Gear icon button in top-right corner opens modal
- **Theme Toggle**: Switch between Dark mode (default) and Light mode
  - Dark: Purple gradient background with dark canvas
  - Light: Blue/pink gradient background with light gray canvas
  - Theme preference saved in localStorage
- **Erase High Score**: Red button with confirmation dialog
- Settings modal can be closed via × button or clicking outside

**LocalStorage Persistence:**
- High score (`snakeHighScore`)
- Theme preference (`snakeTheme`)

### Canvas Size Constraint

Canvas is fixed at 500x500px with `object-fit: contain` to maintain square aspect ratio when scaled. The body has `overflow: hidden` to prevent arrow keys from scrolling the page. If changing canvas dimensions, maintain the GRID_SIZE ratio (currently 20px).
