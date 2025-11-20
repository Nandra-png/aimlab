import { useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Recoil constants
const RECOIL_KICK = 0.1 // Amount to move back on Z-axis
const RECOIL_ROTATION = 0.15 // Amount to rotate up on X-axis (in radians)
const LERP_FACTOR = 0.15 // Interpolation speed (0-1, lower = smoother but slower)

/**
 * Weapon.jsx - Gun model and recoil system
 * Uses linear interpolation (lerp) for smooth recoil animation
 * 
 * Recoil Math:
 * - When clicked: weapon.position.z += RECOIL_KICK, weapon.rotation.x += RECOIL_ROTATION
 * - Each frame: lerp current position/rotation back to original (0, 0, 0)
 * - Lerp formula: current = current + (target - current) * LERP_FACTOR
 */
const Weapon = forwardRef(function Weapon({ onFire }, ref) {
    const meshRef = useRef()
    const barrelTipRef = useRef() // Ref for barrel tip position (where bullet exits)
    const [isRecoiling, setIsRecoiling] = useState(false)
    const [muzzleFlash, setMuzzleFlash] = useState(false)

    // Original position and rotation (relative to camera)
    const originalPosition = new THREE.Vector3(0.3, -0.3, -0.5)
    const originalRotation = new THREE.Euler(0, 0, 0)

    // Current recoil state
    const recoilPosition = useRef(new THREE.Vector3(0.3, -0.3, -0.5))
    const recoilRotation = useRef(new THREE.Euler(0, 0, 0))

    // Handle weapon fire (recoil + muzzle flash)
    // This method is exposed via useImperativeHandle so Player can call it
    const handleFire = useCallback(() => {
        if (!meshRef.current) return

        // Apply recoil: kick back and rotate up
        recoilPosition.current.z = originalPosition.z - RECOIL_KICK
        recoilRotation.current.x = originalRotation.x + RECOIL_ROTATION
        setIsRecoiling(true)

        // Trigger muzzle flash
        setMuzzleFlash(true)
        setTimeout(() => {
            setMuzzleFlash(false)
        }, 50) // Flash for 50ms

        // Notify parent component (Player) to handle shooting/raycasting
        if (onFire) {
            onFire()
        }
    }, [onFire])

    // Expose fire method and barrel tip world position to parent component via ref
    useImperativeHandle(ref, () => ({
        fire: handleFire,
        getBarrelTipWorldPosition: () => {
            // Get the world position of the barrel tip
            // This accounts for weapon position, rotation, and recoil
            if (!barrelTipRef.current) return null
            const worldPos = new THREE.Vector3()
            barrelTipRef.current.getWorldPosition(worldPos)
            return worldPos
        }
    }))

    // Smooth recoil animation using lerp
    useFrame(() => {
        if (!meshRef.current) return

        // Linear interpolation back to original position
        // Lerp formula: value = value + (target - value) * factor
        recoilPosition.current.lerp(originalPosition, LERP_FACTOR)
        recoilRotation.current.x = THREE.MathUtils.lerp(
            recoilRotation.current.x,
            originalRotation.x,
            LERP_FACTOR
        )
        recoilRotation.current.y = THREE.MathUtils.lerp(
            recoilRotation.current.y,
            originalRotation.y,
            LERP_FACTOR
        )
        recoilRotation.current.z = THREE.MathUtils.lerp(
            recoilRotation.current.z,
            originalRotation.z,
            LERP_FACTOR
        )

        meshRef.current.position.copy(recoilPosition.current)
        meshRef.current.rotation.copy(recoilRotation.current)
        const positionDiff = recoilPosition.current.distanceTo(originalPosition)
        const rotationDiff = Math.abs(recoilRotation.current.x - originalRotation.x)
        if (positionDiff < 0.001 && rotationDiff < 0.001) {
            setIsRecoiling(false)
        }
    })

    return (
        <>
            {/* Main Weapon Group - handles recoil animation */}
            <group
                ref={meshRef}
                position={[0.3, -0.3, -0.5]}
            >
                {/* Main Body - Dark Gunmetal */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[0.12, 0.08, 0.25]} />
                    <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
                </mesh>

                {/* Grip - Angled block at back/bottom, Darker Grey */}
                <mesh position={[-0.02, -0.06, -0.08]} rotation={[0, 0, 0.15]}>
                    <boxGeometry args={[0.08, 0.12, 0.15]} />
                    <meshStandardMaterial color="#111" metalness={0.6} roughness={0.3} />
                </mesh>

                {/* Barrel - Cylinder extending forward, Silver/Metallic */}
                <mesh position={[0, 0, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.03, 0.03, 0.2, 16]} />
                    <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
                </mesh>

                {/* Barrel End Cap - Small detail */}
                <mesh position={[0, 0, 0.28]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.035, 0.03, 0.02, 16]} />
                    <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.1} />
                </mesh>

                {/* Energy Core - Glowing strip on top, Neon Cyan */}
                <mesh position={[0, 0.05, 0.05]}>
                    <boxGeometry args={[0.1, 0.02, 0.15]} />
                    <meshStandardMaterial
                        color="#00f0ff"
                        emissive="#00f0ff"
                        emissiveIntensity={0.5}
                        metalness={0.3}
                        roughness={0.2}
                    />
                </mesh>

                {/* Side Details - Small accent pieces */}
                <mesh position={[0.06, 0, 0.05]}>
                    <boxGeometry args={[0.01, 0.06, 0.12]} />
                    <meshStandardMaterial color="#555" metalness={0.7} roughness={0.2} />
                </mesh>
                <mesh position={[-0.06, 0, 0.05]}>
                    <boxGeometry args={[0.01, 0.06, 0.12]} />
                    <meshStandardMaterial color="#555" metalness={0.7} roughness={0.2} />
                </mesh>

                {/* Trigger Guard - Small detail */}
                <mesh position={[-0.01, -0.04, 0.02]}>
                    <boxGeometry args={[0.04, 0.02, 0.08]} />
                    <meshStandardMaterial color="#222" metalness={0.5} roughness={0.3} />
                </mesh>

                {/* Barrel tip reference point - positioned at the end of the barrel */}
                {/* Barrel extends to z = 0.18 + 0.1 (half cylinder length) = 0.28 */}
                <group ref={barrelTipRef} position={[0, 0, 0.28]}>
                    {/* Empty group - just used for position tracking */}
                </group>

                {/* Muzzle flash - PointLight at weapon tip */}
                {muzzleFlash && (
                    <pointLight
                        position={[0, 0, 0.28]}
                        color="#ffffff"
                        intensity={2}
                        distance={5}
                    />
                )}
            </group>
        </>
    )
})

export default Weapon

