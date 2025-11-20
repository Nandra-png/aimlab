import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Laser.jsx - Temporary visual laser beam effect
 * Renders a line from start to end position, fading out over 0.1 seconds
 * 
 * Math:
 * - Line is drawn using THREE.Line with two points (start, end)
 * - Opacity fades from 1.0 to 0.0 over 0.1 seconds
 * - Component auto-removes after fade completes
 */
export default function Laser({ start, end, onComplete }) {
  const lineRef = useRef()
  const materialRef = useRef()
  const startTime = useRef(Date.now())
  const duration = 100 // 0.1 seconds in milliseconds

  // Create geometry with start and end points (memoized)
  // Handles both Vector3 objects and plain objects with x, y, z properties
  const geometry = useMemo(() => {
    // Ensure we have Vector3 objects
    const startVec = start instanceof THREE.Vector3 
      ? start.clone() 
      : new THREE.Vector3(start.x, start.y, start.z)
    const endVec = end instanceof THREE.Vector3 
      ? end.clone() 
      : new THREE.Vector3(end.x, end.y, end.z)
    
    const points = [startVec, endVec]
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [start, end])

  // Fade out animation
  useFrame(() => {
    if (!materialRef.current) return

    const elapsed = Date.now() - startTime.current
    const progress = elapsed / duration

    if (progress >= 1.0) {
      // Fade complete, remove laser
      if (onComplete) {
        onComplete()
      }
      return
    }

    // Fade opacity from 1.0 to 0.0
    const opacity = 1.0 - progress
    materialRef.current.opacity = opacity
  })

  // Cleanup geometry on unmount
  useEffect(() => {
    return () => {
      if (geometry) {
        geometry.dispose()
      }
    }
  }, [geometry])

  return (
    <line ref={lineRef} geometry={geometry}>
      <lineBasicMaterial
        ref={materialRef}
        color="#00ffff"
        transparent
        opacity={1.0}
        linewidth={2}
      />
    </line>
  )
}

