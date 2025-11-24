const floatingBackground = document.querySelector(".floating-background");
const startButton = document.querySelector(".start-button");
const logo = document.querySelector(".logo");
const hero = document.querySelector(".hero");
const storyScreen = document.querySelector(".story-screen");
const dialogueText = document.querySelector(".dialogue-text");
const speakerName = document.querySelector(".speaker-name");
const navButtons = document.querySelectorAll(".nav-button");
const progressDots = document.querySelector(".progress-dots");

const dialogues = [
  {
    speaker: "蛋米特",
    text: "我是一位廚師，因為到了30歲依舊母胎單身，因此獲得了魔法，成為魔法廚師。",
  },
  {
    speaker: "蛋米特",
    text: "剛成為魔法師的我去霍格滑茲就讀，目前已經畢業1年了，但畢業後一直不知道要做什麼，直到有一天突然靈機一動想把料理和魔法結合（內心os:哈哈哈，我怎麼這麼聰明） ",
  },
  {
    speaker: "蛋米特",
    text: "於是開始嘗試用超市買來最便宜的米特蛋製作料理，為了這件事，還特別跑到卡斯頭賣場尋找一些材料來完成心目中的魔法料理",
  },
];

let currentLine = 0;

function createBubbles(count = 18) {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const bubble = document.createElement("span");
    bubble.className = "bubble";
    const size = Math.random() * 120 + 60;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${Math.random() * 100}%`;
    bubble.style.top = `${Math.random() * 100}%`;
    bubble.style.setProperty("--duration", `${6 + Math.random() * 6}s`);
    bubble.style.setProperty("--shift-x", `${Math.random() * 40 - 20}px`);
    bubble.style.setProperty("--rotate", `${Math.random() * 12 - 6}deg`);

    const squircle = `${40 + Math.random() * 40}% ${30 + Math.random() * 50}% ${
      35 + Math.random() * 40
    }% ${30 + Math.random() * 50}% / ${50 + Math.random() * 30}% ${
      40 + Math.random() * 40
    }% ${40 + Math.random() * 40}% ${50 + Math.random() * 30}%`;
    bubble.style.borderRadius = squircle;

    bubble.style.animationDelay = `${Math.random() * 4}s`;
    frag.appendChild(bubble);
  }
  floatingBackground.appendChild(frag);
}

function addButtonPress() {
  startButton.addEventListener("pointerdown", () => {
    startButton.style.transform = "translateY(2px) scale(0.98)";
  });

  startButton.addEventListener("pointerup", () => {
    startButton.style.transform = "";
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

function buildProgressDots() {
  const frag = document.createDocumentFragment();
  dialogues.forEach((_, idx) => {
    const dot = document.createElement("span");
    dot.className = "dot";
    dot.dataset.index = idx;
    frag.appendChild(dot);
  });
  progressDots.appendChild(frag);
}

function updateDialogue() {
  const { speaker, text } = dialogues[currentLine];
  speakerName.textContent = speaker;
  dialogueText.textContent = text;
  progressDots.querySelectorAll(".dot").forEach((dot, idx) => {
    dot.classList.toggle("active", idx === currentLine);
  });

  navButtons.forEach((button) => {
    const step = button.dataset.step;
    if (step === "prev") {
      button.disabled = currentLine === 0;
    }
    if (step === "next") {
      button.textContent =
        currentLine === dialogues.length - 1 ? "開始冒險" : "下一句";
    }
  });
}

function showStoryScreen() {
  hero.classList.add("hidden");
  storyScreen.hidden = false;
  updateDialogue();
}

function handleNavigation(event) {
  const step = event.currentTarget.dataset.step;
  if (step === "prev" && currentLine > 0) {
    currentLine -= 1;
  } else if (step === "next") {
    if (currentLine < dialogues.length - 1) {
      currentLine += 1;
    }
  }
  updateDialogue();
}

createBubbles();
addButtonPress();
gentlyPulseLogo();
buildProgressDots();

startButton.addEventListener("click", showStoryScreen);
navButtons.forEach((button) =>
  button.addEventListener("click", handleNavigation)
);
