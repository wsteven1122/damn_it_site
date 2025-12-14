// =========================================
//  1. 數據配置 (Ingredients & Eggs)
// =========================================

const eatSfx = new Audio("./sfx/eat.mp3");
eatSfx.volume = 0.8; // 音量 0~1，看你喜歡

const EGG_IDLE_SRC = "./img/待機蛋 (去背).gif"; // 待機動畫
const EGG_EAT_SRC = "./img/egg_eat.gif"; // 吃東西動畫

const EGG_EAT_DURATION = 2000; // ← 改成你 GIF 實際長度（毫秒）

const ingredientPositions = [
  { top: "61%", left: "50%" }, // 1. 隕石（中偏左，上排）
  { top: "70%", left: "67%" }, // 2. 魷魚（最右，上排）
  { top: "75%", left: "53%" }, // 3. 衣服（右下）
  { top: "57%", left: "62%" }, // 4. 香菜（中偏右，上排）
  { top: "61%", left: "38%" }, // 5. 檸檬（中間，上排）
  { top: "55%", left: "24%" }, // 6. 榴蓮（最左，上排）
  { top: "77%", left: "40%" }, // 7. TNT（中下）
  { top: "73%", left: "24%" }, // 8. 手機（左下）
];

// 食材清單 (對應 ID)
// 1:隕石, 2:魷魚, 3:衣服, 4:香菜, 5:檸檬, 6:榴蓮, 7:TNT, 8:手機
const ingredients = [
  { id: 1, img: "recipe_rock.png", name: "隕石" },
  { id: 2, img: "recipe_squid.png", name: "魷魚" },
  { id: 3, img: "recipe_pants.png", name: "衣服" },
  { id: 4, img: "recipe_vagetable.png", name: "香菜" },
  { id: 5, img: "recipe_lemon.png", name: "檸檬" },
  { id: 6, img: "recipe_ruit.png", name: "榴蓮" },
  { id: 7, img: "recipe_tnt.png", name: "炸藥" },
  { id: 8, img: "recipe_iphone17.png", name: "手機" },
];

// 請用這段取代 script.js 最上面的 eggs 陣列，確保圖片讀得到
const eggs = [
  { id: "bird", name: "鳥蛋", cost: "1450", img: "birdegg.png", locked: true },
  {
    id: "gold",
    name: "黃金蛋",
    cost: "114514",
    img: "goldenegg.png",
    locked: true,
  },
  {
    id: "meat",
    name: "米特蛋",
    cost: "10",
    img: "egg.png", // 你原本叫 egg.png
    locked: false,
  },
  {
    id: "evil",
    name: "邪惡蛋",
    cost: "???",
    img: "evilegg.png",
    locked: true,
  },
  {
    id: "dino",
    name: "黑幫蛋",
    cost: "9999",
    img: "mafiaegg.png", // 你原本叫 mafiaegg.png
    locked: true,
  },
];

