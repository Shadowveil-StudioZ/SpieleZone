import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './SnakeGame.module.css';
import { Helmet } from 'react-helmet';
const GRID_SIZE = 20;

const SnakeGame = () => {

    // SEO 
    useEffect(() => {
        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "Game",
            "name": "Snake",
            "applicationCategory": "Arcade game",
            "operatingSystem": "All",
            "url": "https://www.spielezone.xyz/Snake",
            "author": { "@type": "Organization", "name": "Shadowveil StudioZ" },
            "description": "Play Snake online at Spiele Zone. Swipe, feed the snake and watch it grow. Can you beat your own highscore?",
            "image": "https://spiele-zone.vercel.app/images/snake.png"
        };

        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(jsonLd);
        document.head.appendChild(script);
        return () => { document.head.removeChild(script); };
    }, []);


    const generateFood = () => ({
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
    });

    const [snake, setSnake] = useState([
        { x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2), direction: { x: 0, y: 0 } },
    ]);
    const [food, setFood] = useState(generateFood());
    const [direction, setDirection] = useState({ x: 0, y: 0 });
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [rating, setRating] = useState(0);
    const [rated, setRated] = useState(false);
    const eatSoundRef = useRef(null);
    const touchStartRef = useRef({ x: 0, y: 0 });
    const [isStarted, setIsStarted] = useState(false);

    const moveSnake = useCallback(() => {
        if (gameOver || !isStarted) return;
        if (gameOver) return;

        const newSnake = [...snake];
        const head = { ...newSnake[0] };
        head.x += direction.x;
        head.y += direction.y;
        head.direction = direction;

        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            setGameOver(true);
            return;
        }

        for (let i = 1; i < newSnake.length; i++) {
            if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
                setGameOver(true);
                return;
            }
        }

        if (head.x === food.x && head.y === food.y) {
            newSnake.unshift(head);
            setFood(generateFood());
            setScore(prevScore => prevScore + 10);
            eatSoundRef.current?.play().catch(err => console.error("Failed to play sound:", err));
        } else {
            newSnake.pop();
            newSnake.unshift(head);
        }

        setSnake(newSnake);
    }, [direction, food, gameOver, snake, isStarted]);

    useEffect(() => {
        const interval = setInterval(moveSnake, 200);
        return () => clearInterval(interval);
    }, [moveSnake]);

    const handleKeyPress = useCallback((e) => {
        const dirMap = {
            ArrowUp: { x: 0, y: -1 },
            ArrowDown: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 },
            ArrowRight: { x: 1, y: 0 },
            w: { x: 0, y: -1 },
            s: { x: 0, y: 1 },
            a: { x: -1, y: 0 },
            d: { x: 1, y: 0 },
            W: { x: 0, y: -1 },
            S: { x: 0, y: 1 },
            A: { x: -1, y: 0 },
            D: { x: 1, y: 0 }
        };

        const newDir = dirMap[e.key];
        if (!newDir) return;

        if ((newDir.x !== 0 && direction.x === 0) || (newDir.y !== 0 && direction.y === 0)) {
            setDirection(newDir);
        }

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
            e.preventDefault();
        }
    }, [direction]);

    const handleTouchStart = useCallback((e) => {
        touchStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
        };
    }, []);

    const handleTouchEnd = useCallback((e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const deltaX = touchEndX - touchStartRef.current.x;
        const deltaY = touchEndY - touchStartRef.current.y;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 50 && direction.x === 0) {
                setDirection({ x: 1, y: 0 });
            } else if (deltaX < -50 && direction.x === 0) {
                setDirection({ x: -1, y: 0 });
            }
        } else {
            if (deltaY > 50 && direction.y === 0) {
                setDirection({ x: 0, y: 1 });
            } else if (deltaY < -50 && direction.y === 0) {
                setDirection({ x: 0, y: -1 });
            }
        }
    }, [direction]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyPress, { passive: false });
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchend', handleTouchEnd);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [handleKeyPress, handleTouchStart, handleTouchEnd]);

    useEffect(() => {
        const prevTitle = document.title;
        const prevDesc = document.querySelector("meta[name='description']")?.getAttribute('content');

        document.title = 'Snake Game - Spiele Zone by Shadowveil StudioZ';
        let descTag = document.querySelector("meta[name='description']");
        if (!descTag) {
            descTag = document.createElement('meta');
            descTag.name = 'description';
            document.head.appendChild(descTag);
        }
        descTag.setAttribute('content', 'Play the classic Snake game online for free at Spiele Zone by Shadowveil StudioZ!');

        let keywords = document.querySelector("meta[name='keywords']");
        if (!keywords) {
            keywords = document.createElement('meta');
            keywords.name = 'keywords';
            document.head.appendChild(keywords);
        }
        keywords.setAttribute('content', 'Snake Game, Nostlagic Snake Game, Snake Game by Shadowveil StudioZ, Spiele zone snake');

        let canonical = document.querySelector("link[rel='canonical']");
        if (!canonical) {
            canonical = document.createElement('link');
            canonical.rel = 'canonical';
            document.head.appendChild(canonical);
        }
        canonical.setAttribute('href', 'https://www.spielezone.xyz/snake');

        return () => {
            document.title = prevTitle;
            if (descTag && prevDesc) descTag.setAttribute('content', prevDesc);
            if (canonical) canonical.setAttribute('href', 'https://www.spielezone.xyz/');
        };
    }, []);

    const handleStarClick = (selectedRating) => {
        setRating(selectedRating);
        setRated(true);
    };

    const handleReset = () => {
        setSnake([{ x: Math.floor(GRID_SIZE / 2), y: Math.floor(GRID_SIZE / 2), direction: { x: 0, y: 0 } }]);
        setFood(generateFood());
        setDirection({ x: 0, y: 0 });
        setScore(0);
        setGameOver(false);
        setRating(0);
        setRated(false);
    };

    const renderRating = () => {
        if (rated) return <p>Thank you for rating!</p>;

        return (
            <div className={styles['emoji-rating']}>
                {[1, 2, 3, 4, 5].map((num, i) => (
                    <span
                        key={i}
                        className={`${styles.emoji} ${rating >= num ? styles.selected : ''}`}
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
        <>
            <Helmet>
                <title>Play Snake Online - Shadowveil StudioZ</title>
                <meta name="description" content="Enjoy the classic Snake game online. Feed the snake and watch it grow by Shadowveil StudioZ!" />
                <meta name="keywords" content="Snake Game, online Snake, arcade game, puzzle game, spiele zone, snake, shadowveil studioz" />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content="Snake - Play Online | Spiele Zone" />
                <meta property="og:description" content="Guess the hidden word in this free browser Hangman game. Play now at Spiele Zone!" />
                <meta property="og:image" content="https://spiele-zone.vercel.app/images/snake.png" />
                <meta property="og:url" content="https://www.spielezone.xyz/Snake" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Hangman - Play Online | Spiele Zone" />
                <meta name="twitter:description" content="Guess the word before you run out of lives. Play Hangman free online." />
                <meta name="twitter:image" content="https://spiele-zone.vercel.app/images/snake.png" />
                <link rel="canonical" href="https://www.spielezone.xyz/Snake" />
            </Helmet>
            <div className={styles['game-name']} style={{ textAlign: 'center' }}>
                <h1>Snake Game</h1>
            </div>
            <h1 style={{ textAlign: 'center' }}>Can you beat your own <strong>high score?</strong></h1>
            <div className={styles['snake-game-container']}>
                <div className={styles['sp-l']}>
                    <p><strong>Snake Game</strong> is a video game which was released near 1970s in arcades. When it became pre-loaded on Nokia in 1998, Snake found a good fanbase.</p>
                    <p>Player creates a long thin creature chasing pixels of 'food' while avoiding walls and its own tail. It wasn't just a game; it was a shared memory.</p>
                    <div>Can you beat your own <strong>high score?</strong></div>
                </div>

                <div>
                    <audio ref={eatSoundRef}>
                        <source src="/audios/gulp.mp3" type="audio/mpeg" />
                    </audio>

                    {!isStarted && !gameOver && (
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <button onClick={() => setIsStarted(true)} className={styles.snakereset}>
                                Start Game
                            </button>
                        </div>
                    )}

                    {isStarted && (
                        <div className={styles['snake-game']}>
                            {Array.from({ length: GRID_SIZE }, (_, rowIndex) => (
                                <div key={rowIndex} className={styles['s-row']}>
                                    {Array.from({ length: GRID_SIZE }, (_, colIndex) => {
                                        const isSnake = snake.some(s => s.x === colIndex && s.y === rowIndex);
                                        const isHead = snake[0].x === colIndex && snake[0].y === rowIndex;
                                        const isFood = food.x === colIndex && food.y === rowIndex;
                                        let className = styles.cell;

                                        if (isSnake) {
                                            className += ' ' + (isHead
                                                ? `${styles['snake-head']} ${styles[snake[0].direction.x === 1 ? 'right' : snake[0].direction.x === -1 ? 'left' : snake[0].direction.y === 1 ? 'down' : 'up']}`
                                                : styles['snake-body']);
                                        } else if (isFood) {
                                            className += ' ' + styles.food;
                                        }

                                        return <div key={colIndex} className={className}></div>;
                                    })}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className={styles['game-info']}>
                        <p>Score: {score}</p>
                        {gameOver && (
                            <div className={styles['snake-game-over-overlay']}>
                                <p>Game Over!</p>
                                <button onClick={handleReset} className={styles.snakereset}>Reset Game</button>
                                {renderRating()}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles['sp-r']}>
                    <h3>Snake Game Controls</h3>
                    <h4>For Mobile Phones</h4>
                    <ul>
                        <li>You can <strong>Swipe</strong> the snake to move it in the respective direction.</li>
                    </ul>
                    <h4>For windows</h4>
                    <ol>
                        <li>You can use Arrow keys to move the snake in the respective directions.</li>
                        <li>Alternative keys</li>
                        <ul>
                            <li><strong>W</strong> to move UP</li>
                            <li><strong>A</strong> to move Left</li>
                            <li><strong>S</strong> to move Down</li>
                            <li><strong>D</strong> to move Right</li>
                        </ul>
                    </ol>
                </div>
            </div>
        </>
    );
};

export default SnakeGame;
