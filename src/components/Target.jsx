import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'

/**
 * Target.jsx - Individual target sphere
 * A simple sphere that can be hit by the player
 * Supports different behaviors based on game mode
 */
export default function Target({ position, id, onHit, gameMode = 'normal', onTargetTimeout }) {
  const meshRef = useRef()
  const lifeRef = useRef(0) // Life cycle for PULSE mode (0 to PI)
  const hasTimedOut = useRef(false) // Prevent multiple timeout calls

  // Random speed for pulse animation (configurable - adjust these values to change speed)
  // Lower values = slower animation, Higher values = faster animation
  const pulseSpeed = useMemo(() => {
    if (gameMode === 'pulse') {
      // CONFIGURATION: Adjust these values to change pulse speed
      // Current: Random speed between 0.4 and 0.7 (slower)
      // To make it faster: increase the numbers (e.g., 0.8-1.2)
      // To make it slower: decrease the numbers (e.g., 0.2-0.5)
      const minSpeed = 0.3  // Minimum speed (lower = slower)
      const maxSpeed = 0.5  // Maximum speed (lower = slower)
      return Math.random() * (maxSpeed - minSpeed) + minSpeed
    }
    return 1.5 // Default speed (not used for pulse)
  }, [gameMode])

  // Random scale for random_size mode
  const randomScale = useMemo(() => {
    if (gameMode === 'random_size') {
      return Math.random() * 1.0 + 0.5 // Random scale between 0.5 and 1.5
    }
    return 1.0 // Normal scale
  }, [gameMode])

  // Random movement parameters for strafing mode
  const movementParams = useMemo(() => {
    if (gameMode === 'strafing') {
      return {
        speed: Math.random() * 0.5 + 0.5, // Random speed between 0.5 and 1.0
        offset: Math.random() * Math.PI * 2, // Random phase offset
        amplitude: Math.random() * 3 + 2 // Random amplitude between 2 and 5
      }
    }
    return null
  }, [gameMode])

  // Store initial X position for strafing
  const initialX = useMemo(() => position[0], [position])

  // Apply random scale on mount (for random_size mode)
  useEffect(() => {
    if (meshRef.current && gameMode === 'random_size') {
      meshRef.current.scale.set(randomScale, randomScale, randomScale)
    } else if (meshRef.current && gameMode === 'pulse') {
      // Start at scale 0 for pulse mode
      meshRef.current.scale.set(0, 0, 0)
      lifeRef.current = 0
      hasTimedOut.current = false
    } else if (meshRef.current) {
      // Normal scale for other modes
      meshRef.current.scale.set(1, 1, 1)
    }
  }, [randomScale, gameMode, pulseSpeed])

  // Strafing movement animation and PULSE animation
  useFrame((state, delta) => {
    if (!meshRef.current) return

    // Strafing movement
    if (gameMode === 'strafing' && movementParams) {
      // Smooth left-right movement using sine wave
      const newX = initialX + Math.sin(state.clock.elapsedTime * movementParams.speed + movementParams.offset) * movementParams.amplitude
      meshRef.current.position.x = newX
    }

    // PULSE animation: grow and shrink (slower animation)
    if (gameMode === 'pulse') {
      // Use random speed per target for variation (0.8 to 1.2)
      lifeRef.current += delta * pulseSpeed

      // Calculate scale using sine wave: 0 -> 1.5 -> 0
      const scale = Math.sin(lifeRef.current) * 1.5
      meshRef.current.scale.set(scale, scale, scale)

      // If cycle is complete (life > PI), trigger timeout
      if (lifeRef.current > Math.PI && !hasTimedOut.current) {
        hasTimedOut.current = true
        if (onTargetTimeout) {
          onTargetTimeout(id)
        }
      }
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={position}
      name="target-sphere"
      userData={{ isTarget: true, targetId: id }}
      onClick={onHit}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshStandardMaterial
        color="#00FFFF"
        roughness={0.3}
        metalness={0.2}
        emissive="#00FFFF"
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}

