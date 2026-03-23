

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Box, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import styles from './test.module.css'

// Colors for the cubes
const COLORS = ['#ff4d4d', '#4dff88', '#4da6ff', '#ffcc4d', '#9d4dff'];

// --- The Basketball ---
const PlayerBall = ({ positionX }) => {
    return (
        <mesh position={[positionX, -4, 0]} castShadow>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial
                color="#ff8c00"
                roughness={0.8}
                metalness={0.1}
            />
            <meshStandardMaterial color="black" wireframe />
        </mesh>
    );
};

// --- Single Falling Cube ---
// --------------------------------
// it looks cool ngl
const FallingCube = ({ x, y, size, color }) => (
    <Box args={[size, size, size]} position={[x, y, 0]} castShadow>
        <meshStandardMaterial color={color} />
    </Box>
);


const Test = () => {
    const [ballX, setBallX] = useState(0);
    const [cubes, setCubes] = useState([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    // Smooth Movement Refs
    const targetX = useRef(0);
    const currentX = useRef(0);
    const cubesRef = useRef([]);
    // do not change the values... i have tried multiple and these one feels the best

    const speedRef = useRef(0.1);

    // Handle Keyboard
    // -------------------
    // you can experiment with the values; but i guess 1.5 suits 
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') targetX.current -= 1.5;
            if (e.key === 'ArrowRight') targetX.current += 1.5;
            // Boundaries
            targetX.current = Math.max(-5, Math.min(5, targetX.current));
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Handle Swipe for Mobile as if it is playable on mobile
    const handleTouchMove = (e) => {
        const touch = e.touches[0];
        const x = (touch.clientX / window.innerWidth) * 10 - 5;
        targetX.current = x;
    };

    // The Main Game Loop (logic inside R3F)
    // hardest part, do not touch
    const SceneLogic = () => {
        useFrame((state, delta) => {
            if (gameOver) return;

            // 1. Smooth Interpolation for Ball Movement (Lerp)
            currentX.current = THREE.MathUtils.lerp(currentX.current, targetX.current, 0.1);
            setBallX(currentX.current);

            // 2. Spawn Logic
            if (Math.random() < 0.03) {
                cubesRef.current.push({
                    id: Math.random(),
                    x: (Math.random() - 0.5) * 10,
                    y: 10,
                    size: 0.5 + Math.random(),
                    color: COLORS[Math.floor(Math.random() * COLORS.length)]
                });
            }

            // 3. Update Cubes & Collision
            cubesRef.current = cubesRef.current.map(c => ({ ...c, y: c.y - speedRef.current }));

            cubesRef.current.forEach(cube => {
                // Simple 3D Distance Collision
                const dx = cube.x - currentX.current;
                const dy = cube.y - (-4); // Ball is at y: -4
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < (cube.size / 2 + 0.5)) {
                    setGameOver(true);
                }
            });

            // Cleanup & Score- !!! Important
            cubesRef.current = cubesRef.current.filter(c => {
                if (c.y < -6) {
                    setScore(s => s + 1);
                    speedRef.current += 0.0005; // Increase speed
                    return false;
                }
                return true;
            });
            setCubes([...cubesRef.current]);
        });

        return null;
    };

    return (


        <div style={{ width: '100vw', height: '90vh', background: '#111' }} onTouchMove={handleTouchMove}>
            <div style={{ position: 'absolute', top: 70, left: 20, color: 'black', fontSize: '2rem', zIndex: 8 }}>
                Score: {score}
            </div>

            <div className={styles.alertp}>
                <h2>Wait a second!</h2>
                <p>
                    This game is not optimized for mobile or tablet devices...
                    <br /><br />
                    The game does have swipe controls, but the layout and ratio wa the issue.
                    <br /><br />
                    <strong>Thank you for trying the game.</strong>
                    <br />
                    If you believe you got the expertise to make this page responsive, you may try doing so by forking this repository and finding <code>neondodge3d</code>
                </p>


                <button onClick={(e) => e.target.parentElement.style.display = 'none'} style={{ marginTop: '20px', padding: '10px' }}>
                    I'll try anyway
                </button>
            </div>

            <Canvas shadows>
                <PerspectiveCamera makeDefault position={[0, 0, 10]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} castShadow />
                <Environment preset="city" />

                <Suspense fallback={null}>
                    <PlayerBall positionX={ballX} />
                    {cubes.map(c => <FallingCube key={c.id} {...c} />)}
                </Suspense>

                <ContactShadows position={[0, -4.5, 0]} opacity={0.4} scale={20} blur={2} far={4.5} />
                <SceneLogic />
            </Canvas>

            {gameOver && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', color: 'white', textAlign: 'center' }}>
                    <h1 style={{color:'#b686ed', 'text-shadow':'0 0 15px #230232, 0 0 10px #290f38'}}>Game Over</h1>
                    <button onClick={() => window.location.reload()}>Restart</button>
                </div>
            )}
        </div>
    );
};
export default Test;