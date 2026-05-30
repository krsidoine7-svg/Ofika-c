'use client'

/**
 * OFIKA - Hero 3D "The Monolith"
 * Une approche architecturale, symétrique et ultra-premium.
 * Focalisé sur la fusion du physique et du digital.
 */

import { useRef, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
    PerspectiveCamera,
    Environment,
    Html,
    ContactShadows,
    RoundedBox,
    Text,
    Float,
    Lightformer,
    Torus
} from '@react-three/drei'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import * as THREE from 'three'
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import PhoneProfileScreen from './PhoneProfileScreen'
import { Loader2, Zap } from 'lucide-react'

// Register GSAP
if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger, useGSAP)
}

// --- 💎 Glass Card Component ---
function LuxuryCard({ position, rotation, isMain = false, index }: { position: [number, number, number], rotation: [number, number, number], isMain?: boolean, index: number }) {
    const cardRef = useRef<THREE.Group>(null)

    // Animation idle (micro-mouvements)
    useFrame((state) => {
        if (!cardRef.current) return
        const t = state.clock.elapsedTime
        if (isMain) {
            // La carte principale a une respiration lente avant le scroll
            cardRef.current.position.y = position[1] + Math.sin(t * 0.4) * 0.05
        } else {
            cardRef.current.position.y = position[1] + Math.sin(t * 0.6 + index) * 0.1
            cardRef.current.rotation.z = rotation[2] + Math.cos(t * 0.3 + index) * 0.05
        }
    })

    return (
        <group ref={cardRef} position={position} rotation={rotation} name={isMain ? "main-card" : `alt-card-${index}`}>
            <Float speed={isMain ? 1 : 2} rotationIntensity={0.2} floatIntensity={0.3}>
                <RoundedBox args={[3.2, 4.8, 0.1]} radius={0.15} smoothness={4} castShadow>
                    <meshPhysicalMaterial
                        color={isMain ? "#ffffff" : "#222"}
                        metalness={isMain ? 0.2 : 0.8}
                        roughness={isMain ? 0.1 : 0.2}
                        reflectivity={1}
                        iridescence={isMain ? 0.4 : 0}
                        iridescenceIOR={1.5}
                        clearcoat={1}
                        clearcoatRoughness={0.05}
                        transmission={isMain ? 0 : 0.9} // Les autres cartes sont en verre fumé
                        thickness={2}
                    />
                </RoundedBox>

                {/* Card Graphics */}
                <group position={[0, 0, 0.06]}>
                    <Text position={[0, 1.4, 0]} fontSize={0.6} color={isMain ? "#ff6b35" : "#555"} font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFufMZhrib2Bg-4.woff">OFIKA</Text>
                    <mesh position={[0, -1.2, 0]}>
                        <boxGeometry args={[2, 0.02, 0.01]} />
                        <meshBasicMaterial color={isMain ? "#ff6b35" : "#333"} opacity={0.5} transparent />
                    </mesh>
                    <Text position={[0, -1.5, 0]} fontSize={0.1} color={isMain ? "#666" : "#444"} letterSpacing={0.5}>PREMIUM IDENTITY</Text>

                    {/* NFC Chip */}
                    <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
                        <rectAreaLight width={0.5} height={0.5} intensity={isMain ? 2 : 0} color="#ff6b35" />
                        <torusGeometry args={[0.3, 0.02, 16, 4]} />
                        <meshStandardMaterial color={isMain ? "#FFD700" : "#222"} metalness={1} roughness={0} />
                    </mesh>
                </group>
            </Float>
        </group>
    )
}

