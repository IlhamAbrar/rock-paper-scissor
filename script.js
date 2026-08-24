const startBtn = document.getElementById('start-btn');
const laptopTerminal = document.getElementById('terminal');
const cyberHud = document.querySelector('.hud-container');
const typewriterLines = document.querySelectorAll('.hud-body > .typewriter');

const inputContainer = document.getElementById('input-container');
const commandInput = document.getElementById('command-input');
const commandHistory = document.getElementById('command-history');

const choices = ['ice', 'quickhack', 'daemon'];

// Win matrix:
// ICE (Rock) beats QUICKHACK (Scissors)
// QUICKHACK (Scissors) beats DAEMON (Paper)
// DAEMON (Paper) beats ICE (Rock)
const rules = {
  ice: 'quickhack',
  quickhack: 'daemon',
  daemon: 'ice'
};

function typeLine(element, text, speed = 25) {
  return new Promise((resolve) => {
    let index = 0;
    element.textContent = '';

    // Transfer active cursor to current line
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

async function startTypewriterEffect() {
  for (const line of typewriterLines) {
    const textToType = line.getAttribute('data-text');
    if (!textToType) continue;
    await typeLine(line, textToType, 30);
  }

  // Reveal command input box
  inputContainer.classList.remove('hidden');
  setTimeout(() => {
    inputContainer.classList.add('visible');
    commandInput.focus();
  }, 50);
}

// Clean and sanitize string input
function sanitizeInput(rawInput) {
  return rawInput.toLowerCase().replace(/[^a-z]/g, '');
}

async function handleCommandSubmit(rawInput) {
  // Disable input immediately so the user can't send extra commands
  commandInput.disabled = true;

  const sanitized = sanitizeInput(rawInput);
  
  // Create output container for player's action
  const actionLine = document.createElement('p');
  actionLine.className = 'log-line';
  commandHistory.appendChild(actionLine);

  // Check for invalid choice
  if (!choices.includes(sanitized)) {
    await typeLine(actionLine, `> '${rawInput}' : COMMAND NOT FOUND. VALID PAYLOADS: ICE | QUICKHACK | DAEMON`);
    
    // Re-enable input and exit early for invalid command
    commandInput.disabled = false;
    commandInput.focus();
    commandHistory.scrollTop = commandHistory.scrollHeight;
    return;
  }

  // Generate bot selection
  const botChoice = choices[Math.floor(Math.random() * choices.length)];
  let resultText = `> INPUT: ${sanitized.toUpperCase()} || SYSTEM: ${botChoice.toUpperCase()} -> `;

  if (sanitized === botChoice) {
    resultText += 'COUNTER-PROTOCOL TIED. RETRYING...';
  } else if (rules[sanitized] === botChoice) {
    resultText += 'ACCESS GRANTED. BREACH SUCCESSFUL!';
  } else {
    resultText += 'TRACE DETECTED. BREACH FAILED!';
  }

  // Wait for the main result text to finish typing
  await typeLine(actionLine, resultText);

  // Re-enable input, restore focus, and scroll down
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