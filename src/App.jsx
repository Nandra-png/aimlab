import { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import GameScene from './components/GameScene'
import Player from './components/Player'
import TargetManager from './components/TargetManager'
import UI from './components/UI'
import SettingsMenu from './components/SettingsMenu'
import GameMenu from './components/GameMenu'
import { playHitSound } from './utils/AudioSynth'

/**
 * App.jsx - Entry point with game state management
 * Lifts state up for score, target management, and settings
 */
function App() {
    const [score, setScore] = useState(0)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isGameMenuOpen, setIsGameMenuOpen] = useState(false)
    const [gameMode, setGameMode] = useState('normal')
    const [sensitivity, setSensitivity] = useState(1.0)
    const [crosshairColor, setCrosshairColor] = useState('#00FF00')
    const [crosshairSize, setCrosshairSize] = useState(4)
    const targetManagerRef = useRef()
    const ignoreNextUnlock = useRef(false) // Flag to prevent Settings Menu from opening during Game Menu interactions

    // Handle target hit - increment score and notify target manager
    const handleTargetHit = (targetId) => {
        setScore(prev => prev + 1)

        // Play hit sound effect (satisfying "Pop" sound)
        playHitSound()

        // Notify TargetManager to remove target and spawn new one
        if (targetManagerRef.current?.handleTargetHit) {
            targetManagerRef.current.handleTargetHit(targetId)
        }
    }

    // Handle target timeout (for PULSE mode) - respawn without scoring
    const handleTargetTimeout = (targetId) => {
        // DO NOT increment score - target disappeared before being shot
        // Just notify TargetManager to remove and respawn
        if (targetManagerRef.current?.handleTargetTimeout) {
            targetManagerRef.current.handleTargetTimeout(targetId)
        }
    }

    // ESC key handler: Toggle Settings Menu (open/close)
    // When ESC is pressed while pointer is locked, browser unlocks first, then we detect it
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only handle ESC if Game Menu is not open
            if (e.key === 'Escape' && !isGameMenuOpen) {
                e.preventDefault()

                if (isMenuOpen) {
                    // If menu is open, close it and request pointer lock
                    setIsMenuOpen(false)
                    ignoreNextUnlock.current = true
                    const canvas = document.querySelector('canvas')
                    if (canvas) {
                        canvas.requestPointerLock()
                    }
                } else {
                    // If menu is closed, open it immediately
                    // If pointer is locked, browser will unlock it automatically on ESC
                    // We'll handle the unlock in pointerlockchange listener
                    setIsMenuOpen(true)
                }
            }
        }

        // Handle pointer unlock from ESC press
        const handlePointerLockChange = () => {
            // Skip if this unlock was intentional (from Game Menu or other interactions)
            if (ignoreNextUnlock.current) {
                ignoreNextUnlock.current = false
                return
            }

            // If pointer was unlocked and menu is not open, open it (ESC was pressed)
            if (document.pointerLockElement === null && !isMenuOpen && !isGameMenuOpen) {
                setIsMenuOpen(true)
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        document.addEventListener('pointerlockchange', handlePointerLockChange)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.removeEventListener('pointerlockchange', handlePointerLockChange)
        }
    }, [isMenuOpen, isGameMenuOpen])

    // Handle pointer unlock when menu opens (manual unlock from menu button)
    // Note: ESC key handler above already handles unlock, but keep this for other ways to open menu
    useEffect(() => {
        if (isMenuOpen) {
            // Unlock pointer when menu opens (if it's still locked)
            if (document.pointerLockElement) {
                document.exitPointerLock()
            }
        }
    }, [isMenuOpen])

    // Handle resume - lock pointer and close menu
    const handleResume = () => {
        // Remove focus from any active input elements to hide text caret
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
        }

        // Request pointer lock (user needs to interact)
        const canvas = document.querySelector('canvas')
        if (canvas) {
            canvas.requestPointerLock()
        }
    }

    // Handle menu close - remove focus from inputs
    const handleMenuClose = () => {
        // Remove focus from any active input elements to hide text caret
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
        }
        setIsMenuOpen(false)
    }

    // Handle game menu close
    const handleGameMenuClose = () => {
        if (document.activeElement && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
        }
        setIsGameMenuOpen(false)
    }

    // Handle Tab key for game menu
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Only handle Tab if settings menu is not open
            if (e.key === 'Tab' && !isMenuOpen) {
                e.preventDefault()
                setIsGameMenuOpen(prev => {
                    const willOpen = !prev

                    // Set flag to ignore next unlock event
                    ignoreNextUnlock.current = true

                    // Unlock/lock pointer based on menu state
                    if (willOpen) {
                        if (document.pointerLockElement) {
                            document.exitPointerLock()
                        }
                    } else {
                        // Close menu and resume
                        const canvas = document.querySelector('canvas')
                        if (canvas) {
                            canvas.requestPointerLock()
                        }
                    }

                    return willOpen
                })
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isMenuOpen])

    // Handle pointer unlock when game menu opens
    useEffect(() => {
        if (isGameMenuOpen) {
            // Set flag to ignore next unlock event
            ignoreNextUnlock.current = true
            if (document.pointerLockElement) {
                document.exitPointerLock()
            }
        }
    }, [isGameMenuOpen])

    return (
        <div className="relative h-screen w-full bg-zinc-900 overflow-hidden select-none">
            {/* Canvas - positioned at the back layer */}
            <Canvas
                shadows
                gl={{ antialias: true }}
                camera={{ fov: 75, position: [0, 1.5, 0] }}
                className="absolute inset-0 z-0"
                style={{ background: '#222' }}
            >
                <GameScene />
                <Player
                    onTargetHit={handleTargetHit}
                    sensitivity={sensitivity}
                    isMenuOpen={isMenuOpen}
                />
                <TargetManager
                    ref={targetManagerRef}
                    gameMode={gameMode}
                    onTargetTimeout={handleTargetTimeout}
                />
            </Canvas>

            {/* UI Overlay - transparent layer on top */}
            <UI
                score={score}
                crosshairColor={crosshairColor}
                crosshairSize={crosshairSize}
            />

            {/* Settings Menu - highest z-index */}
            <SettingsMenu
                isOpen={isMenuOpen}
                onClose={handleMenuClose}
                sensitivity={sensitivity}
                setSensitivity={setSensitivity}
                crosshairColor={crosshairColor}
                setCrosshairColor={setCrosshairColor}
                crosshairSize={crosshairSize}
                setCrosshairSize={setCrosshairSize}
                onResume={handleResume}
            />

            {/* Game Menu - highest z-index */}
            <GameMenu
                isOpen={isGameMenuOpen}
                onClose={() => {
                    // Set flag to ignore next unlock event
                    ignoreNextUnlock.current = true
                    handleGameMenuClose()
                }}
                gameMode={gameMode}
                setGameMode={(mode) => {
                    // Set flag to ignore next unlock event before mode change
                    ignoreNextUnlock.current = true
                    setGameMode(mode)
                }}
                onResume={() => {
                    // Set flag to ignore next unlock event
                    ignoreNextUnlock.current = true
                    handleResume()
                }}
            />
        </div>
    )
}

export default App

