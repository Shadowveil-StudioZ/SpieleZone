

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Box, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import styles from './NeonDodge3D.module.css'

// Colors for the cubes
const COLORS = ['#ff4d4d', '#4dff88', '#4da6ff', '#ffcc4d', '#9d4dff'];

// --- The Basketball ---
// const PlayerBall = ({ positionX }) => {
//   return (
//     <mesh position={[positionX, -4, 0]} castShadow>
//       <sphereGeometry args={[0.5, 32, 32]} />
//       <meshStandardMaterial
//         color="#ff8c00"
//         emissive="#ff4500" 
//         emissiveIntensity={2}
//         roughness={0.8}
//         metalness={0.1}
//         wireframe={true}
//       />
//       <meshStandardMaterial color="black" wireframe />
//     </mesh>
//   );
// };

// the top one i made, and it is not working so taking help of ai to make it look liek basketball or at least a ball with colour instead of black wires rolled together
const PlayerBall = ({ positionX }) => {
  return (
    <group position={[positionX, -4, 0]}>
      {/* 1. The Glowing Orange Core */}
      <mesh castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial
          color="#ff3500"
          emissive="#ff4500"
          emissiveIntensity={1.5}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* 2. The Black Wireframe Cage (The 3D Ribs) 
          We make it 1% larger so it sits outside the glow 
      */}
      <mesh>
        <sphereGeometry args={[0.505, 32, 32]} />
        <meshBasicMaterial 
          color="black" 
          wireframe={true} 
          transparent={true}
          opacity={0.8}
        />
      </mesh>
    </group>
  );
};

// --- Single Falling Cube ---
// --------------------------------
// it looks cool ngl
const FallingCube = ({ x, y, size, color }) => (
  <Box args={[size, size, size]} position={[x, y, 0]} castShadow>
    <meshStandardMaterial color={color} emissive={color} 
      emissiveIntensity={0.5} />
  </Box>
);


const NeonDodge3D = () => {
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

      // 1. Smooth Interpolation I have copied this part from different game from this web and then i changed little things, so inconsistancies may be spotted.
      currentX.current = THREE.MathUtils.lerp(currentX.current, targetX.current, 0.1);
      setBallX(currentX.current);

      // 2. Spawn Logic -- among hthe logics here, this have to be easiesr
      if (Math.random() < 0.03) {
        cubesRef.current.push({
          id: Math.random(),
          x: (Math.random() - 0.5) * 10,
          y: 10,
          size: 0.5 + Math.random(),
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        });
      }

      // 3. Update Cubes & Collision - hit boxes arent perfect 
      cubesRef.current = cubesRef.current.map(c => ({ ...c, y: c.y - speedRef.current }));

      cubesRef.current.forEach(cube => {
        // Simple 3D Distance Collision.. . but not so simple
        const dx = cube.x - currentX.current;
        const dy = cube.y - (-4);
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


    <div style={{ width: '100vw', height: '90vh', background: 'radial-gradient(circle at center, #0a192f 0%, #020617 100%)' }} onTouchMove={handleTouchMove}>
      <div style={{ position: 'absolute', top: 70, left: 20, color: '#b686ed', fontSize: '2rem', zIndex: 8, 'text-shadow': '0 0 15px #b686ed, 0 0 30px rgba(182, 134, 237, 0.4)' }}>
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
        <ambientLight intensity={1} />
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
          <h1 style={{ color: '#b686ed', 'text-shadow': '0 0 15px #60048b, 0 0 30px #50017a' }}>Game Over</h1>
          <button onClick={() => window.location.reload()}
            onMouseEnter={(e) => {
              e.target.style.background = '#b686ed';
              e.target.style.color = '#111';
              e.target.style.boxShadow = '0 0 25px #b686ed';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
              e.target.style.color = '#b686ed';
              e.target.style.boxShadow = 'none';
            }}
            style={{
              background: 'transparent',
              color: '#b686ed',
              border: '2px solid #b686ed',
              padding: '10px 30px',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '4px',
              transition: '0.3s',
              outline: 'none',
              marginTop: '10px'
            }}
          >Restart</button>
        </div>
      )}
    </div>
  );
};
export default NeonDodge3D;