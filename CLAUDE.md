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
- `moveQueue` stores at most ONE pending move
- All direction changes are validated against the **current** direction (`dx`, `dy`), NOT against queued moves
- If queue already contains a move, subsequent key presses are ignored until the queue is processed
- This ensures one turn per grid square, matching classic Snake behavior

Example flow:
1. Snake moving RIGHT (dx=1, dy=0)
2. Player presses UP → Valid, queued as {dx:0, dy:-1}
3. Player presses LEFT before next update → Validated against CURRENT direction (RIGHT), so it's valid, but ignored because queue is full
4. Next `update()` → Processes UP from queue, snake turns up, queue clears
5. Now LEFT can be queued for next move

### Canvas Rendering

The `draw()` function renders to a 500x500 canvas with a 20px grid (25x25 tiles):
- Grid background with subtle lines
- Snake segments with gradient effects and shadows (head is brightest)
- Food with pulsing animation using `Date.now()` for timing
- All shapes use rounded corners for modern appearance

### State Management

Game state is managed through module-level variables:
- `snake` - Array of {x, y} positions (head at index 0)
- `dx, dy` - Current movement direction
- `moveQueue` - Single queued direction change
- `food` - Current food position
- `score, highScore` - Score tracking (high score persists in localStorage)
- `isPaused, isGameOver` - Game state flags

### Canvas Size Constraint

Canvas is fixed at 500x500px to fit within viewport without causing page scroll. The body has `overflow: hidden` to prevent arrow keys from scrolling the page. If changing canvas dimensions, maintain the GRID_SIZE ratio (currently 20px).
