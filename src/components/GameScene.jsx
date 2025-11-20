import { useThree } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'

/**
 * GameScene.jsx - Sci-Fi Grid Room Environment
 * Full enclosed room with tile textures and dramatic lighting
 */
export default function GameScene() {
  const { scene } = useThree()

  // Set scene background color
  useEffect(() => {
    scene.background = new THREE.Color('#333333')
  }, [scene])

  // Create tile texture pattern programmatically
  const tileTexture = useMemo(() => {
    // Create a canvas to draw the tile pattern
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')

    // Base color (very light grey)
    ctx.fillStyle = '#E0E0E0'
    ctx.fillRect(0, 0, 256, 256)

    // Draw grid lines (darker grey for tile borders)
    ctx.strokeStyle = '#C0C0C0'
    ctx.lineWidth = 2

    const tileSize = 32 // 8x8 tiles on 256x256 canvas
    for (let i = 0; i <= 8; i++) {
      // Vertical lines
      ctx.beginPath()
      ctx.moveTo(i * tileSize, 0)
      ctx.lineTo(i * tileSize, 256)
      ctx.stroke()

      // Horizontal lines
      ctx.beginPath()
      ctx.moveTo(0, i * tileSize)
      ctx.lineTo(256, i * tileSize)
      ctx.stroke()
    }

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(10, 10) // Repeat pattern across surface

    return texture
  }, [])

  // Room dimensions: 20x10x20 (Width x Height x Depth)
  const roomWidth = 20
  const roomHeight = 10
  const roomDepth = 20

  return (
    <>
      {/* Subtle ambient light to prevent pure black areas */}
      <ambientLight intensity={0.2} color="#AAAAAA" />

      {/* Dramatic main light - SpotLight at top-right corner */}
      <spotLight
        position={[roomWidth / 2 - 1, roomHeight - 1, roomDepth / 2 - 1]}
        angle={Math.PI / 4}
        penumbra={0.3}
        intensity={3}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-near={0.1}
        shadow-bias={-0.0001}
        color="#FFFFFF"
      />

      {/* Floor - Tiled plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        name="floor"
      >
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial
          map={tileTexture}
          color="#E0E0E0"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Back Wall - Tiled plane */}
      <mesh
        position={[0, roomHeight / 2, -roomDepth / 2]}
        receiveShadow
        name="back-wall"
      >
        <planeGeometry args={[roomWidth, roomHeight]} />
        <meshStandardMaterial
          map={tileTexture}
          color="#E0E0E0"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Left Wall - Tiled plane */}
      <mesh
        rotation={[0, Math.PI / 2, 0]}
        position={[-roomWidth / 2, roomHeight / 2, 0]}
        receiveShadow
        name="left-wall"
      >
        <planeGeometry args={[roomDepth, roomHeight]} />
        <meshStandardMaterial
          map={tileTexture}
          color="#E0E0E0"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Right Wall - Tiled plane */}
      <mesh
        rotation={[0, -Math.PI / 2, 0]}
        position={[roomWidth / 2, roomHeight / 2, 0]}
        receiveShadow
        name="right-wall"
      >
        <planeGeometry args={[roomDepth, roomHeight]} />
        <meshStandardMaterial
          map={tileTexture}
          color="#E0E0E0"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>

      {/* Ceiling - Tiled plane */}
      <mesh
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, roomHeight, 0]}
        receiveShadow
        name="ceiling"
      >
        <planeGeometry args={[roomWidth, roomDepth]} />
        <meshStandardMaterial
          map={tileTexture}
          color="#E0E0E0"
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
    </>
  )
}

