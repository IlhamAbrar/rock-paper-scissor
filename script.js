const startBtn = document.getElementById('start-btn');
const laptopTerminal = document.getElementById('terminal');
const cyberHud = document.querySelector('.hud-container');
const scoreDisplay = document.getElementById('score-display');
const typewriterLines = document.querySelectorAll('.hud-body > .typewriter');

const inputContainer = document.getElementById('input-container');
const commandInput = document.getElementById('command-input');
const commandHistory = document.getElementById('command-history');

// Score and Game Loop Tracking
const scoreAmountEl = document.getElementById('score-amount');
const REWARD_AMOUNT = 500;

// Glitch Durations
const WIN_GLITCH_DURATION = 800;   // Smoother, shorter duration for wins
const LOSE_GLITCH_DURATION = 1500; // Longer, intense duration for losses

// Independent Screen Outline Durations (In Milliseconds)
const WIN_OUTLINE_DURATION = 3000;  
const LOSE_OUTLINE_DURATION = 3500; 

let moneyScore = 0;
let playerWins = 0;
let playerLosses = 0;

const choices = ['ice', 'quickhack', 'daemon'];

const rules = {
  ice: 'quickhack',
  quickhack: 'daemon',
  daemon: 'ice'
};

function typeLine(element, text, speed = 25) {
  return new Promise((resolve) => {
    let index = 0;
    element.textContent = '';

    document.querySelectorAll('.active-line').forEach(el => el.classList.remove('active-line'));
    element.classList.add('active-line');

    function step() {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
        setTimeout(step, speed);
      } else {
        resolve();
      }
    }

    step();
  });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function startTypewriterEffect() {
  for (const line of typewriterLines) {
    const textToType = line.getAttribute('data-text');
    if (!textToType) continue;
    await typeLine(line, textToType, 30);
  }

  inputContainer.classList.remove('hidden');
  setTimeout(() => {
    inputContainer.classList.add('visible');
    commandInput.focus();
  }, 50);
}

function sanitizeInput(rawInput) {
  return rawInput.toLowerCase().replace(/[^a-z]/g, '');
}

async function handleCommandSubmit(rawInput) {
  commandInput.disabled = true;

  const sanitized = sanitizeInput(rawInput);
  
  const actionLine = document.createElement('p');
  actionLine.className = 'log-line';
  commandHistory.appendChild(actionLine);

  if (!choices.includes(sanitized)) {
    await typeLine(actionLine, `> '${rawInput}' : COMMAND NOT FOUND. VALID PAYLOADS: ICE | QUICKHACK | DAEMON`);
    
    commandInput.disabled = false;
    commandInput.focus();
    commandHistory.scrollTop = commandHistory.scrollHeight;
    return;
  }

  const botChoice = choices[Math.floor(Math.random() * choices.length)];
  let resultText = `> INPUT: ${sanitized.toUpperCase()} || SYSTEM: ${botChoice.toUpperCase()} -> `;

  if (sanitized === botChoice) {
    resultText += `COUNTER-PROTOCOL TIED. RETRYING... [W:${playerWins}/3 | L:${playerLosses}/3]`;
  } else if (rules[sanitized] === botChoice) {
    playerWins++;
    resultText += `ACCESS GRANTED. BREACH SUCCESSFUL! [W:${playerWins}/3 | L:${playerLosses}/3]`;
    actionLine.classList.add('log-win');
  } else {
    playerLosses++;
    resultText += `TRACE DETECTED. BREACH FAILED! [W:${playerWins}/3 | L:${playerLosses}/3]`;
    actionLine.classList.add('log-lose');
  }

  await typeLine(actionLine, resultText);

  // Game Loop Win / Gameover Checks
  if (playerWins >= 3) {
    moneyScore += REWARD_AMOUNT;
    scoreAmountEl.textContent = moneyScore;

    // Trigger Glitch & Screen Edge Aura
    document.body.classList.add('screen-win');
    cyberHud.classList.add('glitch-win');
    scoreDisplay.classList.add('glitch-win');

    // Remove Screen Outline independently after WIN_OUTLINE_DURATION
    setTimeout(() => {
      document.body.classList.remove('screen-win');
    }, WIN_OUTLINE_DURATION);

    // Wait for Glitch Duration to finish
    await wait(WIN_GLITCH_DURATION);

    // Stop Glitch Effects
    cyberHud.classList.remove('glitch-win');
    scoreDisplay.classList.remove('glitch-win');

    const winLine = document.createElement('p');
    winLine.className = 'log-line log-win';
    commandHistory.appendChild(winLine);
    await typeLine(winLine, `>>> SYSTEM FULLY OVERRIDDEN! CREDITS REWARD: +$${REWARD_AMOUNT}. RESETTING COUNTERS...`);

    playerWins = 0;
    playerLosses = 0;
  } else if (playerLosses >= 3) {
    moneyScore -= REWARD_AMOUNT;
    scoreAmountEl.textContent = moneyScore;

    // Trigger Glitch & Screen Edge Aura
    document.body.classList.add('screen-lose');
    cyberHud.classList.add('glitch-lose');
    scoreDisplay.classList.add('glitch-lose');

    // Remove Screen Outline independently after LOSE_OUTLINE_DURATION
    setTimeout(() => {
      document.body.classList.remove('screen-lose');
    }, LOSE_OUTLINE_DURATION);

    // Wait for Glitch Duration to finish
    await wait(LOSE_GLITCH_DURATION);

    // Stop Glitch Effects
    cyberHud.classList.remove('glitch-lose');
    scoreDisplay.classList.remove('glitch-lose');

    const loseLine = document.createElement('p');
    loseLine.className = 'log-line log-lose';
    commandHistory.appendChild(loseLine);
    await typeLine(loseLine, `>>> SYSTEM LOCKDOWN IMMINENT! TRACE COMPLETE. PENALTY: -$${REWARD_AMOUNT}. RESETTING COUNTERS...`);

    playerWins = 0;
    playerLosses = 0;
  }

  commandInput.disabled = false;
  commandInput.focus();
  commandHistory.scrollTop = commandHistory.scrollHeight;
}

// Event Listeners
commandInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const inputVal = commandInput.value.trim();
    if (inputVal !== '') {
      commandInput.value = '';
      handleCommandSubmit(inputVal);
    }
  }
});

startBtn.addEventListener('click', () => {
  laptopTerminal.scrollIntoView({ behavior: 'smooth' });

  setTimeout(() => {
    cyberHud.classList.add('visible');

    setTimeout(() => {
      startTypewriterEffect();
    }, 500);

  }, 800); 
});