// =========================================
//  2. 結局資料庫 (Recipe Database)
//  KEY = "ID-ID-ID" (由小到大排序)
// =========================================
const recipes = {
  // --- 隕石 (1) 系列 ---
  "1-2-3": { name: "魅力觸手怪", img: "魅力觸手怪.png" },
  "1-2-4": { name: "香菜盆栽", img: "香菜盆栽.png" },
  "1-2-6": { name: "流星鎚", img: "流星鎚.png" },
  "1-2-5": { name: "手機支架", img: "手機支架.png" }, // 註：原文清單可能是 1-2-8? 這裡依據你提供的文字 "隕石、魷魚、檸檬" -> 1,2,5
  "1-2-8": { name: "氛圍燈", img: "氛圍燈.png" },
  "1-2-7": { name: "噴火拉麵", img: "噴火拉麵.png" },

  "1-3-4": { name: "石頭火鍋", img: "石頭火鍋.png" },
  "1-4-6": { name: "QNC臭臭鍋", img: "QNC臭臭鍋.png" },
  "1-4-5": { name: "煞氣☆土地公沙拉乂", img: "煞氣蛋.png" },
  "1-4-8": { name: "鼻子蛋捲", img: "鼻子蛋捲.png" },
  "1-4-7": { name: "盧媽媽蛋餅", img: "盧媽媽蛋餅.png" },

  "1-6-5": { name: "隕石貢丸米粉", img: "隕石貢丸米粉.png" },
  "1-6-8": { name: "台指數炸彈", img: "台指數炸彈.png" },
  "1-6-7": { name: "地雷系蛋", img: "地雷系蛋.png" },

  // --- 魷魚 (2) 系列 ---
  "2-3-4": { name: "香菜冰淇淋", img: "香菜冰淇淋.png" },
  "2-3-6": { name: "燃燒吧!!布羅利石頭", img: "燃燒吧布羅利石頭.png" },
  "2-3-5": { name: "魷夠派", img: "魷夠派.png" },
  "2-3-8": { name: "潮魷", img: "潮魷.png" },
  "2-3-7": { name: "黑人問號", img: "黑人問號.png" },

  "2-4-6": { name: "流浪漢蛋", img: "流浪漢蛋.png" },
  "2-4-5": { name: "Dora", img: "Dora.png" },
  "2-4-8": { name: "Oiiai cat", img: "Oiiaicat.png" },
  "2-4-7": { name: "魷魚燒", img: "魷魚燒.png" },

  "2-6-5": { name: "魷魚檸檬汁", img: "魷魚檸檬汁.png" },
  "2-6-8": { name: "大Boss", img: "大Boss.png" },
  "2-6-7": { name: "魷魚翻身", img: "魷魚翻身.png" },

  "2-5-8": { name: "憂鬱檸檬", img: "憂鬱檸檬.png" },
  "2-5-7": { name: "章魚哥", img: "火爆章魚哥.png" },
  "2-8-7": { name: "Ecraft", img: "Ecraft.png" },

  // --- 衣服 (3) 系列 ---
  "3-4-6": { name: "防毒面具", img: "防毒面具.png" },
  "3-4-5": { name: "檸矇公爵", img: "檸矇公爵.png" },
  "3-4-8": { name: "應援", img: "應援蛋.png" },
  "3-4-7": { name: "香菜鴨", img: "香菜鴨.png" },

  "3-6-5": { name: "章家檸檬綠茶", img: "章家檸檬綠茶.png" },
  "3-6-8": { name: "防摔手機殼", img: "防摔手機殼.png" },
  "3-6-7": { name: "暴躁雞蛋糕", img: "暴躁雞蛋糕.png" },

  // --- 香菜 (4) 系列 ---
  "4-6-5": { name: "野原廣志的襪子", img: "野原廣志的襪子.png" },
  "4-6-8": { name: "香菜榴槤洋芋片", img: "香菜榴槤洋芋片.png" },
  "4-6-7": { name: "生化武器", img: "生化武器.png" },

  "4-5-8": { name: "香菜檸檬蛋糕", img: "香菜檸檬蛋糕.png" },
  "4-5-7": { name: "爆辣螺獅粉", img: "爆辣螺獅粉.png" },
  "4-8-7": { name: "外星蛋", img: "外星蛋.png" },

  // --- 其他組合 ---
  "6-5-8": { name: "海膽", img: "海膽.png" },
  "6-5-7": { name: "一個跳舞的印度大叔", img: "印度大叔.png" },
  "6-8-7": { name: "核武器按鈕", img: "核武器按鈕.png" },
  "5-8-7": { name: "地獄跳跳糖", img: "地獄跳跳糖.png" },

  "1-3-6": { name: "宇航員臭鼬", img: "宇航員臭鼬.png" },
  "3-5-7": { name: "邪惡蟲蟲蛋糕", img: "邪惡蟲蟲蛋糕.png" },

  // --- 廚餘系列 (統一圖片 result_fail.png) ---
  "1-3-8": { name: "廚餘", img: "result_fail.png", isFail: true },
  "1-3-7": { name: "廚餘", img: "result_fail.png", isFail: true },
  "1-3-5": { name: "廚餘", img: "result_fail.png", isFail: true },
  "1-8-7": { name: "廚餘", img: "result_fail.png", isFail: true }, // 修正：隕石 手機 TNT
  "1-5-8": { name: "廚餘", img: "result_fail.png", isFail: true },
  "1-5-7": { name: "廚餘", img: "result_fail.png", isFail: true },
  "3-8-7": { name: "廚餘", img: "result_fail.png", isFail: true },
  "3-5-8": { name: "廚餘", img: "result_fail.png", isFail: true },
};

