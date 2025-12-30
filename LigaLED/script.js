// System State
let isExecuting = false;

// DOM Elements
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const cmdInput = document.getElementById('cmdInput');
const executionView = document.getElementById('executionView');

const led1Container = document.getElementById('led1-container');
const led2Container = document.getElementById('led2-container');
const led3Container = document.getElementById('led3-container');

// Initialization
function init() {
    runBtn.addEventListener('click', runCommandsAsync);
    resetBtn.addEventListener('click', fullReset);
}

// Logic: LED Control
function toggleLed(ledId, state) {
    const isOn = (state === 1);
    const container = getLedContainer(ledId);

    if (!container) {
        return false; // Invalid LED
    }

    // Remove all active classes first to be safe, though we usually just toggle one
    // But specific classes are needed for specific colors

    const activeClass = getActiveClass(ledId);

    if (isOn) {
        container.classList.add(activeClass);
    } else {
        container.classList.remove(activeClass);
    }

    return true;
}

function getLedContainer(id) {
    if (id === 1) return led1Container;
    if (id === 2) return led2Container;
    if (id === 3) return led3Container;
    return null;
}

function getActiveClass(id) {
    if (id === 1) return 'active-yellow';
    if (id === 2) return 'active-green';
    if (id === 3) return 'active-red';
    return '';
}

function turnOffAllLeds() {
    led1Container.classList.remove('active-yellow');
    led2Container.classList.remove('active-green');
    led3Container.classList.remove('active-red');
}

function fullReset() {
    isExecuting = false;
    turnOffAllLeds();

    // Reset UI
    cmdInput.value = '';
    cmdInput.classList.remove('hidden');
    executionView.innerHTML = '';
    executionView.classList.add('hidden');

    enableControls();
}

function enableControls() {
    runBtn.disabled = false;
    runBtn.textContent = "EXECUTAR CÓDIGO";
    resetBtn.disabled = false;
}

function disableControls() {
    runBtn.disabled = true;
    runBtn.textContent = "EXECUTANDO...";
    resetBtn.disabled = true;
}

// Async Runner
async function runCommandsAsync() {
    if (isExecuting) return;

    const script = cmdInput.value;
    if (!script.trim()) return;

    isExecuting = true;
    disableControls();

    const lines = script.split('\n');

    // Setup Execution View
    cmdInput.classList.add('hidden');
    executionView.innerHTML = '';
    executionView.classList.remove('hidden');

    lines.forEach(line => {
        const lineEl = document.createElement('div');
        lineEl.textContent = line.trim() || '\u00A0';
        lineEl.className = 'exec-line';
        executionView.appendChild(lineEl);
    });

    // Reset state before run? 
    // Usually standard practice involves a clean state or continuing? 
    // The requirement says "Reset" button clears everything, implying Run might just process.
    // However, to ensure deterministic behavior from top, let's clear LEDs first if implicit reset is desired.
    // But standard turtle graphics usually continue state. Let's assume state continues unless cleaned.
    // Actually, "LIMPAR" command exists. So start as is.

    const lineElements = executionView.children;

    for (let i = 0; i < lines.length; i++) {
        if (!isExecuting) break;

        const lineText = lines[i].trim().toUpperCase();
        const lineEl = lineElements[i];

        lineEl.classList.add('highlight-line');
        lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        if (lineText) {
            const parts = lineText.split(/\s+/);
            const cmd = parts[0];

            // Default delay for visual pacing
            let stepDelay = 500;

            if (cmd === 'ACIONAR') {
                // ACIONAR [LED] [ACAO]
                const ledId = parseInt(parts[1]);
                const action = parseInt(parts[2]);

                if (!isNaN(ledId) && !isNaN(action) && (action === 0 || action === 1)) {
                    const success = toggleLed(ledId, action);
                    if (!success) {
                        // Error feedback could go here
                    }
                }
            }
            else if (cmd === 'ESPERAR') {
                // ESPERAR [TEMPO]
                const seconds = parseFloat(parts[1]);
                if (!isNaN(seconds)) {
                    stepDelay = seconds * 1000;
                }
            }
            else if (cmd === 'LIMPAR') {
                turnOffAllLeds();
            }

            await delay(stepDelay);
        } else {
            await delay(100);
        }

        lineEl.classList.remove('highlight-line');
    }

    if (isExecuting) {
        // Loop finished naturally
        isExecuting = false;
        executionView.classList.add('hidden');
        cmdInput.classList.remove('hidden');
        enableControls();
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Start
init();
