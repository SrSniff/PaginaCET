document.addEventListener('DOMContentLoaded', () => {
    const peakInput = document.getElementById('peakValue');
    const rmsInput = document.getElementById('rmsValue');
    const explanationBox = document.getElementById('explanation');
    const clearBtn = document.getElementById('clearBtn');

    const SQRT_2 = Math.sqrt(2); // ~1.414

    function updatePeakToRMS() {
        const peak = parseFloat(peakInput.value);
        if (isNaN(peak)) {
            clearExplanation();
            rmsInput.value = '';
            return;
        }

        const rms = peak / SQRT_2;
        rmsInput.value = rms.toFixed(2);
        
        showExplanation('Pico para RMS', peak, rms, true);
    }

    function updateRMSToPeak() {
        const rms = parseFloat(rmsInput.value);
        if (isNaN(rms)) {
            clearExplanation();
            peakInput.value = '';
            return;
        }

        const peak = rms * SQRT_2;
        peakInput.value = peak.toFixed(2);
        
        showExplanation('RMS para Pico', peak, rms, false);
    }

    function showExplanation(title, peak, rms, isPeakToRMS) {
        let html = `
            <div class="step">
                <span class="step-title">${title}</span>
                <p>Para uma onda senoidal pura, a relação entre o valor de pico (V<sub>p</sub>) e o valor eficaz (V<sub>rms</sub>) é baseada na raiz quadrada de 2.</p>
            </div>
        `;

        if (isPeakToRMS) {
            html += `
                <div class="step">
                    <p><strong>Fórmula:</strong> <span class="formula">V<sub>rms</sub> = V<sub>p</sub> / √2</span></p>
                    <p>Passo 1: Identificamos o valor de pico: <strong>${peak.toFixed(2)} V</strong></p>
                    <p>Passo 2: Dividimos por √2 (aprox. 1.414):</p>
                    <p>${peak.toFixed(2)} / 1.4142 = ${rms.toFixed(2)}</p>
                    <span class="result-highlight">Resultado: ${rms.toFixed(2)} Vrms</span>
                </div>
            `;
        } else {
            html += `
                <div class="step">
                    <p><strong>Fórmula:</strong> <span class="formula">V<sub>p</sub> = V<sub>rms</sub> * √2</span></p>
                    <p>Passo 1: Identificamos o valor RMS: <strong>${rms.toFixed(2)} V</strong></p>
                    <p>Passo 2: Multiplicamos por √2 (aprox. 1.414):</p>
                    <p>${rms.toFixed(2)} * 1.4142 = ${peak.toFixed(2)}</p>
                    <span class="result-highlight">Resultado: ${peak.toFixed(2)} Vp</span>
                </div>
            `;
        }

        explanationBox.innerHTML = html;
        explanationBox.style.animation = 'none';
        explanationBox.offsetHeight; // trigger reflow
        explanationBox.style.animation = null;
    }

    function clearExplanation() {
        explanationBox.innerHTML = '<p class="placeholder-text">Insira um valor acima para ver o cálculo passo a passo.</p>';
    }

    function clearAll() {
        peakInput.value = '';
        rmsInput.value = '';
        clearExplanation();
    }

    peakInput.addEventListener('input', updatePeakToRMS);
    rmsInput.addEventListener('input', updateRMSToPeak);
    clearBtn.addEventListener('click', clearAll);
});