// 記錄已解鎖的圖鑑 (用 localStorage 存起來，刷新不會不見)
let unlockedRecipes =
  JSON.parse(localStorage.getItem("eggMagic_unlocked")) || [];

// =========================================
//  3. 狀態管理與 DOM
// =========================================
let state = {
  selectedEgg: null,
  chosenIngredients: [],
  soundOn: true,
};

const pages = {
  home: document.getElementById("page-home"),
  story: document.getElementById("page-story"),
  select: document.getElementById("page-select"),
  game: document.getElementById("page-game"),
  result: document.getElementById("page-result"),
  gallery: document.getElementById("page-gallery"),
};
const hands = {
  story: document.getElementById("hands-story"),
  select: document.getElementById("hands-select"),
};

// =========================================
//  4. 初始化
// =========================================
document.addEventListener("DOMContentLoaded", () => {
  initHome();
  initSelect();
  initGame();
  initTopUI();
});

// --- 首頁 ---
function initHome() {
  document.getElementById("start-btn").addEventListener("click", () => {
    scrollTransition(pages.home, pages.story);
    setTimeout(() => startStory(), 800);
    document.getElementById("btn-home").style.display = "block";
  });

  // 綁定回首頁
  document.getElementById("btn-home").onclick = () => {
    location.reload(); // 最簡單的回首頁方式
  };
}

// --- 故事 ---
const storyLines = [
  "我是一位廚師，因為到了30歲依舊母胎單身，因此獲得魔法成為了魔法廚師。",
  "在因緣巧合之下，剛成為魔法師的我很幸運地拿到了霍格滑茲的入學offer，在一年前順利畢業，但畢業後一直不知道要繼續做什麼。",
  "直到上周六晚上做飯的時候突然福至心靈，想到要是我把魔法用在這些食材上會怎麽樣？ （內心os:哈哈哈，我怎麼這麼聰明）",
  "於是，我開始嘗試去超市買來最便宜的米特蛋製作料理，鷄蛋嘛，怎麽做都不會出錯的。",
  "為了我的大業，我還特別跑到十公里外的卡斯頭賣場找來一些魔法材料來製作這個魔法料理實驗。",
  "至於會做出什麼成品嗎……我告訴你，我也不知道。",
  "事不宜遲，馬上開始行動！",
];

function startStory() {
  hands.story.classList.add("hands-show");
  const container = document.querySelector(".chat-container");
  container.innerHTML = "";
  let idx = 0;
  let speed = 1500;

  const btnSkip = document.getElementById("btn-skip");
  const btnGo = document.getElementById("btn-go");

  // 每次進來重置按鈕
  btnSkip.style.display = "block";
  btnGo.style.display = "none";

  function showNext() {
    if (idx >= storyLines.length) {
      btnSkip.style.display = "none";
      btnGo.style.display = "block";
      return;
    }
    const div = document.createElement("div");
    div.className = `chat-bubble bubble-${Math.min(idx + 1, 6)}`; // 防止超過樣式
    div.innerText = storyLines[idx];
    container.appendChild(div);

    setTimeout(() => div.classList.add("show"), 50);
    idx++;

    // 自動播放邏輯
    if (idx < storyLines.length) {
      window.storyTimer = setTimeout(showNext, speed);
    } else {
      btnSkip.style.display = "none";
      btnGo.style.display = "block";
    }
  }

  window.storyTimer = setTimeout(showNext, 500);

  btnSkip.onclick = () => {
    speed = 100; // 加速
  };

  btnGo.onclick = () => {
    scrollTransition(pages.story, pages.select);
    setTimeout(() => {
      hands.story.classList.remove("hands-show");
      hands.select.classList.add("hands-show");
    }, 500);
  };
}

