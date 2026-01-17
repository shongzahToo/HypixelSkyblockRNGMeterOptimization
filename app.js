import { createNumberInput } from 'smart-number-input';
let scorePerRun = 300;
let baseProbability = 0.00109;
let itemWeight = 15;
let totalWeight = 13706;

Object.defineProperty(window, 'requiredDungeonScore', {
    get: () => {
        return (totalWeight / itemWeight) * 300;
    },
    enumerable: true,
    configurable: false
});

Object.defineProperty(window, 'n', {
    get: () => {
        return Math.ceil(requiredDungeonScore / scorePerRun);
    },
    enumerable: true,
    configurable: false
});

const runsInput = createNumberInput(document.getElementById('scorePerRunInput'), {
    focusFormat: '0',
    blurFormat: '0,0[a]',
    allowNegative: false,
    min: 0,
    max: 999999,
    step: 1,
    onValueChange: (value) => { scorePerRun = value; }
});

const oddsInput = createNumberInput(document.getElementById('baseProbabilityInput'), {
    focusFormat: '0.00[00000]',
    blurFormat: '0.00[00000]%',
    allowNegative: false,
    min: 0,
    max: 999999,
    step: 1,
    onValueChange: (value) => { baseProbability = value }
});

const itemWeightInput = createNumberInput(document.getElementById('itemWeightInput'), {
    focusFormat: '0,0',
    blurFormat: '0,0[a]',
    allowNegative: false,
    min: 0,
    max: 999999,
    step: 1,
    onValueChange: (value) => { itemWeight = value }
});

const totalWeightInput = createNumberInput(document.getElementById('totalWeightInput'), {
    focusFormat: '0,0',
    blurFormat: '0,0[a]',
    allowNegative: false,
    min: 0,
    max: 999999,
    step: 1,
    onValueChange: (value) => { totalWeight = value }
});

const pMeter = new Float64Array(n + 1);

for (let fails = 0; fails <= n; fails++) {
    const storedScore = fails * scorePerRun;
    const mult = 1 + Math.min((2 * storedScore) / requiredDungeonScore, 2);
    const num = baseProbability * mult;
    pMeter[fails] = num / (1 - baseProbability + num);
}

function expectedWithMeter(T) {
    let next = new Float64Array(n + 1);
    let cur = new Float64Array(n + 1);

    for (let t = T - 1; t >= 0; t--) {
        const dp0Next = next[0];

        cur[n] = 1 + dp0Next;

        for (let r = n - 1; r >= 0; r--) {
            const p = pMeter[r];
            cur[r] = p * (1 + dp0Next) + (1 - p) * next[r + 1];
        }

        const tmp = next;
        next = cur;
        cur = tmp;
    }

    return next[0];
}

function expectedWithCutoff(T, k) {
    let next = new Float64Array(n + 1);
    let cur = new Float64Array(n + 1);

    for (let t = T - 1; t >= 0; t--) {
        const dp0Next = next[0];

        cur[n] = 1 + dp0Next;

        for (let r = n - 1; r >= 0; r--) {
            const meterOn = r < k;
            const p = meterOn ? pMeter[r] : baseProbability;

            const succNext = meterOn ? dp0Next : next[r + 1];

            cur[r] = p * (1 + succNext) + (1 - p) * next[r + 1];
        }

        const tmp = next;
        next = cur;
        cur = tmp;
    }

    return next[0];
}

const T = n + 1;

function runCheck() {
    console.log("Running check...");
    const resultsEl = document.getElementById("results");
    const bestCutoffEl = document.getElementById("bestCutoff");

    resultsEl.textContent = "";

    const expectedValue = expectedWithMeter(T);

    let bestK = 0;
    let bestDiff = -Infinity;

    for (let k = 0; k <= n; k++) {
        const expectedValueCutoff = expectedWithCutoff(T, k);
        const diff = expectedValueCutoff - expectedValue;

        if (diff > bestDiff) {
            bestDiff = diff;
            bestK = k;
        }

        resultsEl.textContent +=
            `k=${k.toString().padStart(3)}  ` +
            `cutoff=${expectedValueCutoff.toFixed(6)}  ` +
            `diff=${diff.toFixed(6)}\n`;
    }

    bestCutoffEl.textContent =
        `k = ${bestK} (Δ = ${bestDiff.toFixed(6)})`;
}

document.getElementById("calculateButton").addEventListener("click", runCheck);
