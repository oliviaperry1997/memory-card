import { useEffect, useState } from "react";

const MAX_POKEDEX = 649;
const NUM_CARDS = 12;

const typeColors = {
    normal: "#A8A77A",
    fire: "#EE8130",
    water: "#6390F0",
    electric: "#F7D02C",
    grass: "#7AC74C",
    ice: "#96D9D6",
    fighting: "#C22E28",
    poison: "#A33EA1",
    ground: "#E2BF65",
    flying: "#A98FF3",
    psychic: "#F95587",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#735797",
    dragon: "#6F35FC",
    dark: "#705746",
    steel: "#B7B7CE",
    fairy: "#D685AD",
};

function getRandomPokemonIds(count, max = MAX_POKEDEX) {
    const ids = new Set();
    while (ids.size < count) {
        ids.add(Math.floor(Math.random() * max) + 1);
    }
    return Array.from(ids);
}

function shuffleArray(arr) {
    return [...arr].sort(() => Math.random() - 0.5);
}

const MemoryGame = () => {
    const [pokemonCards, setPokemonCards] = useState([]);
    const [clickedIds, setClickedIds] = useState([]);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchRandomPokemon = async () => {
        setLoading(true);
        const randomIds = getRandomPokemonIds(NUM_CARDS);

        try {
            const promises = randomIds.map((id) =>
                fetch(`https://pokeapi.co/api/v2/pokemon/${id}`).then((res) =>
                    res.json()
                )
            );

            const results = await Promise.all(promises);
            const pokemonData = results.map((pokemon) => {
                const name =
                    pokemon.species.name.charAt(0).toUpperCase() +
                    pokemon.species.name.slice(1);
                const type1 = pokemon.types[0]?.type.name || "normal";
                const type2 =
                    pokemon.types[1] !== undefined &&
                    `${pokemon.types[1].type.name}`;
                return {
                    id: pokemon.id,
                    name,
                    image: pokemon.sprites.front_default,
                    type1,
                    type2,
                };
            });

            setPokemonCards(pokemonData);
        } catch (error) {
            console.error("Failed to fetch Pokémon:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRandomPokemon();
    }, []);

    const handleCardClick = (id) => {
        if (clickedIds.includes(id)) {
            // Incorrect click — reset game
            setClickedIds([]);
            setScore(0);
            fetchRandomPokemon();
        } else {
            // Correct click
            const newScore = score + 1;
            setClickedIds([...clickedIds, id]);
            setScore(newScore);
            if (newScore > highScore) {
                setHighScore(newScore);
            }
            if (newScore === NUM_CARDS) {
                alert("You win!");
                setClickedIds([]);
                setScore(0);
                fetchRandomPokemon();
            } else {
                // Shuffle cards if not yet won
                setPokemonCards(shuffleArray(pokemonCards));
            }
        }
    };

    return (
        <div>
            <h1 style={{ textAlign: "center" }}>Pokémon Memory Game</h1>
            <p style={{ textAlign: "center" }}>
                Score: {score} | High Score: {highScore}
            </p>
            {loading ? (
                <p style={{ textAlign: "center" }}>Loading...</p>
            ) : (
                <div
                    className="card-grid"
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        flexWrap: "wrap",
                        gap: "1rem",
                    }}
                >
                    {pokemonCards.map((p) => (
                        <div
                            key={p.id}
                            className="card"
                            onClick={() => handleCardClick(p.id)}
                            style={{
                                backgroundColor: typeColors[p.type1] || "#AAA",
                                borderRadius: "10px",
                                padding: "10px",
                                width: "120px",
                                textAlign: "center",
                                color: "white",
                                cursor: "pointer",
                                userSelect: "none",
                            }}
                        >
                            <img
                                src={p.image}
                                alt={p.name}
                                style={{ width: "120px", height: "120px" }}
                            />
                            <p>{p.name}</p>
                            <small>
                                {p.type2 !== false
                                    ? `${p.type1}/${p.type2}`
                                    : `${p.type1}`}
                            </small>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MemoryGame;
