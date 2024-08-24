// Pobieramy element canvas i jego kontekst 2D
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Inicjujemy zmienne
let clickCount = 0;
let lives = 3;
let monkeys = [];
let spawnInterval = 2000; // Początkowy interwał małpek (2000 ms = 2 sekundy)
let spawnTimer;           // Zmienna, która będzie trzymać id interwału spawnowania
const banana = new Image();
banana.src = 'banana.png';  // Ścieżka do obrazka banana
const heart = new Image();
heart.src = 'heart.png';    // Ścieżka do obrazka serduszka
const monkey = new Image();
monkey.src = 'monkey.png';  // Ścieżka do obrazka małpki

// Pozycja banana na środku ekranu
const bananaStartX = (canvas.width / 2) - 50;
const bananaStartY = (canvas.height / 2) - 50;
let bananaX = bananaStartX;
let bananaY = bananaStartY;

// Zmienna kontrolująca trzęsienie
let isShaking = false;
let shakeDuration = 500;  // Czas trzęsienia w ms
let shakeStartTime = 0;

// Funkcja rysująca ekran
function drawScreen() {
    // Rysowanie tła
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Rysowanie banana
    ctx.drawImage(banana, bananaX, bananaY, 100, 100);  // Rysujemy banan (100x100)

    // Rysowanie licznika kliknięć w prawym górnym rogu
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.textAlign = "right";
    ctx.fillText("Kliknięcia: " + clickCount, canvas.width - 20, 40);

    // Rysowanie serduszek (życia)
    for (let i = 0; i < lives; i++) {
        ctx.drawImage(heart, 10 + i * 40, 10, 30, 30);  // Serduszka w lewym górnym rogu
    }

    // Rysowanie małpek
    monkeys.forEach(monkey => {
        ctx.drawImage(monkey.image, monkey.x, monkey.y, 50, 50);  // Rysujemy małpkę
    });
}

// Funkcja obsługująca trzęsienie banana
function handleShaking() {
    if (isShaking) {
        const elapsedTime = Date.now() - shakeStartTime;

        if (elapsedTime < shakeDuration) {
            // Losowe przesunięcie banana w zakresie od -5 do +5 pikseli
            bananaX = bananaStartX + Math.random() * 10 - 5;
            bananaY = bananaStartY + Math.random() * 10 - 5;
        } else {
            // Zakończenie trzęsienia
            isShaking = false;
            bananaX = bananaStartX;
            bananaY = bananaStartY;
        }
    }
}

// Funkcja tworząca nową małpkę na krawędzi ekranu
function spawnMonkey() {
    const side = Math.floor(Math.random() * 4);  // Wybieramy losową krawędź ekranu (0: lewa, 1: prawa, 2: góra, 3: dół)
    let x, y;

    if (side === 0) { // Lewa strona
        x = -50;
        y = Math.random() * canvas.height;
    } else if (side === 1) { // Prawa strona
        x = canvas.width;
        y = Math.random() * canvas.height;
    } else if (side === 2) { // Górna strona
        x = Math.random() * canvas.width;
        y = -50;
    } else { // Dolna strona
        x = Math.random() * canvas.width;
        y = canvas.height;
    }

    monkeys.push({
        x: x,
        y: y,
        image: monkey
    });
}

// Funkcja aktualizująca stan gry
function updateGame() {
    handleShaking();
    
    // Poruszanie małpek w kierunku banana
    monkeys.forEach((monk, index) => {
        const dx = bananaX + 50 - monk.x;  // Delta x
        const dy = bananaY + 50 - monk.y;  // Delta y
        const distance = Math.sqrt(dx * dx + dy * dy);  // Odległość do banana

        // Normalizacja wektora
        monk.x += (dx / distance) * 2;  // Prędkość małpki (2 piksele na klatkę)
        monk.y += (dy / distance) * 2;

        // Sprawdzenie kolizji z bananem
        if (distance < 50) {
            lives--;
            monkeys.splice(index, 1);  // Usuwamy małpkę, która dotarła do banana
        }
    });

    drawScreen();
}

