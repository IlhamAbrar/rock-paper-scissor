const cyberTerminal = document.getElementById('terminal');
const cyberHud = document.querySelector('.hud-container');
const scoreDisplay = document.getElementById('score-display');
const typewriterLines = document.querySelectorAll('.hud-body > .typewriter');

const inputContainer = document.getElementById('input-container');
const commandInput = document.getElementById('command-input');
const commandHistory = document.getElementById('command-history');

// Hero Controls Setup
const diffBtns = document.querySelectorAll('.diff-btn');
const initiateBtn = document.getElementById('initiate-btn');
let currentDifficulty = 'medium'; // Default difficulty

// Typing Speed Constant (ms per character)
const TYPING_SPEED = 25;

// Score and Game Loop Tracking
const scoreAmountEl = document.getElementById('score-amount');
const REWARD_AMOUNT = 500;

// Glitch Durations
const WIN_GLITCH_DURATION = 800;   
const LOSE_GLITCH_DURATION = 1500; 

// Independent Screen Outline Durations (In Milliseconds)
const WIN_OUTLINE_DURATION = 3000;  
const LOSE_OUTLINE_DURATION = 3500; 

let moneyScore = 0;
let playerWins = 0;
let playerLosses = 0;

const choices = ['ice', 'hack', 'daemon'];

// Losing targets for playerChoice lookup (botChoice beats playerChoice)
const counterMoves = {
 ice: 'daemon',
  hack: 'ice',
  daemon: 'hack'
};

// Winning targets for playerChoice lookup (playerChoice beats botChoice)
const winningMoves = {
  ice: 'hack',
  hack: 'daemon',
  daemon: 'ice'
};

function getBotChoice(playerChoice) {
  const chance = Math.random(); // Generates number between 0.0 and 1.0

  if (currentDifficulty === 'hard') {
    // 50% Bot Win (chance > 0.50)
    if (chance > 0.50) {
      return counterMoves[playerChoice];
    }
    // 25% Tie (chance > 0.25 up to 0.50)
    if (chance > 0.25) {
      return playerChoice;
    }
    // 25% Player Win (chance 0.0 to 0.25)
    return winningMoves[playerChoice];
  }

  if (currentDifficulty === 'easy') {
    // 50% Player Win (chance > 0.50)
    if (chance > 0.50) {
      return winningMoves[playerChoice];
    }
    // 25% Tie (chance > 0.25 up to 0.50)
    if (chance > 0.25) {
      return playerChoice;
    }
    // 25% Bot Win (chance 0.0 to 0.25)
    return counterMoves[playerChoice];
  }

  // Medium Difficulty: 40% Tie | 30% Bot Win | 30% Player Win
  // 40% Tie (chance > 0.60)
  if (chance > 0.60) {
    return playerChoice;
  }
  // 30% Bot Win (chance > 0.30 up to 0.60)
  if (chance > 0.30) {
    return counterMoves[playerChoice];
  }
  // 30% Player Win (chance 0.0 to 0.30)
  return winningMoves[playerChoice];
}