// --- 📱 Ultimate Smartphone Mockup ---
function HighEndPhone({ position }: { position: [number, number, number] }) {
    return (
        <group position={position} name="main-phone">
            {/* Phone Body */}
            <RoundedBox args={[3, 6.2, 0.35]} radius={0.5} smoothness={8} castShadow>
                <meshPhysicalMaterial color="#050505" metalness={0.9} roughness={0.1} reflectivity={1} />
            </RoundedBox>

            {/* Screen Area */}
            <mesh position={[0, 0, 0.18]}>
                <planeGeometry args={[2.75, 5.95]} />
                <meshBasicMaterial color="#000" />
            </mesh>

            {/* Screen UI Content */}
            <Html
                transform
                occlude="blending"
                position={[0, 0, 0.19]}
                scale={0.285}
                style={{ width: '375px', height: '780px', borderRadius: '48px', overflow: 'hidden', opacity: 0 }}
                className="phone-ui-container"
            >
                <PhoneProfileScreen />
            </Html>

            {/* Dynamic Notch */}
            <mesh position={[0, 2.7, 0.2]}>
                <capsuleGeometry args={[0.08, 0.6, 8, 16]} />
                <meshBasicMaterial color="#000" />
            </mesh>

            {/* NFC Halo Effect */}
            <group position={[0, 0, -0.3]} name="nfc-ring" scale={[0.1, 0.1, 0.1]}>
                <Torus args={[2.5, 0.05, 16, 100]}>
                    <meshBasicMaterial color="#ff6b35" transparent opacity={0} />
                </Torus>
            </group>
        </group>
    )
}

// --- 🎬 Scene Logic ---
function Scene({ scrollRef }: { scrollRef: React.RefObject<HTMLDivElement> }) {
    const { scene, camera, viewport } = useThree()
    const isMobile = viewport.width < 5

    useGSAP(() => {
        if (!scrollRef.current) return

        const mainCard = scene.getObjectByName('main-card')
        const phone = scene.getObjectByName('main-phone')
        const altCards = [scene.getObjectByName('alt-card-1'), scene.getObjectByName('alt-card-2')]
        const nfcRing = scene.getObjectByName('nfc-ring')
        const nfcRingMaterial = (nfcRing?.children[0] as THREE.Mesh)?.material

        if (!mainCard || !phone) return

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: scrollRef.current,
                start: "top top",
                end: "+=500%",
                scrub: 1.2,
                pin: true,
                anticipatePin: 1
            }
        })

        // SÉQUENCE STORYTELLING

        // 1. Zoom Camera et Disparition du texte
        tl.to('.hero-content', { opacity: 0, scale: 0.8, filter: 'blur(20px)', duration: 2 }, 0)
            .to(camera.position, { z: 10, duration: 4, ease: "slow(0.7, 0.7, false)" }, 0)

        // 2. Les cartes secondaires s'écartent et disparaissent
        altCards.forEach((card, i) => {
            if (card) {
                tl.to(card.position, {
                    x: i === 0 ? -15 : 15,
                    y: i === 0 ? 5 : -5,
                    z: -5,
                    opacity: 0,
                    duration: 3
                }, 1)
            }
        })

        // 3. Rotation 360 Agressive de la carte principale
        tl.to(mainCard.rotation, {
            y: Math.PI * 2,
            x: Math.PI * 0.1,
            z: Math.PI * 0.05,
            duration: 4,
            ease: "expo.inOut"
        }, 1.5)
            .to(mainCard.position, { x: 0, y: 0.5, z: 5, duration: 4 }, 1.5)

        // 4. L'Apparition du Téléphone (Emerge du noir)
        tl.fromTo(phone.position, { y: -12, z: 0 }, { y: 0, z: 2, duration: 3, ease: "back.out(1.2)" }, 4)
            .fromTo(phone.rotation, { x: -0.5 }, { x: 0, duration: 3 }, 4)

        // 5. La Fusion : La carte passe DERRIÈRE le téléphone (Z negative)
        // On veut 50% visible sur le côté
        tl.to(mainCard.position, {
            x: 1.8,
            y: 0.2,
            z: 1.8, // Juste derrière la vitre (phone.z est 2, phone.depth est 0.35, donc z=1.8 est dérrière le milieu)
            duration: 2.5,
            ease: "power3.inOut"
        }, 6)
            .to(mainCard.rotation, { y: Math.PI * 1.9, x: 0, z: 0, duration: 2.5 }, 6)
            .to(mainCard.scale, { x: 0.8, y: 0.8, z: 0.8, duration: 2.5 }, 6)

        // 6. Activation NFC (Effet de Ring)
        if (nfcRing && nfcRingMaterial) {
            tl.to(nfcRing.scale, { x: 1, y: 1, z: 1, duration: 1.5 }, 8)
                .to(nfcRingMaterial, { opacity: 0.8, duration: 0.5 }, 8)
                .to(nfcRing.scale, { x: 5, y: 5, z: 5, duration: 2 }, 8.5)
                .to(nfcRingMaterial, { opacity: 0, duration: 1 }, 9)
        }

        // 7. Reveal du Profil Interne
        tl.to('.phone-ui-container', { opacity: 1, duration: 1 }, 9.5)
            .to(phone.position, { x: -1.5, z: 5, duration: 3, ease: "expo.out" }, 10) // Le téléphone se décale pour montrer le profil
            .to(phone.rotation, { y: 0.3, duration: 3 }, 10)
            .to(camera.position, { z: 8, duration: 3 }, 10)

    }, { scope: scrollRef })

    return (
        <>
            <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={isMobile ? 70 : 38} />

            {/* Studio Lighting */}
            <Environment resolution={512}>
                <group rotation={[0, 0, 1]}>
                    <Lightformer form="rect" intensity={5} position={[10, 5, -10]} scale={[20, 1, 1]} />
                    <Lightformer form="rect" intensity={2} position={[-10, -5, -10]} scale={[20, 1, 1]} />
                    <Lightformer form="circle" intensity={2} position={[0, 10, -10]} scale={5} />
                </group>
            </Environment>

            <spotLight position={[20, 20, 10]} angle={0.12} penumbra={1} intensity={2} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={1} color="#ff6b35" />
            <ambientLight intensity={0.2} />

            {/* Cards Setup */}
            <LuxuryCard position={[0, 0, 0]} rotation={[0, 0, 0]} isMain index={0} />
            <LuxuryCard position={[-6, 2, -4]} rotation={[0.2, 0.4, -0.3]} index={1} />
            <LuxuryCard position={[6, -2, -6]} rotation={[-0.3, -0.5, 0.2]} index={2} />

            {/* Phone Setup */}
            <HighEndPhone position={[0, -15, 0]} />

            <ContactShadows opacity={0.6} scale={40} blur={2} far={10} color="#000000" />

            {/* Cinematic Effects */}
            <EffectComposer multisampling={4}>
                <Bloom luminanceThreshold={1.2} mipmapBlur intensity={0.6} radius={0.3} />
                <ChromaticAberration
                    offset={new THREE.Vector2(0.001, 0.001)}
                    radialModulation={false}
                    modulationOffset={0}
                />
                <Noise opacity={0.03} />
                <Vignette eskil={false} offset={0.05} darkness={1} />
            </EffectComposer>
        </>
    )
}

