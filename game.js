// Inicjalizacja canvas i kontekstu 2D
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Zmienne globalne
let clickCount = 0;
let lives = 3;
let monkeys = [];
let spawnInterval = 2000;
let spawnTimer;
let isShaking = false;
let shakeStartTime = 0;
const shakeDuration = 500;
let gameOver = false; // Nowa zmienna kontrolująca stan gry

const assets = {
    banana: new Image(),
    heart: new Image(),
    monkey: new Image()
};

// Początkowa pozycja banana
const bananaPosition = {
    startX: (canvas.width / 2) - 50,
    startY: (canvas.height / 2) - 50,
    x: (canvas.width / 2) - 50,
    y: (canvas.height / 2) - 50
};

// Funkcja rysująca ekran
const drawScreen = () => {
    // Tło
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Banan
    ctx.drawImage(assets.banana, bananaPosition.x, bananaPosition.y, 100, 100);

    // Licznik kliknięć
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`Clicks: ${clickCount}`, canvas.width - 20, 40);

    // Rysowanie serduszek (życia)
    for (let i = 0; i < lives; i++) {
        ctx.drawImage(assets.heart, 10 + i * 40, 10, 30, 30);
    }

    // Rysowanie małpek
    monkeys.forEach(monkey => {
        ctx.drawImage(assets.monkey, monkey.x, monkey.y, 50, 50);
    });
};

// Obsługa trzęsienia banana
const handleShaking = () => {
    if (isShaking) {
        const elapsedTime = Date.now() - shakeStartTime;
        if (elapsedTime < shakeDuration) {
            bananaPosition.x = bananaPosition.startX + Math.random() * 10 - 5;
            bananaPosition.y = bananaPosition.startY + Math.random() * 10 - 5;
        } else {
            isShaking = false;
            bananaPosition.x = bananaPosition.startX;
            bananaPosition.y = bananaPosition.startY;
        }
    }
};

// Tworzenie nowej małpki na losowej krawędzi
const spawnMonkey = () => {
    const side = Math.floor(Math.random() * 4);
    let x, y;

    switch (side) {
        case 0: // Lewa krawędź
            x = -50;
            y = Math.random() * canvas.height;
            break;
        case 1: // Prawa krawędź
            x = canvas.width;
            y = Math.random() * canvas.height;
            break;
        case 2: // Górna krawędź
            x = Math.random() * canvas.width;
            y = -50;
            break;
        case 3: // Dolna krawędź
            x = Math.random() * canvas.width;
            y = canvas.height;
            break;
    }

    monkeys.push({ x, y });
};

// Funkcja rysująca ekran końca gry
const drawGameOver = () => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("The banana was eaten!", canvas.width / 2, canvas.height / 2 - 50);

    ctx.font = "30px Arial";
    ctx.fillText(`Your score: ${clickCount} clicks`, canvas.width / 2, canvas.height / 2);

    ctx.fillText("Click to restart", canvas.width / 2, canvas.height / 2 + 50);
};

// Restart gry
const resetGame = () => {
    clickCount = 0;
    lives = 3;
    monkeys = [];
    spawnInterval = 2000;
    gameOver = false; // Ustawienie zmiennej gameOver na false, bo gra się restartuje
    bananaPosition.x = bananaPosition.startX;
    bananaPosition.y = bananaPosition.startY;
    updateSpawnInterval();
    gameLoop();
};

// Aktualizacja gry
const updateGame = () => {
    if (lives <= 0) {
        gameOver = true; // Ustawienie zmiennej gameOver na true, bo gra się skończyła
        drawGameOver();
        return;
    }

    handleShaking();
    
    monkeys.forEach((monk, index) => {
        const dx = bananaPosition.x + 50 - monk.x;
        const dy = bananaPosition.y + 50 - monk.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        monk.x += (dx / distance) * 2;
        monk.y += (dy / distance) * 2;

        if (distance < 50) {
            lives--;
            monkeys.splice(index, 1);
        }
    });

    drawScreen();
};

// Aktualizacja interwału pojawiania się małpek
const updateSpawnInterval = () => {
    clearInterval(spawnTimer);
    spawnTimer = setInterval(spawnMonkey, spawnInterval);
};

// Obsługa kliknięć w canvas
canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Jeśli gra się skończyła, restartuj grę po kliknięciu
    if (gameOver) {
        resetGame();
        return;
    }

    // Sprawdzenie kliknięcia na banana
    if (x >= bananaPosition.x && x <= bananaPosition.x + 100 && y >= bananaPosition.y && y <= bananaPosition.y + 100) {
        clickCount++;
        isShaking = true;
        shakeStartTime = Date.now();

        if (clickCount % 10 === 0 && spawnInterval > 500) {
            spawnInterval -= 200;
            updateSpawnInterval();
        }
    }

    // Sprawdzenie kliknięcia na małpki
    monkeys.forEach((monk, index) => {
        if (x >= monk.x && x <= monk.x + 50 && y >= monk.y && y <= monk.y + 50) {
            monkeys.splice(index, 1);
        }
    });
});

// Główna pętla gry
const gameLoop = () => {
    updateGame();
    if (!gameOver) { // Gra będzie kontynuowana tylko jeśli nie jest zakończona
        requestAnimationFrame(gameLoop);
    }
};

// Ładowanie obrazów i rozpoczęcie gry
const loadAssets = () => {
    assets.banana.src = 'banana.png';
    assets.heart.src = 'heart.png';
    assets.monkey.src = 'monkey.png';

    Promise.all([
        new Promise(resolve => assets.banana.onload = resolve),
        new Promise(resolve => assets.heart.onload = resolve),
        new Promise(resolve => assets.monkey.onload = resolve)
    ]).then(() => {
        spawnTimer = setInterval(spawnMonkey, spawnInterval);
        gameLoop();
    });
};

// Uruchomienie ładowania zasobów i rozpoczęcie gry
loadAssets();