function typeLine(element, text, speed = TYPING_SPEED, targetContainer = null) {
  return new Promise((resolve) => {
    let index = 0;
    // Use targetContainer if provided, otherwise default to the line element itself
    const container = targetContainer || element;

    if (!targetContainer) {
      element.textContent = '';
    }

    document.querySelectorAll('.active-line').forEach(el => el.classList.remove('active-line'));
    element.classList.add('active-line');

    function step() {
      if (index < text.length) {
        container.textContent += text.charAt(index);
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
    // Special handling for the dynamic diagnostic line
    if (line.id === 'diff-status-line') {
      const msg = difficultyMessages[currentDifficulty];
      
      // 1. Type the tag in standard terminal text (in this case its "[DIAGNOSTIC] ")
      await typeLine(line, msg.prefix, TYPING_SPEED);
      
      // 2. Pause for network scanning delay
      await wait(3000); 
      
      // 3. Create a styled span for the colored body text
      const coloredSpan = document.createElement('span');
      coloredSpan.className = `text-${currentDifficulty}`;
      line.appendChild(coloredSpan);

      // 4. Type the body text inside the styled span
      await typeLine(line, msg.body, TYPING_SPEED, coloredSpan); 
      continue;
    }

    // Standard behavior for all other lines
    const textToType = line.getAttribute('data-text');
    if (!textToType) continue;
    await typeLine(line, textToType, TYPING_SPEED);
  }

  // Reveal input line once intro completes
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
    await typeLine(actionLine, `> '${rawInput}' : COMMAND NOT FOUND. VALID PAYLOADS: ICE | HACK | DAEMON`);
    
    commandInput.disabled = false;
    commandInput.focus();
    commandHistory.scrollTop = commandHistory.scrollHeight;
    return;
  }

  // Generate move based on difficulty setting
  const botChoice = getBotChoice(sanitized);
  let resultText = `> INPUT: ${sanitized.toUpperCase()} || SYSTEM: ${botChoice.toUpperCase()} -> `;

  if (sanitized === botChoice) {
    resultText += `COUNTER-PROTOCOL TIED. RETRYING... [W:${playerWins}/3 | L:${playerLosses}/3]`;
  } else if (counterMoves[sanitized] === botChoice) {
    playerLosses++;
    resultText += `TRACE DETECTED. BREACH FAILED! [W:${playerWins}/3 | L:${playerLosses}/3]`;
    actionLine.classList.add('log-lose');
  } else {
    playerWins++;
    resultText += `ACCESS GRANTED. BREACH SUCCESSFUL! [W:${playerWins}/3 | L:${playerLosses}/3]`;
    actionLine.classList.add('log-win');
  }

  await typeLine(actionLine, resultText);

  // Game Loop Win / Gameover Checks
  if (playerWins >= 3) {
    moneyScore += REWARD_AMOUNT;
    scoreAmountEl.textContent = moneyScore;

    document.body.classList.add('screen-win');
    cyberHud.classList.add('glitch-win');
    scoreDisplay.classList.add('glitch-win');

    setTimeout(() => {
      document.body.classList.remove('screen-win');
    }, WIN_OUTLINE_DURATION);

    await wait(WIN_GLITCH_DURATION);

    cyberHud.classList.remove('glitch-win');
    scoreDisplay.classList.remove('glitch-win');

    const winLine = document.createElement('p');
    winLine.className = 'log-line log-win';
    commandHistory.appendChild(winLine);
    await typeLine(winLine, `>>> SYSTEM FULLY OVERRIDDEN! SIPHONING FUNDS TO OFFSHORE NODE: +$${REWARD_AMOUNT}. FLUSHING TRACE...`);

    playerWins = 0;
    playerLosses = 0;
  } else if (playerLosses >= 3) {
    moneyScore -= REWARD_AMOUNT;
    scoreAmountEl.textContent = moneyScore;

    document.body.classList.add('screen-lose');
    cyberHud.classList.add('glitch-lose');
    scoreDisplay.classList.add('glitch-lose');

    setTimeout(() => {
      document.body.classList.remove('screen-lose');
    }, LOSE_OUTLINE_DURATION);

    await wait(LOSE_GLITCH_DURATION);

    cyberHud.classList.remove('glitch-lose');
    scoreDisplay.classList.remove('glitch-lose');

    const loseLine = document.createElement('p');
    loseLine.className = 'log-line log-lose';
    commandHistory.appendChild(loseLine);
    await typeLine(loseLine, `>>> CRITICAL ALERT: SYSTEM LOCKDOWN IMMINENT! LOCAL VAULT SEIZED: -$${REWARD_AMOUNT}. FLUSHING SYSTEM...`);

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

// Difficulty Toggle Handler
diffBtns.forEach(btn => {
  btn.addEventListener('click', (e) => {
    // Remove all active theme classes from all buttons
    diffBtns.forEach(b => b.classList.remove('active-easy', 'active-medium', 'active-hard'));

    currentDifficulty = e.target.getAttribute('data-diff');

    // Add corresponding color class to selected button
    e.target.classList.add(`active-${currentDifficulty}`);
  });
});

// Cyberpunk System Messages (Split for 'scanning' delay)
const difficultyMessages = {
  easy: {
    prefix: "[DIAGNOSTIC] ",
    body: "VULNERABLE FIREWALL DETECTED. MINIMAL COUNTER-MEASURES. EXPLOIT AT WILL."
  },
  medium: {
    prefix: "[DIAGNOSTIC] ",
    body: "REINFORCED DEFENSIVE MESH DETECTED. EXPECT TACTICAL COUNTER-ROUTINES."
  },
  hard: {
    prefix: "[DIAGNOSTIC] ",
    body: "WARNING, COMPLEX SECURITY PROTOCOLS DETECTED. HIGH INTELLECT THREAT LEVEL. PROCEED WITH CAUTION."
  }
};

// Initiate Launch Handler
initiateBtn.addEventListener('click', () => {
  // Inject custom difficulty text into the second typewriter line
  const diffStatusLine = document.getElementById('diff-status-line');
  if (diffStatusLine) {
    diffStatusLine.setAttribute('data-text', difficultyMessages[currentDifficulty]);
  }

  cyberTerminal.scrollIntoView({ behavior: 'smooth' });

  setTimeout(() => {
    cyberHud.classList.add('visible');
    setTimeout(() => {
      startTypewriterEffect();
    }, 500);
  }, 800);
});