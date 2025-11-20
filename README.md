# FPS Aim Trainer MVP

A browser-based FPS Aim Trainer built with React, Three.js, React Three Fiber, and TailwindCSS.

## Features

- **First-Person View**: Smooth camera controls with pointer lock
- **Weapon System**: Gun model with smooth recoil animation using linear interpolation
- **Minimalist Environment**: Dark grid-based training arena
- **Clean Architecture**: Modular component structure for maintainability

## Tech Stack

- React 18 + Vite
- Three.js
- @react-three/fiber (R3F)
- @react-three/drei
- TailwindCSS

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

## Project Structure

```
src/
├── App.jsx              # Entry point with Canvas setup
├── main.jsx             # React DOM root
├── index.css            # Global styles + TailwindCSS
└── components/
    ├── GameScene.jsx    # Environment (lighting, grid)
    ├── Player.jsx       # First-person controls
    ├── Weapon.jsx       # Gun model and recoil system
    └── UI.jsx           # Crosshair overlay
```

## Architecture Notes

- **Weapon as Camera Child**: The weapon is attached as a direct child of the camera to ensure perfect view tracking without lag or jitter
- **Recoil System**: Uses linear interpolation (lerp) for smooth animation
- **Clean Separation**: Game logic is separated from the main App component

## Controls

- **Mouse**: Look around (requires pointer lock)
- **Click**: Fire weapon (triggers recoil animation)

