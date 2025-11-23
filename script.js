const floatingBackground = document.querySelector('.floating-background');
const startButton = document.querySelector('.start-button');
const logo = document.querySelector('.logo');

function createBubbles(count = 18) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const bubble = document.createElement('span');
    bubble.className = 'bubble';
    const size = Math.random() * 120 + 60;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.top = `${Math.random() * 100}%`;
    bubble.style.setProperty('--duration', `${6 + Math.random() * 6}s`);
    bubble.style.setProperty('--shift-x', `${Math.random() * 40 - 20}px`);
    bubble.style.setProperty('--rotate', `${Math.random() * 12 - 6}deg`);

    const squircle = `${40 + Math.random() * 40}% ${30 + Math.random() * 50}% ${35 +
      Math.random() * 40}% ${30 + Math.random() * 50}% / ${50 + Math.random() * 30}% ${
      40 + Math.random() * 40
    }% ${40 + Math.random() * 40}% ${50 + Math.random() * 30}%`;
    bubble.style.borderRadius = squircle;

    bubble.style.animationDelay = `${Math.random() * 4}s`;
    frag.appendChild(bubble);
  }
  floatingBackground.appendChild(frag);
}

function addButtonPress() {
  startButton.addEventListener('pointerdown', () => {
    startButton.style.transform = 'translateY(2px) scale(0.98)';
  });

  startButton.addEventListener('pointerup', () => {
    startButton.style.transform = '';
  });
}

function gentlyPulseLogo() {
  let direction = 1;
  setInterval(() => {
    const scale = 1 + direction * 0.01;
    logo.style.transform = `scale(${scale})`;
    direction *= -1;
  }, 1600);
}

createBubbles();
addButtonPress();
gentlyPulseLogo();