// --- 選擇蛋 (含拖曳功能) ---
// --- 選擇蛋 (3D 輪播 + 自動吸附版) ---
function initSelect() {
  const carousel = document.getElementById("egg-carousel");
  const btnChoose = document.getElementById("btn-choose-food");

  // 清空內容
  carousel.innerHTML = "";

  // 1. 生成卡片
  eggs.forEach((egg) => {
    const el = document.createElement("div");
    el.className = "egg-card";
    // 這裡不用預設 active，交給下面的滾動邏輯判斷
    el.dataset.id = egg.id; // 綁定 ID 以便查詢

    el.innerHTML = `
            <div class="egg-tag">${egg.locked ? "未解鎖" : "可選購"}</div>
            <img src="./img/${egg.img}" class="egg-img" draggable="false"> 
            <h3>${egg.name}</h3>
            <p>價格: ${egg.cost}</p>
        `;

    // 點擊卡片時，自動捲動到該卡片
    el.addEventListener("click", () => {
      scrollToCard(el);
    });

    carousel.appendChild(el);
  });

  // 2. 核心：滾動時計算縮放 (3D效果)
  function updateCarousel() {
    const center = carousel.offsetWidth / 2;
    const cards = document.querySelectorAll(".egg-card");
    let closestCard = null;
    let minDist = Infinity;

    cards.forEach((card) => {
      // 計算卡片中心點相對於視窗的位置
      const cardCenter =
        card.offsetLeft + card.offsetWidth / 2 - carousel.scrollLeft;

      // 計算距離中心的絕對值
      const dist = Math.abs(cardCenter - center);

      // 縮放公式：距離越近 scale 越大 (最大 1.2, 最小 0.8)
      // 500 是一個參數，控制縮放的敏感度
      let scale = 1.2 - dist / 500;
      if (scale < 0.8) scale = 0.8;

      card.style.transform = `scale(${scale})`;

      // 找出距離中心最近的那張卡
      if (dist < minDist) {
        minDist = dist;
        closestCard = card;
      }
    });

    // 處理「選中狀態」
    if (closestCard) {
      document
        .querySelectorAll(".egg-card")
        .forEach((c) => c.classList.remove("active"));
      closestCard.classList.add("active");

      // 只有中間是米特蛋時，按鈕才有效
      if (closestCard.dataset.id === "meat") {
        btnChoose.classList.remove("disabled");
        state.selectedEgg = "meat";
      } else {
        btnChoose.classList.add("disabled");
        state.selectedEgg = null;
      }
    }
  }

  // 綁定滾動事件
  carousel.addEventListener("scroll", updateCarousel);
  // 初始化執行一次
  setTimeout(updateCarousel, 100);

  // 3. 初始定位：直接捲動到米特蛋 (假設是第3顆，index 2)
  // 要稍微延遲，等 CSS 渲染完
  setTimeout(() => {
    const meatCard = carousel.children[2]; // 0:鳥, 1:金, 2:米特
    if (meatCard) scrollToCard(meatCard);
  }, 200);

  // 輔助函式：捲動到特定卡片
  function scrollToCard(card) {
    const center = carousel.offsetWidth / 2;
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    carousel.scrollTo({
      left: cardCenter - center,
      behavior: "smooth",
    });
  }

  // 4. 滑鼠拖曳邏輯 (保留並優化)
  let isDown = false;
  let startX;
  let scrollLeft;

  carousel.addEventListener("mousedown", (e) => {
    isDown = true;
    carousel.classList.add("dragging");
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
  });
  carousel.addEventListener("mouseleave", () => {
    isDown = false;
    carousel.classList.remove("dragging");
    snapToNearest(); // 離開時吸附
  });
  carousel.addEventListener("mouseup", () => {
    isDown = false;
    carousel.classList.remove("dragging");
    snapToNearest(); // 放開時吸附
  });
  carousel.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 2; // 拖曳速度
    carousel.scrollLeft = scrollLeft - walk;
  });

  // 自動吸附到最近的卡片
  function snapToNearest() {
    // 延遲一點點，讓慣性跑一下再吸附，體驗比較好
    setTimeout(() => {
      const center = carousel.offsetWidth / 2;
      const cards = document.querySelectorAll(".egg-card");
      let closest = null;
      let min = Infinity;

      cards.forEach((card) => {
        const cardCenter =
          card.offsetLeft + card.offsetWidth / 2 - carousel.scrollLeft;
        const dist = Math.abs(cardCenter - center);
        if (dist < min) {
          min = dist;
          closest = card;
        }
      });

      if (closest) {
        scrollToCard(closest);
      }
    }, 50);
  }

  // 按鈕事件
  btnChoose.addEventListener("click", () => {
    if (state.selectedEgg === "meat") {
      playCurtainTransition(() => {
        pages.select.style.display = "none";
        pages.game.style.display = "block";
        hands.select.classList.remove("hands-show");
        resetGame();
      });
    }
  });
}