// Funkcja aktualizująca interwał pojawiania się małpek
function updateSpawnInterval() {
    clearInterval(spawnTimer);  // Usuwamy poprzedni interwał
    spawnTimer = setInterval(spawnMonkey, spawnInterval);  // Ustawiamy nowy interwał
}

// Funkcja obsługująca kliknięcia na canvas
canvas.addEventListener("click", function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Sprawdzenie czy kliknięto w obszar banana
    if (x >= bananaX && x <= bananaX + 100 && y >= bananaY && y <= bananaY + 100) {
        clickCount++;

        // Uruchomienie trzęsienia
        isShaking = true;
        shakeStartTime = Date.now();

        // Im więcej kliknięć, tym szybciej pojawiają się małpki
        if (clickCount % 10 === 0 && spawnInterval > 500) {  // Co 10 kliknięć skracamy interwał
            spawnInterval -= 200;  // Skracamy interwał o 200 ms
            updateSpawnInterval();  // Aktualizujemy interwał pojawiania się małpek
        }
    }

    // Sprawdzenie kliknięcia na małpki
    monkeys.forEach((monk, index) => {
        if (x >= monk.x && x <= monk.x + 50 && y >= monk.y && y <= monk.y + 50) {
            monkeys.splice(index, 1);  // Usuwamy małpkę, jeśli została kliknięta
        }
    });
});

// Uruchomienie pętli głównej
function gameLoop() {
    updateGame();
    requestAnimationFrame(gameLoop);  // Płynna animacja
}

// Spawnowanie małpek co 2 sekundy na początku
spawnTimer = setInterval(spawnMonkey, spawnInterval);

// Rozpoczęcie gry po załadowaniu wszystkich obrazków
Promise.all([
    new Promise(resolve => banana.onload = resolve),
    new Promise(resolve => heart.onload = resolve),
    new Promise(resolve => monkey.onload = resolve)
]).then(() => {
    gameLoop();
});
// Funkcja rysująca ekran końca gry
function drawGameOver() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";  // Półprzezroczyste tło
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Koniec gry", canvas.width / 2, canvas.height / 2);

    ctx.font = "30px Arial";
    ctx.fillText("Kliknij, aby zagrać ponownie", canvas.width / 2, canvas.height / 2 + 50);
}

// Funkcja aktualizująca stan gry
function updateGame() {
    if (lives <= 0) {
        drawGameOver();
        return;  // Zatrzymujemy aktualizację gry
    }

    handleShaking();
    
    // Poruszanie małpek w kierunku banana
    monkeys.forEach((monk, index) => {
        const dx = bananaX + 50 - monk.x;  // Delta x
        const dy = bananaY + 50 - monk.y;  // Delta y
        const distance = Math.sqrt(dx * dx + dy * dy);  // Odległość do banana

        // Normalizacja wektora
        monk.x += (dx / distance) * 2;  // Prędkość małpki (2 piksele na klatkę)
        monk.y += (dy / distance) * 2;

        // Sprawdzenie kolizji z bananem
        if (distance < 50) {
            lives--;
            monkeys.splice(index, 1);  // Usuwamy małpkę, która dotarła do banana

            // Jeśli życia spadną do zera, zakończ grę
            if (lives <= 0) {
                drawGameOver();
                return;
            }
        }
    });

    drawScreen();
}

// Funkcja obsługująca restart gry
canvas.addEventListener("click", function(event) {
    if (lives <= 0) {
        // Restartujemy grę
        clickCount = 0;
        lives = 3;
        monkeys = [];
        spawnInterval = 2000;
        updateSpawnInterval();
        gameLoop();  // Restartujemy pętlę gry
    }
});

// Uruchomienie pętli głównej
function gameLoop() {
    updateGame();
    if (lives > 0) {  // Sprawdzamy, czy gra nadal trwa
        requestAnimationFrame(gameLoop);  // Płynna animacja
    }
}



