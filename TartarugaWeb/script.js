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
    angle: 90 // 90 = Right, 0 = Up, 180 = Down, 270 = Left
};

let isExecuting = false;

// DOM Elements
const canvas = document.getElementById('boardCanvas');
const ctx = canvas.getContext('2d');
const turtleEl = document.getElementById('turtle');
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const cmdInput = document.getElementById('cmdInput');
const executionView = document.getElementById('executionView');

// Initialization
function init() {
    drawBoard();
    updateTurtleView();

    runBtn.addEventListener('click', runCommandsAsync);
    resetBtn.addEventListener('click', fullReset);
}

// Logic: Turtle Movement
function moveTurtle(dist) {
    const rad = (turtle.angle - 90) * (Math.PI / 180);
    // Calculate potential new position
    const dx = Math.cos(rad) * dist;
    const dy = Math.sin(rad) * dist;

    // Round to nearest integer (assuming movement in full squares) to avoid float drift
    // Current X/Y are integers ideally.
    // If we support fractional movement, we keep float.
    // But board is 8x8. Commands like ANDA 1.

    const nextX = turtle.x + dx;
    const nextY = turtle.y + dy;

    // Boundary Check (0 to 7.999...)
    // Or stricter: must stay within [0, 8) 
    // Allowing minor float epsilon tolerance?
    const epsilon = 0.001;

    if (nextX < -epsilon || nextX > 7 + epsilon || nextY < -epsilon || nextY > 7 + epsilon) {
        // Stop execution
        alert("Movimento Inválido: A tartaruga sairia do tabuleiro!");
        return false; // Indicate failure
    }

    turtle.x = nextX;
    turtle.y = nextY;
    return true; // Success
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
    // Stop execution if running? 
    // Ideally we shouldn't reset while running, but if we do:
    isExecuting = false; // Force stop loop (not immediate but flag set)

    resetTurtle();
    updateTurtleView();

    // Reset UI to Edit Mode
    executionView.classList.add('hidden');
    cmdInput.classList.remove('hidden');
    runBtn.disabled = false;
    runBtn.textContent = "EXECUTAR CÓDIGO";

    // Clear input? User might want to keep code. 
    // User request: "Voltar ao quadro inicial". 
    // Usually means reset State. Code can stay.
}

// Logic: Async Command Parser & Execution
async function runCommandsAsync() {
    if (isExecuting) return;
    isExecuting = true;
    runBtn.disabled = true;
    runBtn.textContent = "EXECUTANDO...";
    resetBtn.disabled = true; // Disable reset during run

    const script = cmdInput.value;
    const lines = script.split('\n');

    // Switch to Execution View
    cmdInput.classList.add('hidden');
    executionView.innerHTML = '';
    executionView.classList.remove('hidden');

    lines.forEach(line => {
        const lineEl = document.createElement('div');
        lineEl.textContent = line.trim() || '\u00A0';
        lineEl.className = 'exec-line';
        executionView.appendChild(lineEl);
    });

    // Reset State before Run
    resetTurtle();
    updateTurtleView();
    await delay(500);

    const lineElements = executionView.children;
    let errorOccurred = false;

    for (let i = 0; i < lines.length; i++) {
        if (!isExecuting) break; // Check flag in case logic changes

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
                lineEl.style.backgroundColor = 'rgba(239, 68, 68, 0.3)'; // Red error highlight
                await delay(1000);
                break; // Stop loop
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

    // Only return to Edit mode if not error? 
    // Or always return? User usually wants to fix code.
    await delay(1000);

    executionView.classList.add('hidden');
    cmdInput.classList.remove('hidden');

    isExecuting = false;
    runBtn.disabled = false;
    runBtn.textContent = "EXECUTAR CÓDIGO";
    resetBtn.disabled = false;
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

// Start
resetTurtle();
init();
