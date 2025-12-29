// System Configuration
const CONFIG = {
    gridSize: 8,
    canvasSize: 600,
    animationSpeed: 600
};

// State
let turtle = {
    x: 0,
    y: 0,
    angle: 90
};

let gameState = 'idle'; // 'idle', 'playing'
let apple = { x: -1, y: -1 };
let isExecuting = false;

// DOM Elements
const canvas = document.getElementById('boardCanvas');
const ctx = canvas.getContext('2d');
const turtleEl = document.getElementById('turtle');
const appleEl = document.getElementById('apple');
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const playBtn = document.getElementById('playBtn');
const cmdInput = document.getElementById('cmdInput');
const executionView = document.getElementById('executionView');

// Initialization
function init() {
    drawBoard();
    updateTurtleView();
    updateAppleView();

    runBtn.addEventListener('click', runCommandsAsync);
    resetBtn.addEventListener('click', fullReset);
    playBtn.addEventListener('click', startGame);
}

// Logic: Turtle Movement
function moveTurtle(dist) {
    const rad = (turtle.angle - 90) * (Math.PI / 180);
    const dx = Math.cos(rad) * dist;
    const dy = Math.sin(rad) * dist;

    // Check bounds BEFORE updating
    const epsilon = 0.001;
    const nextX = turtle.x + dx;
    const nextY = turtle.y + dy;

    if (nextX < -epsilon || nextX > 7 + epsilon || nextY < -epsilon || nextY > 7 + epsilon) {
        alert("Movimento Inválido: A tartaruga sairia do tabuleiro!");
        return false;
    }

    turtle.x = nextX;
    turtle.y = nextY;
    return true;
}

function rotateTurtle(deg) {
    turtle.angle += deg;
}

function resetTurtle() {
    turtle.x = 0;
    turtle.y = 0;
    turtle.angle = 90;
}

function fullReset() {
    // Reset State
    gameState = 'idle';
    isExecuting = false;

    // Reset Elements
    resetTurtle();
    updateTurtleView();

    // Reset Apple
    apple.x = -1;
    apple.y = -1;
    updateAppleView();

    // Reset UI
    cmdInput.value = '';
    cmdInput.classList.remove('hidden');
    executionView.innerHTML = '';
    executionView.classList.add('hidden');
    runBtn.disabled = false;
    runBtn.textContent = "EXECUTAR CÓDIGO";
    resetBtn.disabled = false;
    playBtn.disabled = false;
}

// Game Logic
function startGame() {
    fullReset(); // Clear everything
    gameState = 'playing';

    // Random Apple Position
    // Ensure it's not at (0,0) where turtle starts
    do {
        apple.x = Math.floor(Math.random() * CONFIG.gridSize);
        apple.y = Math.floor(Math.random() * CONFIG.gridSize);
    } while (apple.x === 0 && apple.y === 0);

    // Show Apple
    updateAppleView();

    // Clear Input as requested
    cmdInput.value = '';

    alert("MODO JOGO INICIADO!\nObjetivo: Leve a tartaruga até a maçã.");
}

function stopGame() {
    gameState = 'idle';
    apple.x = -1;
    apple.y = -1;
    updateAppleView();
    fullReset();
}

function checkWinCondition() {
    if (gameState !== 'playing') return;

    // Check if turtle is reasonably close to apple (within same square)
    const dist = Math.sqrt(Math.pow(turtle.x - apple.x, 2) + Math.pow(turtle.y - apple.y, 2));

    if (dist < 0.5) {
        alert("Você venceu");
        stopGame();
    } else {
        alert("Você perdeu");
        stopGame();
    }
}

