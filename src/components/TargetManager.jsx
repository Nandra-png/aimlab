import { useState, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import Target from './Target'

/**
 * TargetManager.jsx - Manages target spawning and state
 * Handles target positions, spawning, and hit detection
 */
const TargetManager = forwardRef(function TargetManager({ gameMode = 'normal', onTargetTimeout }, ref) {
  const [targets, setTargets] = useState([])

  // Minimum distance between targets to prevent overlap
  const MIN_DISTANCE = 2.5

  // Generate random position for new target with collision avoidance
  // Room is 20x10x20, back wall is at z = -10
  // Camera is at [0, 1.5, 0]
  // Z position is fixed (not random) and further away from camera
  const generateRandomPosition = useCallback((existingTargets = []) => {
    const MAX_ATTEMPTS = 20 // Prevent infinite loops
    let attempts = 0
    let position = null
    let isValid = false

    while (!isValid && attempts < MAX_ATTEMPTS) {
      // Generate candidate position
      const candidate = [
        Math.random() * 6 - 3,  // X: -3 to 3 (spread across room width)
        Math.random() * 3 + 1.5,  // Y: 1.5 to 4.5 (spread vertically)
        8                       // Z: Fixed at 8 (further away from camera)
      ]

      // Check distance to all existing targets
      let tooClose = false
      for (const target of existingTargets) {
        const dx = candidate[0] - target.position[0]
        const dy = candidate[1] - target.position[1]
        const dz = candidate[2] - target.position[2]
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (distance < MIN_DISTANCE) {
          tooClose = true
          break
        }
      }

      if (!tooClose) {
        position = candidate
        isValid = true
      }

      attempts++
    }

    // If we couldn't find a valid position after max attempts, use the last generated position
    // This prevents infinite loops when the screen is too crowded
    if (!isValid) {
      position = [
        Math.random() * 6 - 3,
        Math.random() * 3 + 1.5,
        8
      ]
    }

    return position
  }, [])

  // Spawn a new target with collision avoidance
  const spawnTarget = useCallback(() => {
    setTargets(prev => {
      const newTarget = {
        id: Date.now() + Math.random(),
        position: generateRandomPosition(prev)
      }
      return [...prev, newTarget]
    })
  }, [generateRandomPosition])

  // Handle target hit - called by Player when raycast hits a target
  const handleTargetHit = useCallback((targetId) => {
    setTargets(prev => {
      const targetExists = prev.some(target => target.id === targetId)
      if (!targetExists) return prev // Target already removed

      // Remove hit target
      const remaining = prev.filter(target => target.id !== targetId)

      // Spawn new target immediately with collision avoidance
      const newTarget = {
        id: Date.now() + Math.random(),
        position: generateRandomPosition(remaining)
      }

      return [...remaining, newTarget]
    })
  }, [generateRandomPosition, gameMode])

  // Handle target timeout - called by Target when pulse animation completes
  const handleTargetTimeout = useCallback((targetId) => {
    setTargets(prev => {
      const targetExists = prev.some(target => target.id === targetId)
      if (!targetExists) return prev // Target already removed

      // Remove timed-out target
      const remaining = prev.filter(target => target.id !== targetId)

      // Spawn new target immediately (no score increment)
      const newTarget = {
        id: Date.now() + Math.random(),
        position: generateRandomPosition(remaining)
      }

      return [...remaining, newTarget]
    })
  }, [generateRandomPosition])

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    handleTargetHit,
    handleTargetTimeout
  }))

  // Spawn initial targets on mount and when game mode changes
  useEffect(() => {
    // Determine spawn count based on game mode
    const spawnCount = (gameMode === 'random_size' || gameMode === 'pulse') ? 5 : 3

    // For pulse mode, use staggered spawning (one by one with delay)
    if (gameMode === 'pulse') {
      setTargets([]) // Clear existing targets first

      // Spawn targets one by one with delay
      for (let i = 0; i < spawnCount; i++) {
        setTimeout(() => {
          setTargets(prev => {
            const newTarget = {
              id: Date.now() + Math.random() + i,
              position: generateRandomPosition(prev) // Pass existing targets for collision check
            }
            return [...prev, newTarget]
          })
        }, i * 500) // 500ms delay between each spawn
      }
    } else {
      // For other modes, spawn all at once
      const initialTargets = []
      for (let i = 0; i < spawnCount; i++) {
        const newTarget = {
          id: Date.now() + Math.random() + i,
          position: generateRandomPosition(initialTargets) // Pass existing targets for collision check
        }
        initialTargets.push(newTarget)
      }
      setTargets(initialTargets)
    }
  }, [generateRandomPosition, gameMode])

  return (
    <>
      {targets.map(target => (
        <Target
          key={target.id}
          id={target.id}
          position={target.position}
          gameMode={gameMode}
          onTargetTimeout={onTargetTimeout}
        />
      ))}
    </>
  )
})

export default TargetManager

