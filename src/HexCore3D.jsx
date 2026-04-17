// HexCore3D.jsx — Three.js 0.155 compatible
import { useRef, useMemo, Suspense, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

/* ── Hex vertex helper ─────────────────────────────────── */
function hexRing(r) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6
    return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r)
  })
}

/* ── One outer shell segment ───────────────────────────── */
function HexSegment({ index, sp, idleRot }) {
  const ref = useRef()
  const angle = (Math.PI / 3) * index

  const geo = useMemo(() => {
    const shape = new THREE.Shape()
    const r = 1.58, inner = 1.08
    const aS = (Math.PI / 3) * index - Math.PI / 3
    const aE = aS + Math.PI / 3
    shape.moveTo(Math.cos(aS) * inner, Math.sin(aS) * inner)
    shape.lineTo(Math.cos(aS) * r, Math.sin(aS) * r)
    shape.absarc(0, 0, r, aS, aE, false)
    shape.lineTo(Math.cos(aE) * inner, Math.sin(aE) * inner)
    shape.absarc(0, 0, inner, aE, aS, true)
    shape.closePath()
    return new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false })
  }, [index])

  useFrame(() => {
    if (!ref.current) return
    const t = sp.current
    const raw = Math.max(0, (t - 0.3) / 0.7)
    const ease = 1 - Math.pow(1 - raw, 3)
    ref.current.position.set(
      Math.cos(angle) * ease * 1.15,
      ease * (index % 2 === 0 ? 0.22 : -0.22),
      Math.sin(angle) * ease * 1.15
    )
    ref.current.rotation.y = idleRot.current + ease * (index % 2 === 0 ? 0.45 : -0.45)
    if (ref.current.material) {
      ref.current.material.opacity = Math.max(0, 1 - ease * 1.6)
    }
  })

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]}>
      <primitive object={geo} attach="geometry" />
      <meshStandardMaterial
        color="#00c8d4"
        emissive="#00F2FF"
        emissiveIntensity={0.5}
        metalness={0.92}
        roughness={0.08}
        transparent
        opacity={1}
      />
    </mesh>
  )
}

/* ── Inner glowing core ────────────────────────────────── */
function InnerCore({ sp }) {
  const coreRef = useRef()
  const ringRef = useRef()

  useFrame(({ clock }) => {
    const t = sp.current
    const raw = Math.max(0, (t - 0.5) / 0.5)
    const ease = 1 - Math.pow(1 - raw, 2)

    if (coreRef.current) {
      coreRef.current.scale.setScalar(ease * 0.62)
      coreRef.current.material.emissiveIntensity = ease * 3.5
      coreRef.current.rotation.y = clock.getElapsedTime() * 1.3
      coreRef.current.rotation.x = clock.getElapsedTime() * 0.4
    }
    if (ringRef.current) {
      ringRef.current.scale.setScalar(ease * 0.88)
      ringRef.current.material.opacity = ease * 0.7
      ringRef.current.rotation.x = clock.getElapsedTime() * 0.65
      ringRef.current.rotation.z = clock.getElapsedTime() * 0.4
    }
  })

  return (
    <group>
      <mesh ref={coreRef} scale={0}>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial
          color="#00F2FF"
          emissive="#00F2FF"
          emissiveIntensity={0}
          metalness={1}
          roughness={0}
        />
      </mesh>
      <mesh ref={ringRef} scale={0}>
        <torusGeometry args={[0.72, 0.013, 8, 64]} />
        <meshStandardMaterial
          color="#8A2BE2"
          emissive="#8A2BE2"
          emissiveIntensity={2.5}
          transparent
          opacity={0}
        />
      </mesh>
    </group>
  )
}

/* ── Orbiting data nodes ───────────────────────────────── */
function DataNodes({ sp }) {
  const refs = useRef(Array.from({ length: 6 }, () => null))

  useFrame(({ clock }) => {
    const t = sp.current
    const raw = Math.max(0, (t - 0.55) / 0.45)
    const ease = 1 - Math.pow(1 - raw, 3)
    refs.current.forEach((mesh, i) => {
      if (!mesh) return
      const orbit = clock.getElapsedTime() * 0.38 + (Math.PI / 3) * i
      mesh.position.set(
        Math.cos(orbit) * 0.92 * ease,
        Math.sin(orbit * 0.3) * 0.16 * ease,
        Math.sin(orbit) * 0.92 * ease
      )
      mesh.scale.setScalar(ease * 0.072)
      mesh.material.emissiveIntensity = ease * 4.5
    })
  })

  return (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} ref={el => (refs.current[i] = el)} scale={0}>
          <sphereGeometry args={[1, 6, 6]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#00F2FF' : '#8A2BE2'}
            emissive={i % 2 === 0 ? '#00F2FF' : '#8A2BE2'}
            emissiveIntensity={0}
          />
        </mesh>
      ))}
    </>
  )
}