// Async Runner
async function runCommandsAsync() {
    if (isExecuting) return;
    isExecuting = true;
    runBtn.disabled = true;
    runBtn.textContent = "EXECUTANDO...";
    resetBtn.disabled = true;
    playBtn.disabled = true; // No playing while running

    const script = cmdInput.value;
    const lines = script.split('\n');

    cmdInput.classList.add('hidden');
    executionView.innerHTML = '';
    executionView.classList.remove('hidden');

    lines.forEach(line => {
        const lineEl = document.createElement('div');
        lineEl.textContent = line.trim() || '\u00A0';
        lineEl.className = 'exec-line';
        executionView.appendChild(lineEl);
    });

    resetTurtle(); // Visual reset start
    updateTurtleView();
    await delay(500);

    const lineElements = executionView.children;
    let errorOccurred = false;

    for (let i = 0; i < lines.length; i++) {
        if (!isExecuting) break;

        const lineText = lines[i].trim().toUpperCase();
        const lineEl = lineElements[i];

        lineEl.classList.add('highlight-line');
        lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        if (lineText) {
            const parts = lineText.split(/\s+/);
            const cmd = parts[0];
            const val = parseFloat(parts[1]) || 0;

            let actionTaken = false;
            let success = true;

            switch (cmd) {
                case 'ANDA':
                    success = moveTurtle(val);
                    actionTaken = true;
                    break;
                case 'TRAS':
                case 'TRÁS':
                    success = moveTurtle(-val);
                    actionTaken = true;
                    break;
                case 'DIREITA':
                    rotateTurtle(val);
                    actionTaken = true;
                    break;
                case 'ESQUERDA':
                    rotateTurtle(-val);
                    actionTaken = true;
                    break;
            }

            if (!success) {
                errorOccurred = true;
                lineEl.style.backgroundColor = 'rgba(239, 68, 68, 0.3)';
                await delay(1000);
                break;
            }

            if (actionTaken) {
                updateTurtleView();
                await delay(CONFIG.animationSpeed);
            } else {
                await delay(200);
            }
        } else {
            await delay(100);
        }

        lineEl.classList.remove('highlight-line');
    }

    await delay(500);

    // Check Win/Lose logic if in game mode AND no error occurred
    if (gameState === 'playing' && !errorOccurred) {
        checkWinCondition();
    }

    // General restore
    if (isExecuting) {
        executionView.classList.add('hidden');
        cmdInput.classList.remove('hidden');
        runBtn.disabled = false;
        runBtn.textContent = "EXECUTAR CÓDIGO";
        resetBtn.disabled = false;
        playBtn.disabled = false;
        isExecuting = false;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Rendering
function drawBoard() {
    const squareSize = CONFIG.canvasSize / CONFIG.gridSize;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let row = 0; row < CONFIG.gridSize; row++) {
        for (let col = 0; col < CONFIG.gridSize; col++) {
            const x = col * squareSize;
            const y = row * squareSize;
            ctx.fillStyle = (row + col) % 2 === 0 ? '#334155' : '#1e293b';
            ctx.fillRect(x, y, squareSize, squareSize);
            ctx.strokeStyle = 'rgba(0,0,0,0.2)';
            ctx.strokeRect(x, y, squareSize, squareSize);
        }
    }
}

function updateTurtleView() {
    const squareSize = CONFIG.canvasSize / CONFIG.gridSize;
    const centerX = turtle.x * squareSize + squareSize / 2;
    const centerY = turtle.y * squareSize + squareSize / 2;

    turtleEl.style.left = `${centerX}px`;
    turtleEl.style.top = `${centerY}px`;
    turtleEl.style.transform = `rotate(${turtle.angle}deg)`;
}

function updateAppleView() {
    if (apple.x >= 0 && apple.y >= 0) {
        const squareSize = CONFIG.canvasSize / CONFIG.gridSize;
        const centerX = apple.x * squareSize + squareSize / 2;
        const centerY = apple.y * squareSize + squareSize / 2;

        appleEl.style.left = `${centerX}px`;
        appleEl.style.top = `${centerY}px`;
        appleEl.classList.remove('hidden');
    } else {
        appleEl.classList.add('hidden');
    }
}

// Start
resetTurtle();
init();
