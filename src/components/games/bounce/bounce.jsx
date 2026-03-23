import React, { useEffect, useRef, useState, useCallback } from "react";
import levels from "./lvl.json";
import styles from "./bounce.module.css";

const BounceGame = () => {
    const canvasRef = useRef(null);
    const ballRef = useRef(null);
    const animationRef = useRef(null);
    const [currentLevel, setCurrentLevel] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [paused, setPaused] = useState(false);
    const [canJump, setCanJump] = useState(false);
    const [rating, setRating] = useState(0);
    const [rated, setRated] = useState(false);
    const [levelData, setLevelData] = useState(() => JSON.parse(JSON.stringify(levels[0])));

    useEffect(() => {
            const jsonLd = {
                "@context": "https://schema.org",
                "@type": "Game",
                "name": "2048",
                "applicationCategory": "Arcade game",
                "operatingSystem": "All",
                "url": "https://www.spielezone.xyz/bounce",
                "author": { "@type": "Organization", "name": "Shadowveil StudioZ" },
                "description": "Play Bounce online at Spiele Zone.",
                "image": "https://spiele-zone.vercel.app/images/bounce.png"
            };
    
            const script = document.createElement('script');
            script.type = 'application/ld+json';
            script.text = JSON.stringify(jsonLd);
            document.head.appendChild(script);
            return () => { document.head.removeChild(script); };
        }, []);

    useEffect(() => {
        const newLevel = JSON.parse(JSON.stringify(levels[currentLevel]));
        setLevelData(newLevel);
        ballRef.current = {
            x: newLevel.ballStart[0],
            y: newLevel.ballStart[1],
            radius: 20,
            velocityX: 2.5,
            velocityY: 0,
            gravity: 0.3,
        };
    }, [currentLevel]);

    const checkCollisions = useCallback((ball) => {
        levelData.platforms.forEach(({ x, y, width, height }) => {
            if (
                ball.y + ball.radius > y &&
                ball.y < y + height &&
                ball.x + ball.radius > x &&
                ball.x - ball.radius < x + width
            ) {
                ball.velocityY = -9;
                ball.y = y - ball.radius;
                setCanJump(true);
            }
        });
        levelData.obstacles.forEach(({ x, y }) => {
            if (
                ball.x + ball.radius > x &&
                ball.x - ball.radius < x + 50 &&
                ball.y + ball.radius > y &&
                ball.y - ball.radius < y + 50
            ) {
                setGameOver(true);
                cancelAnimationFrame(animationRef.current);
            }
        });
        if (ball.x >= levelData.goal[0]) {
            setCurrentLevel((prev) => (prev + 1 < levels.length ? prev + 1 : 0));
        }
    }, [levelData]);

    const drawLevel = useCallback((ctx, ball, level) => {
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText(`Level: ${currentLevel + 1}`, 20, 30);
        ctx.fillText(`Score: ${score}`, 500, 30);
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fill();
        level.platforms.forEach(({ x, y, width, height }) => {
            ctx.fillStyle = "brown";
            ctx.fillRect(x, y, width, height);
        });
        level.obstacles.forEach(({ x, y }) => {
            ctx.fillStyle = "gray";
            ctx.fillRect(x, y, 50, 50);
        });
        ctx.fillStyle = "green";
        ctx.fillRect(level.goal[0], level.goal[1], 30, 30);
    }, [currentLevel, score]);

    const updateScore = useCallback(() => {
        setScore((prev) => prev + 1);
    }, []);

    useEffect(() => {
        if (paused || gameOver) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        const update = () => {
            const ball = ballRef.current;
            if (!ball) return;
            ball.velocityY += ball.gravity;
            ball.y += ball.velocityY;
            if (ball.y + ball.radius >= canvas.height) {
                ball.y = canvas.height - ball.radius;
                ball.velocityY = 0;
                setCanJump(true);
            }
            levelData.obstacles.forEach((obs) => (obs.x -= ball.velocityX));
            levelData.platforms.forEach((plat) => (plat.x -= ball.velocityX));
            levelData.goal[0] -= ball.velocityX;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawLevel(ctx, ball, levelData);
            checkCollisions(ball);
            updateScore();
            animationRef.current = requestAnimationFrame(update);
        };
        animationRef.current = requestAnimationFrame(update);
        return () => cancelAnimationFrame(animationRef.current);
    }, [levelData, paused, gameOver, drawLevel, checkCollisions, updateScore]);

    useEffect(() => {
        const handleJump = () => {
            const ball = ballRef.current;
            if (canJump) {
                ball.velocityY = -11;
                setCanJump(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === "ArrowUp") handleJump();
        };
        const handleTouch = () => {
            handleJump();
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("touchstart", handleTouch);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("touchstart", handleTouch);
        };
    }, [canJump]);

    const restartLevel = () => {
        setGameOver(false);
        setScore(0);
        setCurrentLevel(0);
        setCanJump(false);
        setRated(false);
        setRating(0);
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }
    };

    const handleStarClick = (selectedRating) => {
        setRating(selectedRating);
        setRated(true);
    };

    const renderRating = () => {
        if (rated) return <p>Thank you for rating!</p>;
        return (
            <div className={styles["emoji-rating"]}>
                {[1, 2, 3, 4, 5].map((num, i) => (
                    <span
                        key={i}
                        className={`${styles.emoji} ${rating >= num ? styles.selected : ""}`}
                        onClick={() => handleStarClick(num)}
                        style={{ fontSize: '24px' }}
                    >
                        {['👎', '😕', '😐', '😃', '😆'][i]}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className={styles["b-game-container"]}>
            <canvas className={styles["b-canvas"]} ref={canvasRef} width={600} height={400} />
            <div className={styles["b-game-controls"]}>
                <button onClick={() => setPaused(!paused)} disabled={gameOver}>
                    {paused ? "Resume" : "Pause"}
                </button>
                <button onClick={restartLevel}>Restart</button>
            </div>
            {gameOver && (
                <div className="game-over-overlay">
                    <p>Game Over!</p>
                    <button onClick={restartLevel}>Reset Game</button>
                    {renderRating()}
                </div>
            )}
        </div>
    );
};

export default BounceGame;