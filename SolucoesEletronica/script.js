function showResult(ids, html) {
    const resultArea = document.getElementById(ids);
    resultArea.innerHTML = html;
    resultArea.classList.add('active');
}

// 1. Divisor de Tensão
function calculateVoltageDivider() {
    const vin = parseFloat(document.getElementById('vd-vin').value);
    const voutInput = parseFloat(document.getElementById('vd-vout').value);
    const r1 = parseFloat(document.getElementById('vd-r1').value);
    const r2Input = parseFloat(document.getElementById('vd-r2').value);
    const mode = document.getElementById('vd-mode').value;

    let html = "";
    if (mode === 'vout') {
        const r2 = r2Input;
        if (isNaN(vin) || isNaN(r1) || isNaN(r2)) {
            alert("Por favor, preencha Vin, R1 e R2.");
            return;
        }
        const vout = vin * (r2 / (r1 + r2));
        html = `
            <strong>Resultado: Vout = ${vout.toFixed(2)}V</strong>
            <div class="explanation">Um divisor de tensão distribui a tensão de entrada proporcionalmente aos valores das resistências.</div>
            <div class="steps">
                <p>Fórmula: Vout = Vin * [R2 / (R1 + R2)]</p>
                <p>1. Soma das resistências: ${r1} + ${r2} = ${r1 + r2} Ω</p>
                <p>2. Proporção de R2: ${r2} / ${r1 + r2} = ${(r2 / (r1 + r2)).toFixed(4)}</p>
                <p>3. Tensão final: ${vin} * ${(r2 / (r1 + r2)).toFixed(4)} = ${vout.toFixed(2)}V</p>
            </div>
        `;
    } else {
        const vout = voutInput;
        if (isNaN(vin) || isNaN(r1) || isNaN(vout)) {
            alert("Por favor, preencha Vin, Vout e R1.");
            return;
        }
        if (vout >= vin) {
            alert("Vout deve ser menor que Vin.");
            return;
        }
        const r2 = (vout * r1) / (vin - vout);
        html = `
            <strong>Resultado: R2 = ${r2.toFixed(2)}Ω</strong>
            <div class="explanation">Para obter uma tensão específica na saída, calculamos o valor de R2 isolando-o na fórmula do divisor.</div>
            <div class="steps">
                <p>Fórmula: R2 = (Vout * R1) / (Vin - Vout)</p>
                <p>1. Diferença de potencial em R1: ${vin} - ${vout} = ${(vin - vout).toFixed(2)} V</p>
                <p>2. Numerador (Vout * R1): ${vout} * ${r1} = ${vout * r1}</p>
                <p>3. R2 final: ${vout * r1} / ${(vin - vout).toFixed(2)} = ${r2.toFixed(2)}Ω</p>
            </div>
        `;
    }
    showResult('vd-result', html);
}

// 2. Cálculo de Ripple
function calculateRipple() {
    const iload = parseFloat(document.getElementById('rip-iload').value);
    const freq = parseFloat(document.getElementById('rip-freq').value);
    const vpp = parseFloat(document.getElementById('rip-vpp').value);

    if (isNaN(iload) || isNaN(freq) || isNaN(vpp)) {
        alert("Preencha todos os campos do Ripple.");
        return;
    }

    const cFarad = iload / (freq * vpp);
    const uF = cFarad * 1000000;

    const html = `
        <strong>Capacitor Necessário: ${uF.toFixed(2)} µF</strong>
        <div class="explanation">O ripple é a oscilação na tensão de saída após a retificação. O capacitor armazena carga para manter a tensão nos vales da senoide.</div>
        <div class="steps">
            <p>Fórmula: C = Iload / (f * Vpp)</p>
            <p>1. f * Vpp: ${freq} * ${vpp} = ${freq * vpp}</p>
            <p>2. C (Farads): ${iload} / ${freq * vpp} = ${cFarad.toFixed(8)} F</p>
            <p>3. Convertendo para µF: ${cFarad.toFixed(8)} * 1.000.000 = ${uF.toFixed(2)} µF</p>
        </div>
    `;
    showResult('rip-result', html);
}

// 3. Resistores em Paralelo
function calculateParallel() {
    const valuesInput = document.getElementById('par-values').value;
    const values = valuesInput.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));

    if (values.length < 2) {
        alert("Insira pelo menos dois valores separados por vírgula.");
        return;
    }

    let sumInverse = 0;
    let stepText = "";
    values.forEach((v, i) => {
        sumInverse += (1 / v);
        stepText += `<p>1/${v} = ${(1 / v).toFixed(6)}</p>`;
    });

    const rTotal = 1 / sumInverse;

    const html = `
        <strong>Resistência Total: ${rTotal.toFixed(2)} Ω</strong>
        <div class="explanation">Em paralelo, a resistência total é sempre menor que o menor resistor individual, pois há mais caminhos para a corrente passar.</div>
        <div class="steps">
            <p>Fórmula: 1/Rt = 1/R1 + 1/R2 + ... + 1/Rn</p>
            ${stepText}
            <p>Soma dos inversos: ${sumInverse.toFixed(6)} S (Siemens)</p>
            <p>Rt = 1 / ${sumInverse.toFixed(6)} = ${rTotal.toFixed(2)} Ω</p>
        </div>
    `;
    showResult('par-result', html);
}

// 4. Resistor para LED
function calculateLedResistor() {
    const vcc = parseFloat(document.getElementById('led-vcc').value);
    const vled = parseFloat(document.getElementById('led-vled').value);
    const iledMa = parseFloat(document.getElementById('led-iled').value);

    if (isNaN(vcc) || isNaN(vled) || isNaN(iledMa)) {
        alert("Preencha todos os campos do LED.");
        return;
    }

    const iledA = iledMa / 1000;
    const r = (vcc - vled) / iledA;

    const html = `
        <strong>Resistor Ideal: ${r.toFixed(2)} Ω</strong>
        <div class="explanation">O resistor limita a corrente que passa pelo LED para evitar que ele queime. Ele deve absorver a diferença entre a fonte e a tensão de trabalho do LED.</div>
        <div class="steps">
            <p>Fórmula: R = (Vcc - Vled) / Iled</p>
            <p>1. Tensão sobre o resistor: ${vcc} - ${vled} = ${(vcc - vled).toFixed(2)} V</p>
            <p>2. Corrente em Amperes: ${iledMa} / 1000 = ${iledA} A</p>
            <p>3. R = ${(vcc - vled).toFixed(2)} / ${iledA} = ${r.toFixed(2)} Ω</p>
        </div>
    `;
    showResult('led-result', html);
}