// 滑鼠拖曳邏輯
let isDown = false;
let startX;
let scrollLeft;

carousel.addEventListener("mousedown", (e) => {
  isDown = true;
  carousel.classList.add("dragging");
  startX = e.pageX - carousel.offsetLeft;
  scrollLeft = carousel.scrollLeft;
});
carousel.addEventListener("mouseleave", () => {
  isDown = false;
  carousel.classList.remove("dragging");
});
carousel.addEventListener("mouseup", () => {
  isDown = false;
  carousel.classList.remove("dragging");
});
carousel.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - carousel.offsetLeft;
  const walk = (x - startX) * 2;
  carousel.scrollLeft = scrollLeft - walk;
});

btnChoose.addEventListener("click", () => {
  if (state.selectedEgg === "meat") {
    playCurtainTransition(() => {
      pages.select.style.display = "none";
      pages.game.style.display = "block";
      hands.select.classList.remove("hands-show");
      resetGame();
    });
  }
});

// --- 遊戲邏輯 ---
function initGame() {
  const pool = document.getElementById("ingredients-pool");
  const slots = document.querySelectorAll(".slot");
  const btnMagic = document.getElementById("btn-magic");
  const gameTip = document.getElementById("game-tip");

  gameTip.onclick = () => (gameTip.style.display = "none");

  // 生成食材
  ingredients.forEach((ing, index) => {
    const img = document.createElement("img");
    img.src = `./img/${ing.img}`;
    img.className = "ingredient";
    const pos = ingredientPositions[index];
    img.style.position = "absolute";
    img.style.top = pos.top;
    img.style.left = pos.left;
    img.dataset.id = ing.id;

    img.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", ing.id);
      e.dataTransfer.effectAllowed = "move";
    });

    // 手機版點擊也可添加
    img.addEventListener("click", () => addIngredient(ing.id));
    pool.appendChild(img);
  });

  // 放置區
  const eggArea = document.getElementById("main-egg");
  eggArea.addEventListener("dragover", (e) => e.preventDefault());
  eggArea.addEventListener("drop", (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    addIngredient(parseInt(id));
  });

  btnMagic.addEventListener("click", () => {
    playCurtainTransition(showResult);
  });
}