/* ── Outer wireframe hex ring ──────────────────────────── */
function OuterRing({ sp, idleRot }) {
  const ref = useRef()
  const geo = useMemo(() => {
    const pts = [...hexRing(2.1), hexRing(2.1)[0]]
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.y = idleRot.current * 0.28
    ref.current.material.opacity = Math.max(0.06, 0.48 - sp.current * 0.4)
  })

  return (
    <line ref={ref} geometry={geo}>
      <lineBasicMaterial color="#00F2FF" transparent opacity={0.35} />
    </line>
  )
}

/* ── Second decorative ring ────────────────────────────── */
function OuterRing2({ sp, idleRot }) {
  const ref = useRef()
  const geo = useMemo(() => {
    const pts = [...hexRing(1.85), hexRing(1.85)[0]]
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [])

  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.y = -idleRot.current * 0.18
    ref.current.material.opacity = Math.max(0, 0.25 - sp.current * 0.3)
  })

  return (
    <line ref={ref} geometry={geo}>
      <lineBasicMaterial color="#8A2BE2" transparent opacity={0.2} />
    </line>
  )
}

/* ── Particle field ────────────────────────────────────── */
function Particles() {
  const ref = useRef()
  const count = 280

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 10
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return arr
  }, [])

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.017
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#00F2FF" size={0.015} transparent opacity={0.32} sizeAttenuation />
    </points>
  )
}

/* ── Main scene group ──────────────────────────────────── */
function HexScene({ sp, scrollVel }) {
  const groupRef = useRef()
  const idleRot = useRef(0)
  const { camera } = useThree()

  useEffect(() => {
    // Camera starts below-center → object appears in upper half of screen
    camera.position.set(0, -0.8, 7.5)
    camera.lookAt(0, 0.4, 0)
  }, [camera])

  useFrame((_, delta) => {
    const t  = sp.current
    // Normalize delta to 60 fps so lerp feels identical at any frame rate
    const dt = Math.min(delta, 0.05) * 60   // cap at 50ms to avoid huge jumps

    // ── Camera target positions ─────────────────────────
    const targetZ = t < 0.5
      ? 7.5 - (t / 0.5) * 3.2          // zoom in:  7.5 → 4.3
      : 4.3 + ((t - 0.5) / 0.5) * 4.7  // pull back: 4.3 → 9.0
    const targetY = -0.8 + t * 1.2

    // Frame-rate-independent smooth lerp (alpha ≈ 0.08 at 60 fps)
    const camA = 1 - Math.pow(0.92, dt)
    camera.position.z += (targetZ - camera.position.z) * camA
    camera.position.y += (targetY - camera.position.y) * camA
    camera.lookAt(0, 0.4, 0)

    // ── Rotation — velocity already smoothed by Lenis ──
    // Frame-rate-independent: same radians-per-second regardless of fps
    idleRot.current += scrollVel.current * dt
    // Smooth coast-to-stop (alpha ≈ 0.95 per frame at 60 fps → very silky)
    scrollVel.current *= Math.pow(0.95, dt)

    if (!groupRef.current) return
    groupRef.current.rotation.x = t * 0.12
    groupRef.current.rotation.y = idleRot.current
  })

  return (
    <group ref={groupRef} scale={1.5}>
      <OuterRing sp={sp} idleRot={idleRot} />
      <OuterRing2 sp={sp} idleRot={idleRot} />
      {Array.from({ length: 6 }, (_, i) => (
        <HexSegment key={i} index={i} sp={sp} idleRot={idleRot} />
      ))}
      <InnerCore sp={sp} />
      <DataNodes sp={sp} />
      <Particles />
    </group>
  )
}

/* ── Canvas ────────────────────────────────────────────── */
export default function HexCore3D({ scrollProgress, scrollVelocity }) {
  return (
    <Canvas
      camera={{ position: [0, -0.8, 7.5], fov: 52 }}
      gl={{
        antialias: true,
        alpha: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.25,
      }}
      style={{ background: 'transparent' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.04} />
        <pointLight position={[4, 4, 4]} color="#00F2FF" intensity={6} />
        <pointLight position={[-4, -3, -4]} color="#8A2BE2" intensity={4} />
        <pointLight position={[0, 6, 2]} color="#ffffff" intensity={0.6} />
        <pointLight position={[0, -5, 0]} color="#00F2FF" intensity={1.5} />

        <HexScene sp={scrollProgress} scrollVel={scrollVelocity} />

        <Environment preset="night" />

        <EffectComposer>
          <Bloom
            intensity={2.4}
            luminanceThreshold={0.08}
            luminanceSmoothing={0.9}
            mipmapBlur
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  )
}
