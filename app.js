import { createNumberInput } from 'smart-number-input';
let n = 100;
let baseOdds = 0.00109;
const requiredDungeonScore = (300 * 13706) / 15;
const scorePerRun = requiredDungeonScore / n;

const runsInput = createNumberInput(document.getElementById('runsInput'), {
  focusFormat: '0',
  blurFormat: '0,0[.00][a]',
  allowNegative: false,
  min: 0,
  max: 999999,
  step: 1,
    onChange: (value) => {n = value;}
});

const oddsInput = createNumberInput(document.getElementById('baseOddsInput'), {
    focusFormat: '0.00[00000]',
    blurFormat: '0.00[00000]%',
    allowNegative: false,
    min: 0,
    max: 999999,
    step: 1,
    onChange: (value) => {baseOdds = value}
});



const pMeter = new Float64Array(n + 1);
for (let fails = 0; fails <= n; fails++) {
  const storedScore = fails * scorePerRun;
  const mult = 1 + Math.min((2 * storedScore) / requiredDungeonScore, 2);
  const num = baseOdds * mult;
  pMeter[fails] = num / (1 - baseOdds + num);
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
      const p = meterOn ? pMeter[r] : baseOdds;

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