export default function CinematicHero3D() {
    const containerRef = useRef<HTMLDivElement>(null)

    return (
        <div ref={containerRef} className="relative w-full h-screen bg-[#020202] overflow-hidden">

            {/* Back Layer Typo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
                <h2 className="text-[30vw] font-black tracking-tighter text-white">OFIKA</h2>
            </div>

            {/* UI Overlay Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none hero-content px-6 text-center">
                <div className="mb-6 flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-[0_0_20px_rgba(255,107,53,0.1)]">
                    <Zap className="w-4 h-4 text-orange-500 fill-orange-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Next-Gen Networking</span>
                </div>

                <h1 className="text-7xl md:text-[10rem] font-black text-white tracking-tighter mb-4 leading-none">
                    OFI <span className="text-orange-500 italic">KA</span>.
                </h1>

                <p className="text-lg md:text-xl text-gray-400 font-medium max-w-xl mx-auto leading-relaxed">
                    The ultimate physical-to-digital bridge.
                    <br />
                    <span className="text-orange-500/60 font-mono text-xs uppercase tracking-[0.5em] mt-8 block animate-pulse">
                        Scroll to reveal the story
                    </span>
                </p>
            </div>

            {/* 3D Scene */}
            <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, alpha: false, stencil: false, depth: true }} className="w-full h-full">
                <Suspense fallback={null}>
                    <Scene scrollRef={containerRef} />
                </Suspense>
            </Canvas>

            {/* Technical Polish */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            <div className="absolute bottom-10 left-10 z-20 hidden md:flex items-center gap-4">
                <div className="w-1 h-12 bg-orange-500"></div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-white font-black uppercase tracking-widest">System Status</span>
                    <span className="text-[9px] text-gray-500 font-mono">Render Engine: WebGL 2.0 / Cinema 4D Look</span>
                </div>
            </div>
        </div>
    )
}
