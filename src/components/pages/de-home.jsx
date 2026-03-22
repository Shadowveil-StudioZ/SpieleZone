import { Link } from 'react-router-dom';
import styles from "./home-de.module.css";

const HomeDE = () => {
    const games = [
        { name: "2048", path: "/tzfe", class: "t2048" },
        { name: "Snake", path: "/Snake", class: "tsnake" },
        { name: "Hangman", path: "/HangMan", class: "thangman" },
        { name: "Ghost Code", path: "/ghost-code", class: "tgc" },
        { name: "Memory Puzzle", path: "/memory", class: "tmemory" },
        { name: "Bounce", path: "/bounce", class: "tbounce" },
        { name: "Node Dodge", path: "/nodedodge3d", class: "tnodedodge" }
    ];
    const repeatedGames = Array(6).fill(games).flat();
    return (
        <div className={styles.container}>

            {/* TOP */}
            <div className={styles.top}>
                <h1>Spiele Zone</h1>
                <p>Browser-Spiele für schnelle, einfache Unterhaltung.</p>
            </div>

            {/* GRID */}
            <ul className={styles.grid}>
                {repeatedGames.map((game, i) => (
                    <li key={i}>
                        <Link to={game.path}>
                            <div className={`${styles.tile} ${styles[game.class]}`}>
                                <div className={styles.title}>{game.name}</div>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>

            {/* BOTTOM */}
            <div className={styles.bottom}>
                <p>
                    Spiele Zone bietet interaktive Browser-Spiele mit Fokus auf einfache Mechaniken
                    und schnelle Spielerlebnisse.
                </p>
            </div>

        </div>
    );
};

export default HomeDE;