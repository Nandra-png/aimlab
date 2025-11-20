import { useRef, useState, useCallback, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import Weapon from './Weapon'
import Laser from './Laser'

/**
 * Player.jsx - First-person view controller with shooting mechanics
 * Manages camera position, pointer lock controls, and raycasting
 * CRITICAL: Weapon must be a direct child of Camera for perfect view tracking
 */
export default function Player({ onTargetHit, sensitivity = 1.0, isMenuOpen = false }) {
    const weaponRef = useRef()
    const canvasRef = useRef()
    const { camera, scene, gl } = useThree()
    const [lasers, setLasers] = useState([])
    const [isLocked, setIsLocked] = useState(false)

    // Euler angles for camera rotation (YXZ order for FPS-style rotation)
    const euler = useRef(new THREE.Euler(0, 0, 0, 'YXZ'))
    const PI_2 = Math.PI / 2

    // Valorant-style sensitivity multiplier (0.0022 approximates Source/Unreal/Valorant engines)
    const SENSITIVITY_MULTIPLIER = 0.0022

    // Raycasting Math:
    // 1. Normalized device coordinates (NDC): center of screen is (0, 0)
    // 2. Raycaster.setFromCamera(ndc, camera) creates a ray from camera through NDC point
    // 3. Raycaster.intersectObjects() finds what the ray hits
    // 4. If hit: use hit.point as end position, otherwise extend ray to max distance
    const handleShoot = useCallback(() => {
        if (!camera || !scene) return

        // Calculate laser start point: weapon offset in camera's local space, transformed to world space
        // Weapon offset [0.3, -0.3, -0.5] relative to camera's local space
        // Transform to world space using camera's world matrix
        const weaponOffsetLocal = new THREE.Vector3(0.3, -0.3, -0.5)
        const laserStart = new THREE.Vector3()
        laserStart.copy(weaponOffsetLocal)
        laserStart.applyMatrix4(camera.matrixWorld)

        // Create raycaster from center of screen (crosshair position)
        const raycaster = new THREE.Raycaster()
        const mouse = new THREE.Vector2(0, 0) // Center of screen in NDC coordinates

        // Set raycaster to shoot from camera center through crosshair
        raycaster.setFromCamera(mouse, camera)

        // Find intersections with all objects in scene
        // The 'true' parameter enables recursive checking of all children
        const intersects = raycaster.intersectObjects(scene.children, true)

        // Filter intersections: keep targets, skip environment
        const filteredIntersects = intersects.filter(intersect => {
            const obj = intersect.object

            // CRITICAL: Always keep targets (check userData first - this is the key identifier)
            if (obj.userData?.isTarget) {
                return true
            }

            // Skip environment geometry (floor, walls) by name
            if (obj.name === 'floor' || obj.name === 'back-wall') {
                return false
            }

            // Skip weapon geometry (weapon is a child of camera, so it shouldn't be in scene.children)
            // But just in case, skip any mesh that's clearly part of the weapon
            // For now, keep everything else (targets are already handled above)
            return true
        })

        // Check if we hit a target
        let hitTarget = null
        if (filteredIntersects.length > 0) {
            const firstHit = filteredIntersects[0]
            // Check if hit object is a target using userData
            if (firstHit.object.userData?.isTarget) {
                hitTarget = firstHit.object
                const targetId = firstHit.object.userData.targetId

                // Remove target from scene
                if (firstHit.object.parent) {
                    firstHit.object.parent.remove(firstHit.object)
                }

                // Notify parent (App.jsx) to handle target hit with target ID
                if (onTargetHit) {
                    onTargetHit(targetId)
                }

                console.log(`HIT TARGET ${targetId}`)
            }
        }

        // Calculate hit point: either intersection point or fallback point
        let laserEnd = new THREE.Vector3()
        let hitObject = null

        if (filteredIntersects.length > 0) {
            // Hit something - use intersection point
            laserEnd = filteredIntersects[0].point.clone()
            hitObject = filteredIntersects[0].object
            const objectName = hitObject.name || hitObject.type || 'Unknown'
            if (!hitTarget) {
                console.log(`HIT ${objectName}`)
            }
        } else {
            // Miss - extend ray to fallback distance (100 units)
            raycaster.ray.at(100, laserEnd)
            console.log('MISS')
        }

        // Create laser from weapon offset position to hit point
        const laserId = Date.now()
        setLasers(prev => [...prev, {
            id: laserId,
            start: laserStart,
            end: laserEnd
        }])

        // Remove laser after animation completes
        setTimeout(() => {
            setLasers(prev => prev.filter(laser => laser.id !== laserId))
        }, 100)
    }, [camera, scene, onTargetHit])

    // Custom FPS Camera: Manual rotation with Valorant-style sensitivity
    // This replaces PointerLockControls' automatic rotation
    useEffect(() => {
        if (!camera) return

        const handleMouseMove = (e) => {
            // Only process movement when pointer is locked and menu is closed
            if (!isLocked || isMenuOpen || !camera) return

            // Valorant-style sensitivity formula: rotation = movement * sensitivity * 0.0022
            // The 0.0022 multiplier approximates standard FPS engines (Source/Unreal/Valorant)
            const rotationX = e.movementY * sensitivity * SENSITIVITY_MULTIPLIER
            const rotationY = e.movementX * sensitivity * SENSITIVITY_MULTIPLIER

            // Update euler angles from current camera quaternion
            euler.current.setFromQuaternion(camera.quaternion)

            // Apply rotation (Y for horizontal, X for vertical)
            euler.current.y -= rotationY
            euler.current.x -= rotationX

            // Clamp vertical rotation to prevent camera flipping (-90 to 90 degrees)
            euler.current.x = Math.max(-PI_2, Math.min(PI_2, euler.current.x))

            // Apply updated rotation to camera
            camera.quaternion.setFromEuler(euler.current)
        }

        document.addEventListener('mousemove', handleMouseMove)
        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
        }
    }, [camera, sensitivity, isLocked, isMenuOpen, PI_2, SENSITIVITY_MULTIPLIER])

    // Handle pointer lock state changes
    useEffect(() => {
        const handlePointerLockChange = () => {
            setIsLocked(document.pointerLockElement === gl.domElement)
        }

        const handlePointerLockError = () => {
            console.warn('Pointer lock failed')
            setIsLocked(false)
        }

        document.addEventListener('pointerlockchange', handlePointerLockChange)
        document.addEventListener('pointerlockerror', handlePointerLockError)

        return () => {
            document.removeEventListener('pointerlockchange', handlePointerLockChange)
            document.removeEventListener('pointerlockerror', handlePointerLockError)
        }
    }, [gl.domElement])

    // Initialize camera rotation - set initial rotation to face forward (180 degrees)
    useEffect(() => {
        if (camera) {
            // Set initial rotation: 180 degrees on Y-axis to face the target wall
            euler.current.set(0, Math.PI, 0, 'YXZ')
            camera.quaternion.setFromEuler(euler.current)
        }
    }, [camera])

    // Global mousedown listener for shooting (works with Pointer Lock)
    useEffect(() => {
        const handleMouseDown = (e) => {
            // Don't fire if menu is open
            if (isMenuOpen) return

            // Only fire on left mouse button (button === 0)
            if (e.button !== 0) return

            // Only fire when pointer is locked (player is in game)
            if (isLocked) {
                // Trigger weapon recoil and muzzle flash
                if (weaponRef.current?.fire) {
                    weaponRef.current.fire()
                }
                // handleShoot will be called by Weapon's onFire callback
            }
        }

        // Listen on document level to catch events even when pointer is locked
        document.addEventListener('mousedown', handleMouseDown)

        return () => {
            document.removeEventListener('mousedown', handleMouseDown)
        }
    }, [isLocked, isMenuOpen])

    // Handle canvas click to request pointer lock (only when menu is closed)
    useEffect(() => {
        const canvas = gl.domElement
        canvasRef.current = canvas

        const handleCanvasClick = () => {
            // Don't lock if menu is open
            if (isMenuOpen) return

            // Request pointer lock if not already locked
            if (!isLocked && canvas) {
                canvas.requestPointerLock()
            }
        }

        canvas.addEventListener('click', handleCanvasClick)

        return () => {
            canvas.removeEventListener('click', handleCanvasClick)
        }
    }, [gl.domElement, isLocked, isMenuOpen])

    return (
        <>
            {/* 
                Custom FPS Camera Implementation:
                - We don't use PointerLockControls for rotation (it's disabled)
                - Pointer lock is handled manually via canvas.requestPointerLock()
                - Rotation is handled manually with Valorant-style sensitivity
            */}

            {/* 
        CRITICAL ARCHITECTURE: Weapon is a direct child of PerspectiveCamera
        This ensures the weapon follows the view perfectly without lag or jitter
        during rapid mouse movement. The weapon will be positioned relative to
        the camera's local space.
      */}
            <PerspectiveCamera makeDefault position={[0, 1.5, 0]} fov={75}>
                <Weapon ref={weaponRef} onFire={handleShoot} />
            </PerspectiveCamera>

            {/* Render active lasers */}
            {lasers.map(laser => (
                <Laser
                    key={laser.id}
                    start={laser.start}
                    end={laser.end}
                    onComplete={() => {
                        setLasers(prev => prev.filter(l => l.id !== laser.id))
                    }}
                />
            ))}
        </>
    )
}