// 播放喂食音效（如果有做靜音開關，可以一起判斷）
try {
  // 如果你有 state.isMuted 或類似變數，可以這樣寫：
  // if (!state.isMuted) {
  eatSfx.currentTime = 0; // 每次從頭播
  eatSfx.play();
  // }
} catch (e) {
  console.warn("eatSfx 播放失敗：", e);
}

// 切成吃東西的 GIF
egg.src = EGG_EAT_SRC;

// 如果你的 state 物件沒有 eggTimer，先在一開始加： state.eggTimer = null;

function addIngredient(id) {
  if (state.chosenIngredients.length >= 3) return;
  if (state.chosenIngredients.includes(id)) return;

  state.chosenIngredients.push(id);
  updateSlots();

  const egg = document.getElementById("main-egg");

  // 先清掉舊的計時器（避免連續餵食卡住）
  if (state.eggTimer) {
    clearTimeout(state.eggTimer);
    state.eggTimer = null;
  }

  // 切成吃東西的 GIF
  egg.src = EGG_EAT_SRC;

  // 等 GIF 播完才換回待機蛋
  state.eggTimer = setTimeout(() => {
    egg.src = EGG_IDLE_SRC;
    state.eggTimer = null;
  }, EGG_EAT_DURATION);

  // 下面原本你 addIngredient 裡的其他邏輯（例如顯示按鈕之類）照舊放就好
}

function removeIngredient(index) {
  if (state.chosenIngredients[index]) {
    const id = state.chosenIngredients[index];
    state.chosenIngredients.splice(index, 1);

    document.querySelectorAll(".ingredient").forEach((el) => {
      if (el.dataset.id == id) el.classList.remove("used");
    });
    updateSlots();
  }
}

function updateSlots() {
  const slots = document.querySelectorAll(".slot");
  const btnMagic = document.getElementById("btn-magic");

  slots.forEach((slot, i) => {
    const id = state.chosenIngredients[i];
    const removeBtn = slot.querySelector(".slot-remove");

    // 清空
    slot.innerHTML = "";

    if (id) {
      const ingData = ingredients.find((x) => x.id === id);
      slot.innerHTML = `<img src="./img/${ingData.img}"><div class="slot-remove">x</div>`;

      // 重新綁定移除事件
      slot.querySelector(".slot-remove").onclick = (e) => {
        e.stopPropagation();
        removeIngredient(i);
      };
    } else {
      slot.innerHTML = `<div class="slot-remove">x</div>`;
    }
  });

  if (state.chosenIngredients.length === 3) {
    btnMagic.style.display = "block";
  } else {
    btnMagic.style.display = "none";
  }
}

function resetGame() {
  state.chosenIngredients = [];
  updateSlots();
  document
    .querySelectorAll(".ingredient")
    .forEach((el) => el.classList.remove("used"));
  document.getElementById("btn-magic").style.display = "none";
}

