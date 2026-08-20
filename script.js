const startBtn = document.getElementById('start-btn');
const laptopTerminal = document.getElementById('laptop-terminal');
const laptopImg = document.querySelector('.laptop-img');

startBtn.addEventListener('click', () => {
  // 1. Smoothly scroll down to the empty desk
  laptopTerminal.scrollIntoView({ 
    behavior: 'smooth' 
  });

  // 2. Wait 1000ms (1 second) for the scroll to finish, then fade in the laptop
  setTimeout(() => {
    laptopImg.classList.add('visible');
  }, 1000); 
});