// =========================================
//  5. 結果與圖鑑系統 (核心修改)
// =========================================
function showResult() {
  pages.game.style.display = "none";
  pages.result.style.display = "block";

  // 1. 將選中的 ID 排序 (確保 1-2-3 和 3-2-1 是一樣的)
  const sortedIds = [...state.chosenIngredients].sort((a, b) => a - b);
  const comboKey = sortedIds.join("-"); // 變成 "1-2-3" 這種格式

  // 2. 查找配方
  let result = recipes[comboKey];

  // 3. 防呆：如果找不到配方 (應該不會發生)，給個預設值
  if (!result) {
    result = { name: "未知物體", img: "result_fail.png", isFail: true };
  }

  // 4. 解鎖並存檔
  if (!unlockedRecipes.includes(comboKey)) {
    unlockedRecipes.push(comboKey);
    localStorage.setItem("eggMagic_unlocked", JSON.stringify(unlockedRecipes));
  }

  // 5. 顯示畫面
  document.getElementById("result-img").src = `./img/${result.img}`;
  document.getElementById("result-name").innerText = result.name;
  document.getElementById("result-text").innerText = result.isFail
    ? "哎呀！好像變成了不可名狀的廚餘..."
    : "哇！大成功！這是新的食譜！";
  // 依是否為廚餘，切換對話框的背景圖
  const resultDialog = document.querySelector(".result-dialog");
  if (result.isFail) {
    resultDialog.classList.remove("success");
    resultDialog.classList.add("fail");
  } else {
    resultDialog.classList.remove("fail");
    resultDialog.classList.add("success");
  }

  // 按鈕
  document.getElementById("btn-res-retry").onclick = () => {
    playCurtainTransition(() => {
      pages.result.style.display = "none";
      pages.game.style.display = "block";
      resetGame();
    });
  };
  document.getElementById("btn-res-book").onclick = () => {
    playCurtainTransition(() => {
      pages.result.style.display = "none";
      renderGallery();
      pages.gallery.style.display = "block";
    });
  };
}

function renderGallery() {
  const grid = document.getElementById("gallery-grid");
  grid.innerHTML = "";

  // 遍歷所有定義好的食譜
  Object.keys(recipes).forEach((key) => {
    const recipe = recipes[key];
    const isUnlocked = unlockedRecipes.includes(key);

    const card = document.createElement("div");
    card.className = "gallery-card";

    if (isUnlocked) {
      // 顯示已解鎖內容
      // 還原食材圖片
      const ingIds = key.split("-");
      const ingHtml = ingIds
        .map((id) => {
          const ing = ingredients.find((i) => i.id == id);
          return `<img src="./img/${ing.img}" class="mini-ing">`;
        })
        .join("");

      card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front">
                        <img src="./img/${recipe.img}" class="card-img">
                        <div class="card-name">${recipe.name}</div>
                    </div>
                    <div class="card-back">
                        <p>配方：</p>
                        <div class="card-ingredients">${ingHtml}</div>
                    </div>
                </div>
            `;
      card.onclick = () => card.classList.toggle("flipped");
    } else {
      // 顯示未解鎖
      card.innerHTML = `
                <div class="card-inner">
                    <div class="card-front" style="background:#eee; justify-content:center;">
                        <div style="font-size:30px; color:#aaa;">?</div>
                        <div class="card-name">???</div>
                    </div>
                </div>
            `;
    }
    grid.appendChild(card);
  });

  document.getElementById("btn-gallery-back").onclick = () => {
    playCurtainTransition(() => {
      pages.gallery.style.display = "none";
      pages.game.style.display = "block";
      resetGame();
    });
  };
}

// =========================================
//  6. 轉場與 UI
// =========================================
function scrollTransition(curr, next) {
  curr.classList.add("scrolled-up");
  curr.classList.remove("active-page");
  next.style.display = "flex";
  void next.offsetWidth; // Trigger Reflow
  next.classList.remove("hidden-page");
  next.classList.add("active-page");
}

function playCurtainTransition(callback) {
  const layer = document.getElementById("curtain-layer");
  layer.classList.add("curtains-closed");
  setTimeout(() => {
    if (callback) callback();
    setTimeout(() => {
      layer.classList.remove("curtains-closed");
    }, 500);
  }, 800);
}

function initTopUI() {
  const modal = document.getElementById("tutorial-modal");
  const btnHelp = document.getElementById("btn-tutorial");
  if (btnHelp && modal) {
    btnHelp.onclick = () => {
      modal.style.display = "flex";
    };
    const closeBtn = modal.querySelector(".close-btn");
    if (closeBtn)
      closeBtn.onclick = () => {
        modal.style.display = "none";
      };
    modal.onclick = (e) => {
      if (e.target === modal) modal.style.display = "none";
    };
  }
}
