// =========================================================================
// I. 核心配置與資料 (Configuration and Data)
// =========================================================================

// 1. 定義八種基礎食材 (名稱必須與 HTML data-ingredient 屬性完全一致)
const BASE_INGREDIENTS = [
  "榴槤",
  "魷魚",
  "檸檬",
  "手機",
  "TNT",
  "香菜",
  "隕石",
  "服裝",
];

// 2. 配方數據庫：這裡存放 56 種結局設定
// 提示：網頁執行後，請按 F12 看 Console，我寫了一個功能會自動印出所有組合的 key，
// 你可以直接複製 Console 的內容貼回來這裡覆蓋。
const RECIPE_DATABASE = {
  // === 範例格式 ===
  // "手機+檸檬+榴槤": {
  //   title: "範例：檸檬手機殼",
  //   desc: "這是範例描述，請填寫你的文案。",
  //   image: "./img/待機蛋 (去背) 1.png",
  //   isTrash: false
  // },
  // ... 請使用 Console 生成的代碼填滿這裡
};

// 3. 預設結果 (當找不到配方時顯示)
const DEFAULT_RESULT = {
  title: "未知的米特蛋",
  desc: "這是一個未被記錄的神秘配方，產生了不可名狀的物體。",
  image: "./img/待機蛋 (去背) 1.png",
  isTrash: true,
};

const CONFIG = {
  TRANSITION_DURATION: 900,
  CURTAIN_CLOSE_MS: 420,
  CURTAIN_SHAKE_MS: 200,
  CURTAIN_OPEN_MS: 1100,
  MAX_INGREDIENTS: 3,
  INGREDIENT_IMAGES: {
    榴槤: "./img/榴槤.png",
    魷魚: "./img/魷魚.png",
    檸檬: "./img/檸檬.png",
    手機: "./img/手機.png",
    TNT: "./img/炸彈.png",
    香菜: "./img/香菜.png",
    隕石: "./img/石頭.png",
    服裝: "./img/褲子.png",
  },
  SFX_PROFILE: {
    uiTap: 520,
    drag: 420,
    drop: 620,
    success: 760,
    error: 280,
    tick: 180,
  },
  STORY_MESSAGES: [
    "我是一位廚師，因為到了30歲依舊母胎單身，因此獲得魔法成為了魔法廚師。",
    "在因緣巧合之下，我拿到了霍格滑茲的入學 offer，一年前順利畢業。",
    "直到上週六做飯時，我突然想到——如果把魔法用在食材上會怎麼樣？",
    "於是我買了蛋、米特蛋、還跑到十公里外的賣場找魔法材料。",
    "至於結果？我也不知道。",
    "事不宜遲，馬上開始行動！",
  ],
  GUIDE_FLOWS: {
    "screen-1": [
      {
        targetId: "lottie-start-btn",
        text: "點擊【開始遊戲】啟動冒險！",
        position: "right",
      },
      {
        targetId: "global-guide-btn",
        text: "隨時點擊【導覽】可查看教學。",
        position: "left",
      },
    ],
    "screen-2": [
      {
        targetId: "messages",
        text: "閱讀故事，搭配雙手動畫。",
        position: "right",
      },
      {
        targetId: "dialog-skip-btn",
        text: "按【跳過】直接開始。",
        position: "top",
      },
    ],
    "screen-5": [
      {
        targetId: "ingredient-tray",
        text: "拖曳 3 種食材到米特蛋上。",
        position: "top",
      },
      {
        targetId: "cast-spell-btn",
        text: "選好後按【MAGIC】開始煉成！",
        position: "top",
      },
    ],
    "screen-gallery": [
      {
        targetId: "floating-gallery-field",
        text: "這裡收藏了所有煉成結果，滑鼠移到卡片上可查看配方。",
        position: "left",
      },
    ],
  },
  // 預設導覽
  GUIDE_STEPS: [
    { targetId: "lottie-start-btn", text: "點擊開始遊戲", position: "right" },
  ],
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// =========================================================================
// II. 遊戲控制器類別 (GameController Class)
// =========================================================================

class GameController {
  constructor() {
    this.dom = this.getDOMElements();
    this.state = {
      isTransitioning: false,
      currentScreenId: "screen-1",
      selectedIngredients: new Set(),
      slotOrder: Array(CONFIG.MAX_INGREDIENTS).fill(null),
      selectedEgg: "米特蛋",
      isMuted: false,
      lottieInstances: {},
      unlockedRecipes: new Set(), // 記錄已解鎖的配方 Key
      resultPayload: null,
    };

    // 嘗試從 LocalStorage 讀取已解鎖圖鑑 (選用功能)
    this.loadProgress();

    this.loadModules(); // 載入模塊 (Dialog, Guide)
    this.init();
  }

  // ---------------------- DOM 初始化 ----------------------

  getDOMElements() {
    return {
      persistentUI: document.getElementById("persistent-ui"),
      screenOverlay: document.getElementById("screen-ui-overlay"),
      overlayLayers: document.querySelectorAll(".overlay-layer"),
      nextScreenBtns: document.querySelectorAll(".next-screen-btn"),
      ingredientTokens: document.querySelectorAll(".ingredient-token"),
      dropTarget: document.querySelector(".drop-target"),

      lottieTitleContainer: document.getElementById("lottie-title-container"),
      lottieStartBtn: document.getElementById("lottie-start-btn"),
      bgmAudio: document.getElementById("bgm-audio"),

      messagesContainer: document.getElementById("messages"),
      typingIndicator: document.getElementById("typingIndicator"),
      continueBtn: document.getElementById("continue-btn"),
      dialogSkipBtn: document.getElementById("dialog-skip-btn"),

      curtainLayer: document.getElementById("curtain-transition"),
      transformationSpace: document.querySelector(".transformation-space"),

      castingVideo: document.getElementById("casting-video"),
      skipVideoBtns: document.querySelectorAll(".skip-video-btn"),
      spinnerOverlay: document.getElementById("spinner-overlay"),

      resultTitle: document.getElementById("result-title"),
      resultDescription: document.getElementById("result-description"),
      resultImage: document.getElementById("result-main-image"),
      resultRarity: document.getElementById("result-rarity"),

      galleryField: document.getElementById("floating-gallery-field"),

      alertBox: document.getElementById("alert-message"),
      alertText: document.getElementById("alert-text"),
      alertIcon: document.getElementById("alert-icon"),

      volumeBtns: document.querySelectorAll(".volume-toggle"),
      guideBtns: document.querySelectorAll(".guide-trigger"),
      settingsBtns: document.querySelectorAll(
        "#settings-btn, [data-target='screen-settings']"
      ),

      guideOverlay: document.getElementById("guide-overlay"),
      guideFocusRing: document.getElementById("guide-focus-ring"),
      guideTooltip: document.getElementById("guide-tooltip"),
      tipText: document.getElementById("tip-text"),
      tipNextBtn: document.getElementById("tip-next-btn"),

      selectionSlots: document.querySelectorAll(".selection-slot"),
      castSpellBtn: document.getElementById("cast-spell-btn"),

      eggCards: document.querySelectorAll(".egg-card"),
      confirmEggBtn: document.getElementById("confirm-egg-btn"),

      sunEasterBtn: document.getElementById("sun-easter-btn"),
      sunHatchPopover: document.getElementById("sun-hatch-popover"),
      sunHatchClose: document.getElementById("sun-hatch-close"),
    };
  }

  init() {
    this.dom.persistentUI.style.display = "flex";
    document.body.dataset.activeScreen = this.state.currentScreenId;

    // 初始化隱藏幕簾
    if (this.dom.curtainLayer) {
      this.dom.curtainLayer.classList.remove("active", "open", "shudder");
      this.dom.curtainLayer.style.display = "none";
    }

    this.loadLottieAnimations();
    this.setupBackgroundMusic();
    this.seedHomeStars();
    this.setupSoundBoard();
    this.setupSunEasterEgg();
    this.initEventListeners();
    this.updateIngredientStatus();
    this.updateHandState(this.state.currentScreenId);
    this.updateOverlayLayers(this.state.currentScreenId);

    // ★ 開發輔助：在 Console 印出所有 56 種組合代碼供複製
    this.logAllCombinations();

    // 初始化圖鑑 (渲染所有卡片，未解鎖的顯示鎖定狀態)
    this.renderGallery();
  }

  // ---------------------- 開發輔助功能 ----------------------
  logAllCombinations() {
    console.log(
      "%c=== 煉蛋模擬器：配方代碼生成器 ===",
      "color: #ffb703; font-size: 16px; font-weight: bold;"
    );
    console.log("請複製以下內容並取代 script.js 中的 RECIPE_DATABASE 物件：");

    let output = "const RECIPE_DATABASE = {\n";
    const ing = BASE_INGREDIENTS;
    let count = 0;

    for (let i = 0; i < ing.length; i++) {
      for (let j = i + 1; j < ing.length; j++) {
        for (let k = j + 1; k < ing.length; k++) {
          const key = [ing[i], ing[j], ing[k]].sort().join("+");
          output += `  "${key}": {\n`;
          output += `    title: "結果 #${count + 1} (請修改)",\n`;
          output += `    desc: "這是由 ${ing[i]} + ${ing[j]} + ${ing[k]} 合成的結果，請填寫文案。",\n`;
          output += `    image: "./img/待機蛋 (去背) 1.png",\n`;
          output += `    isTrash: false\n`;
          output += `  },\n`;
          count++;
        }
      }
    }
    output += "};";
    console.log(output);
    console.log(
      `%c=== 已生成 ${count} 種組合代碼 ===`,
      "color: #ffb703; font-weight: bold;"
    );
  }

  // ---------------------- 核心流程控制 ----------------------

  switchScreens(nextScreenId) {
    let currentScreen = document.querySelector(".screen.active");
    let nextScreen = document.getElementById(nextScreenId);

    if (currentScreen && currentScreen.id !== nextScreenId) {
      currentScreen.classList.remove("active");
      currentScreen.classList.add("exiting");
      setTimeout(
        () => currentScreen.classList.remove("exiting"),
        CONFIG.TRANSITION_DURATION
      );
    }

    if (nextScreen) {
      nextScreen.classList.add("incoming");
      nextScreen.classList.add("active", "wave-enter");

      // 強制重繪以觸發 CSS 動畫
      void nextScreen.offsetWidth;
      nextScreen.classList.remove("incoming");

      setTimeout(
        () => nextScreen.classList.remove("wave-enter"),
        CONFIG.TRANSITION_DURATION + 180
      );
    }

    this.state.currentScreenId = nextScreenId;
    document.body.dataset.activeScreen = nextScreenId;
    this.updatePersistentUI(nextScreenId);
    this.updateSceneMood(nextScreenId);
    this.updateHandState(nextScreenId);
    this.updateOverlayLayers(nextScreenId);
  }

  updateSceneMood(screenId) {
    const kitchenScreens = ["screen-5", "screen-6"];
    document.body.classList.toggle(
      "scene-kitchen",
      kitchenScreens.includes(screenId)
    );
  }

  updatePersistentUI(screenId) {
    this.dom.persistentUI.style.display = "flex";
  }

  updateHandState(screenId) {
    // 在教學頁面 (screen-4) 雙手合十/隱藏
    const foldHands = screenId === "screen-4";
    document.body.classList.toggle("hands-folded", foldHands);
  }

  updateOverlayLayers(screenId) {
    if (!this.dom.overlayLayers?.length) return;

    let anyActive = false;
    this.dom.overlayLayers.forEach((layer) => {
      const shouldShow = layer.dataset.screen === screenId;
      layer.classList.toggle("active", shouldShow);
      layer.setAttribute("aria-hidden", shouldShow ? "false" : "true");
      if (shouldShow) anyActive = true;
    });

    if (this.dom.screenOverlay) {
      this.dom.screenOverlay.classList.toggle("active", anyActive);
      this.dom.screenOverlay.setAttribute(
        "aria-hidden",
        anyActive ? "false" : "true"
      );
      // 只有在顯示時才讓 Overlay 可點擊 (避免擋住下層)
      this.dom.screenOverlay.style.pointerEvents = anyActive ? "auto" : "none";
    }
  }

  setHandCursor(side = "left") {
    document.body.classList.toggle("hand-cursor-left", side === "left");
    document.body.classList.toggle("hand-cursor-right", side === "right");
  }

  clearHandCursor() {
    document.body.classList.remove("hand-cursor-left", "hand-cursor-right");
  }

  /** 執行畫面切換並處理特殊流程 */
  async performTransition(nextScreenId) {
    if (this.state.isTransitioning) return;
    this.state.isTransitioning = true;

    try {
      // 若是前往結果頁，先計算結果
      if (nextScreenId === "screen-7") {
        this.generateResult();
        await this.preloadImage(this.state.resultPayload?.image);
        this.renderResultPage();
      }

      // 播放轉場動畫 (上下捲動或幕簾)
      await this.switchScreens(nextScreenId); // 這裡使用 CSS scroll transition

      if (nextScreenId === "screen-2") {
        // 進入對話流程
        await this.Dialog.start();
        this.state.isTransitioning = false;
        // Dialog 結束後自動進入下一頁
        const nextTarget = this.dom.continueBtn.dataset.target || "screen-3";
        await this.performTransition(nextTarget);
        return;
      } else if (nextScreenId === "screen-6") {
        // 影片播放流程
        await this.handleVideoTransition();
      } else if (nextScreenId === "screen-7") {
        // 結果頁音效
        this.playSfxGroup("result");
        // 解鎖圖鑑並儲存
        if (this.state.resultPayload?.key) {
          this.state.unlockedRecipes.add(this.state.resultPayload.key);
          this.saveProgress();
          this.renderGallery(); // 更新圖鑑顯示
        }
      } else if (nextScreenId === "screen-1") {
        // 回到首頁重置
        this.resetGame();
      }
    } catch (error) {
      console.error(`轉場失敗到 ${nextScreenId}:`, error);
      this.showAlert("error", "轉場動畫或流程出錯了！");
    } finally {
      this.state.isTransitioning = false;
    }
  }

  // ---------------------- 核心邏輯：結果計算與圖鑑 ----------------------

  generateResult() {
    // 1. 取得當前選中的三個食材
    const currentIngredients = Array.from(this.state.selectedIngredients);

    // 如果不足 3 個 (防呆)，補上空字串以免報錯，但正常流程應被擋下
    while (currentIngredients.length < 3) currentIngredients.push("未知");

    // 2. 排序並組合成 Key (例如 "手機+檸檬+榴槤")，確保順序不影響結果
    const key = currentIngredients.sort().join("+");

    // 3. 從資料庫查找結果
    const resultData = RECIPE_DATABASE[key] || DEFAULT_RESULT;

    // 4. 存入暫存狀態供結果頁渲染
    this.state.resultPayload = {
      title: resultData.title,
      text: resultData.desc,
      image: resultData.image,
      rarity: resultData.isTrash ? "廚餘 (失敗)" : "成功", // 這裡可根據需求顯示 R/SR/SSR
      key: key,
    };
  }

  renderResultPage() {
    const payload = this.state.resultPayload;
    if (!payload) return;
    if (this.dom.resultTitle) this.dom.resultTitle.textContent = payload.title;
    if (this.dom.resultDescription)
      this.dom.resultDescription.textContent = payload.text;
    if (this.dom.resultImage) this.dom.resultImage.src = payload.image;
    if (this.dom.resultRarity)
      this.dom.resultRarity.textContent = payload.rarity;
  }

  // 動態生成圖鑑卡片 (56張)
  renderGallery() {
    if (!this.dom.galleryField) return;
    this.dom.galleryField.innerHTML = ""; // 清空現有內容

    const ing = BASE_INGREDIENTS;
    let index = 0;

    // 三層迴圈遍歷 C(8,3) = 56 種組合
    for (let i = 0; i < ing.length; i++) {
      for (let j = i + 1; j < ing.length; j++) {
        for (let k = j + 1; k < ing.length; k++) {
          const materials = [ing[i], ing[j], ing[k]];
          const key = materials.sort().join("+");

          // 取得資料庫中的設定，若無則用預設
          const recipe = RECIPE_DATABASE[key] || {
            ...DEFAULT_RESULT,
            title: "未知料理",
          };

          // 檢查是否已解鎖
          const isUnlocked = this.state.unlockedRecipes.has(key);

          // 建立卡片元素
          const article = document.createElement("article");
          // tilt-1, tilt-2, tilt-3 用於 CSS 製造拼貼歪斜感
          article.className = `gallery-card tilt-${(index % 3) + 1} ${
            isUnlocked ? "" : "locked"
          }`;
          article.setAttribute("role", "listitem");

          // 卡片內容
          let html = `
                    ${isUnlocked ? "" : '<div class="locked-mask">???</div>'}
                    <img src="${
                      isUnlocked ? recipe.image : "./img/待機蛋 (去背) 1.png"
                    }" alt="${recipe.title}" />
                    <div class="card-body">
                      <h3>${isUnlocked ? recipe.title : "尚未發現"}</h3>
                      ${
                        isUnlocked && recipe.isTrash
                          ? '<p style="color:#f44336;font-size:0.8rem;">(廚餘結局)</p>'
                          : ""
                      }
                    </div>
                `;

          // Hover 顯示合成素材 (即使鎖定也能看到需要什麼素材，或者你可以選擇隱藏)
          // 這裡設定：鎖定時也能看到素材提示 (降低難度)，若不想顯示可加判斷
          let hoverContent = `<div class="card-hover-popover">`;
          materials.forEach((mat) => {
            const imgSrc = CONFIG.INGREDIENT_IMAGES[mat];
            if (imgSrc) {
              hoverContent += `<img src="${imgSrc}" alt="${mat}" />`;
            }
          });
          hoverContent += `</div>`;

          article.innerHTML = html + hoverContent;
          this.dom.galleryField.appendChild(article);
          index++;
        }
      }
    }
  }

  // 儲存進度 (使用 localStorage)
  saveProgress() {
    try {
      const arr = Array.from(this.state.unlockedRecipes);
      localStorage.setItem("damn_it_recipes", JSON.stringify(arr));
    } catch (e) {
      console.warn("無法儲存進度", e);
    }
  }

  // 讀取進度
  loadProgress() {
    try {
      const stored = localStorage.getItem("damn_it_recipes");
      if (stored) {
        const arr = JSON.parse(stored);
        this.state.unlockedRecipes = new Set(arr);
      }
    } catch (e) {
      console.warn("無法讀取進度", e);
    }
  }

  resetGame() {
    this.state.selectedIngredients.clear();
    this.state.slotOrder = Array(CONFIG.MAX_INGREDIENTS).fill(null);
    this.state.selectedEgg = "米特蛋";
    this.updateIngredientStatus();
    this.highlightEggChoice("米特蛋");
    this.Dialog.reset();

    if (this.dom.castingVideo) {
      this.dom.castingVideo.style.opacity = 0;
      this.dom.castingVideo.pause();
      this.dom.castingVideo.currentTime = 0;
    }

    // 重置轉場容器狀態
    if (this.dom.transformationSpace) {
      this.dom.transformationSpace.classList.remove(
        "casting-active",
        "casting-finished"
      );
    }
  }

  highlightEggChoice(eggName) {
    if (!this.dom.eggCards?.length) return;
    this.dom.eggCards.forEach((card) => {
      const isActive =
        card.dataset.egg === eggName && !card.classList.contains("locked");
      card.classList.toggle("selected", isActive);
    });
    if (this.dom.confirmEggBtn) {
      const isAllowed = eggName === "米特蛋";
      this.dom.confirmEggBtn.disabled = !isAllowed;
      this.dom.confirmEggBtn.textContent = isAllowed
        ? "前往煉蛋指南"
        : "僅米特蛋可體驗";
    }
  }

  // ---------------------- 訊息與動畫 ----------------------

  showAlert(type, text) {
    if (!this.dom.alertBox) return;
    const icons = { success: "✅", error: "❌", info: "💡" };

    this.dom.alertBox.classList.remove("success", "error", "info", "hidden");
    this.dom.alertBox.classList.add(type);
    if (this.dom.alertText) this.dom.alertText.textContent = text;
    if (this.dom.alertIcon)
      this.dom.alertIcon.textContent = icons[type] || "💡";
    this.dom.alertBox.classList.remove("hidden");

    setTimeout(() => {
      this.dom.alertBox.classList.add("hidden");
    }, 3000);
  }

  loadLottieAnimations() {
    if (typeof lottie === "undefined") return;
    if (!this.dom.lottieTitleContainer || !this.dom.lottieStartBtn) return;

    this.state.lottieInstances.title = lottie.loadAnimation({
      container: this.dom.lottieTitleContainer,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "animations/main_title_animation.json",
    });

    this.state.lottieInstances.startBtn = lottie.loadAnimation({
      container: this.dom.lottieStartBtn,
      renderer: "svg",
      loop: false,
      autoplay: false,
      path: "animations/start_button_animation.json",
    });

    this.dom.lottieStartBtn.addEventListener("mouseenter", () =>
      this.state.lottieInstances.startBtn.playSegments([0, 30], true)
    );
    this.dom.lottieStartBtn.addEventListener("mouseleave", () =>
      this.state.lottieInstances.startBtn.stop()
    );
  }

  setupBackgroundMusic() {
    const bgm = this.dom.bgmAudio;
    if (!bgm) return;
    bgm.volume = 0.5;
    const attemptPlay = () => bgm.play().catch(() => {});
    attemptPlay();
    const unlockAudio = () => {
      bgm.muted = false;
      attemptPlay();
      document.removeEventListener("pointerdown", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };
    document.addEventListener("pointerdown", unlockAudio);
    document.addEventListener("touchstart", unlockAudio);
  }

  seedHomeStars() {
    const starField = document.getElementById("star-field");
    if (!starField) return;
    const starSprites = [
      "./img/星星黃_画板 1 1.png",
      "./img/星星黃_画板 1 2.png",
      "./img/星星黃_画板 1 3.png",
      "./img/星星綠_画板 1 1.png",
      "./img/星星綠_画板 1 2.png",
      "./img/星星綠_画板 1 3.png",
      "./img/星星橘_画板 1 1.png",
    ];
    const starLayout = [
      { left: 6, top: 18, rotation: -6, scale: 0.86, delay: 0.6 },
      { left: 14, top: 82, rotation: 6, scale: 0.88, delay: 1.1 },
      { left: 88, top: 20, rotation: 4, scale: 0.9, delay: 0.8 },
      { left: 84, top: 82, rotation: -8, scale: 0.9, delay: 1.4 },
      { left: 6, top: 40, rotation: 10, scale: 0.86, delay: 0.7 },
    ];
    starField.innerHTML = "";
    starLayout.forEach((pos, index) => {
      const star = document.createElement("img");
      star.src = starSprites[index % starSprites.length];
      star.style.left = `${pos.left}%`;
      star.style.top = `${pos.top}%`;
      star.style.setProperty("--star-rotation", `${pos.rotation}deg`);
      star.style.setProperty("--star-scale", pos.scale);
      star.style.animationDelay = `${pos.delay}s`;
      starField.appendChild(star);
    });
  }

  setupSoundBoard() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.audioCtx = new AudioContext();
    this.sfxProfile = CONFIG.SFX_PROFILE;

    // 簡單音效合成
    this.sfxSets = {
      result: [
        () => this.playTone("success", { duration: 0.1 }),
        () => this.playTone("drop", { duration: 0.2 }),
      ],
    };

    const unlock = () => {
      this.audioCtx.resume();
      document.removeEventListener("pointerdown", unlock);
    };
    document.addEventListener("pointerdown", unlock);
  }

  playTone(name, { volume = 0.22, duration = 0.18 } = {}) {
    if (!this.audioCtx || this.state.isMuted) return;
    const freq = this.sfxProfile?.[name];
    if (!freq) return;
    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain).connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  playSfxGroup(groupName) {
    if (this.sfxSets?.[groupName]) {
      this.sfxSets[groupName].forEach((fn) => fn());
    }
  }

  preloadImage(src) {
    return new Promise((resolve) => {
      if (!src) {
        resolve();
        return;
      }
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => resolve();
      img.src = src;
    });
  }

  // ---------------------- 食材選擇邏輯 (Drag & Drop) ----------------------

  getFilledSlotCount() {
    return this.state.slotOrder.filter(Boolean).length;
  }

  syncSelectedIngredientsFromSlots() {
    this.state.selectedIngredients = new Set(
      this.state.slotOrder.filter(Boolean)
    );
  }

  assignIngredientToFirstOpenSlot(ingredient) {
    const emptyIndex = this.state.slotOrder.findIndex((value) => !value);
    if (emptyIndex !== -1) {
      this.state.slotOrder[emptyIndex] = ingredient;
    }
    this.syncSelectedIngredientsFromSlots();
    return emptyIndex;
  }

  assignIngredientToSlot(slotEl, ingredient) {
    const slotIndex = parseInt(slotEl?.dataset.slotIndex, 10) - 1;
    if (Number.isNaN(slotIndex) || slotIndex < 0) return -1;

    const previous = this.state.slotOrder[slotIndex];
    this.state.slotOrder = this.state.slotOrder.map((value, index) => {
      if (index === slotIndex) return ingredient;
      if (value === ingredient) return null; // 避免重複
      return value;
    });

    if (previous && !this.state.slotOrder.includes(previous)) {
      this.state.selectedIngredients.delete(previous);
    }
    this.syncSelectedIngredientsFromSlots();
    return slotIndex;
  }

  updateIngredientStatus() {
    const filledCount = this.getFilledSlotCount();
    const isCastDisabled = filledCount !== CONFIG.MAX_INGREDIENTS; // 必須滿3個

    if (this.dom.castSpellBtn) {
      this.dom.castSpellBtn.disabled = isCastDisabled;
    }

    this.dom.ingredientTokens.forEach((card) => {
      const ingredient = card.dataset.ingredient;
      const isSelected = this.state.selectedIngredients.has(ingredient);
      const isFull = filledCount >= CONFIG.MAX_INGREDIENTS;
      card.classList.toggle("selected", isSelected);
      card.setAttribute("aria-pressed", isSelected);
      // 若已選或已滿，則變灰
      card.classList.toggle("disabled", !isSelected && isFull);
    });

    const selectedArr = this.state.slotOrder;
    if (this.dom.selectionSlots) {
      this.dom.selectionSlots.forEach((slot, index) => {
        const label = slot.querySelector(".slot-label");
        const clearBtn = slot.querySelector(".slot-clear");
        const hint = slot.querySelector(".slot-hint");
        const thumb = slot.querySelector(".slot-thumb");
        const prevIngredient = slot.dataset.ingredient;
        const ingredient = selectedArr[index];

        if (ingredient) {
          slot.classList.add("filled");
          slot.dataset.ingredient = ingredient;
          if (label) label.textContent = ingredient;
          if (hint) hint.textContent = "已放入";
          if (thumb) {
            thumb.src = CONFIG.INGREDIENT_IMAGES[ingredient] || "";
            thumb.alt = ingredient;
          }
          if (clearBtn) clearBtn.disabled = false;
          if (prevIngredient !== ingredient) {
            slot.classList.add("pop");
            slot.addEventListener(
              "animationend",
              () => slot.classList.remove("pop"),
              { once: true }
            );
          }
        } else {
          slot.classList.remove("filled");
          slot.dataset.ingredient = "";
          if (label) label.textContent = "空槽";
          if (hint) hint.textContent = "拖曳食材";
          if (thumb) {
            thumb.removeAttribute("src");
            thumb.alt = "";
          }
          if (clearBtn) clearBtn.disabled = true;
        }
      });
    }
  }

  addIngredient(ingredient, { preferredSlot = null, silent = false } = {}) {
    const isSelected = this.state.selectedIngredients.has(ingredient);

    if (preferredSlot) {
      const existing = preferredSlot.dataset.ingredient;
      if (existing && existing !== ingredient) {
        this.removeIngredient(existing, { silent: true });
      }
    }

    const filledCount = this.getFilledSlotCount();
    const isFull = filledCount >= CONFIG.MAX_INGREDIENTS;

    if (isSelected) {
      this.showAlert("info", `${ingredient} 已在爐中，不能重複添加。`);
      this.playTone("error");
      return false;
    }

    if (isFull) {
      this.showAlert(
        "error",
        `煉蛋爐已滿！只能加入 ${CONFIG.MAX_INGREDIENTS} 個食材。`
      );
      this.playTone("error");
      return false;
    }

    if (preferredSlot) {
      this.assignIngredientToSlot(preferredSlot, ingredient);
    } else {
      this.assignIngredientToFirstOpenSlot(ingredient);
    }

    if (!silent) {
      this.showAlert("success", `✨ ${ingredient} 加入！`);
      this.playTone("success");
    }
    this.triggerEggReact();
    this.updateIngredientStatus();
    return true;
  }

  removeIngredient(ingredient, { silent = false } = {}) {
    if (!this.state.selectedIngredients.has(ingredient)) return;
    this.state.slotOrder = this.state.slotOrder.map((val) =>
      val === ingredient ? null : val
    );
    this.syncSelectedIngredientsFromSlots();
    if (!silent) {
      this.playTone("tick");
    }
    this.updateIngredientStatus();
  }

  triggerEggReact() {
    if (!this.dom.dropTarget) return;
    this.dom.dropTarget.classList.add("feed-react");
    const egg = this.dom.dropTarget.querySelector(".egg-graphic");
    if (egg) {
      egg.classList.add("react");
      egg.addEventListener(
        "animationend",
        () => egg.classList.remove("react"),
        { once: true }
      );
    }
    this.dom.dropTarget.addEventListener(
      "animationend",
      () => this.dom.dropTarget.classList.remove("feed-react"),
      { once: true }
    );
  }

  resolveDropZone(x, y) {
    const zones = [];
    if (this.dom.dropTarget)
      zones.push({ type: "pot", element: this.dom.dropTarget });
    if (this.dom.selectionSlots?.length) {
      this.dom.selectionSlots.forEach((slot) =>
        zones.push({ type: "slot", element: slot })
      );
    }
    return zones.find(({ element }) => {
      const rect = element.getBoundingClientRect();
      return (
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      );
    });
  }

  animateBounceBack(card, onDone) {
    card.classList.add("drag-revert");
    requestAnimationFrame(() => {
      card.style.transform = "translate(0, 0)";
    });
    const cleanup = () => {
      card.classList.remove("drag-active", "drag-revert", "dragging");
      card.style.transition = "";
      card.style.transform = "";
      this.clearHandCursor();
      onDone?.();
    };
    setTimeout(cleanup, 360);
  }

  spawnFlash(target, className = "drop-flare") {
    if (!target) return;
    const flare = document.createElement("div");
    flare.className = className;
    target.appendChild(flare);
    setTimeout(() => flare.remove(), 500);
  }

  pulseTarget(target) {
    if (!target) return;
    target.classList.add("hit-success");
    setTimeout(() => target.classList.remove("hit-success"), 520);
  }

  consumeToken(card, targetElement) {
    // 視覺效果：食材縮小飛入目標
    const cardRect = card.getBoundingClientRect();
    const targetRect = targetElement?.getBoundingClientRect();
    const dx = targetRect
      ? targetRect.left +
        targetRect.width / 2 -
        (cardRect.left + cardRect.width / 2)
      : 0;
    const dy = targetRect
      ? targetRect.top +
        targetRect.height / 2 -
        (cardRect.top + cardRect.height / 2)
      : 0;

    card.style.transition = "transform 0.26s ease, opacity 0.26s ease";
    card.style.transform = `translate(${dx}px, ${dy}px) scale(0.5)`;
    card.style.opacity = 0;

    setTimeout(() => {
      card.classList.remove("drag-active", "dragging");
      card.style.transition = "";
      card.style.transform = "";
      card.style.opacity = "";
      this.clearHandCursor();
    }, 360);
  }

  // ---------------------- 影片播放 ----------------------

  async handleVideoTransition() {
    this.dom.transformationSpace?.classList.remove("casting-finished");
    this.dom.transformationSpace?.classList.add("casting-active");
    if (this.dom.castingVideo) {
      this.dom.castingVideo.style.opacity = 1;
      this.dom.castingVideo.muted = this.state.isMuted;
      this.dom.castingVideo.currentTime = 0;
    }
    if (this.dom.spinnerOverlay) {
      this.dom.spinnerOverlay.style.opacity = 1;
      this.dom.spinnerOverlay.style.display = "flex";
    }

    try {
      if (this.dom.castingVideo) {
        await this.dom.castingVideo.play();
        if (this.dom.spinnerOverlay) {
          this.dom.spinnerOverlay.style.display = "none";
        }
      }
    } catch (error) {
      console.warn("影片自動播放失敗:", error);
      this.showAlert("info", "點擊畫面開始播放");
      if (this.dom.spinnerOverlay)
        this.dom.spinnerOverlay.style.display = "none";
    }
  }

  handleVideoEnd() {
    if (this.dom.castingVideo) {
      this.dom.castingVideo.pause();
    }
    this.dom.transformationSpace?.classList.remove("casting-active");
    this.dom.transformationSpace?.classList.add("casting-finished");
    // 影片結束後，自動跳轉或停留 (這裡選擇停留讓使用者按按鈕，或者自動跳)
    // 若要自動跳轉結果頁，可取消註解下面這行：
    // this.performTransition("screen-7");
  }

  setupSunEasterEgg() {
    // 復活節彩蛋 (略) - 保留但不詳述
    if (this.dom.sunEasterBtn) {
      this.dom.sunEasterBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (this.dom.sunHatchPopover) this.dom.sunHatchPopover.hidden = false;
      });
      if (this.dom.sunHatchClose) {
        this.dom.sunHatchClose.addEventListener("click", (e) => {
          e.stopPropagation();
          this.dom.sunHatchPopover.hidden = true;
        });
      }
    }
  }

  // ---------------------- 模塊加載 (Dialog & Guide) ----------------------

  loadModules() {
    this.Dialog = this.createDialogModule();
    this.Guide = this.createGuideModule();
  }

  createDialogModule() {
    let aborted = false;
    const self = this;
    return {
      start: () => {
        return new Promise((resolve) => {
          aborted = false;
          self.dom.continueBtn.classList.add("hidden");
          self.dom.messagesContainer.innerHTML = "";

          self.dom.continueBtn.addEventListener("click", () => resolve(), {
            once: true,
          });

          self.dom.dialogSkipBtn.onclick = () => {
            aborted = true;
            // 立即顯示所有對話
            self.dom.messagesContainer.innerHTML = "";
            CONFIG.STORY_MESSAGES.forEach((msg) => {
              const bubble = document.createElement("div");
              bubble.className = "message-bubble instant";
              bubble.textContent = msg;
              self.dom.messagesContainer.appendChild(bubble);
            });
            self.dom.continueBtn.classList.remove("hidden");
          };

          (async () => {
            for (let msg of CONFIG.STORY_MESSAGES) {
              if (aborted) break;
              // 模擬打字效果
              if (self.dom.typingIndicator)
                self.dom.typingIndicator.classList.add("visible");
              await wait(600);
              if (self.dom.typingIndicator)
                self.dom.typingIndicator.classList.remove("visible");

              const bubble = document.createElement("div");
              bubble.className = "message-bubble pop-in";
              bubble.textContent = msg;
              self.dom.messagesContainer.appendChild(bubble);
              self.dom.messagesContainer.scrollTop =
                self.dom.messagesContainer.scrollHeight;

              await wait(1000); // 閱讀時間
            }
            if (!aborted) self.dom.continueBtn.classList.remove("hidden");
          })();
        });
      },
      reset: () => {
        aborted = false;
        self.dom.messagesContainer.innerHTML = "";
        self.dom.continueBtn.classList.add("hidden");
      },
    };
  }

  createGuideModule() {
    // 簡單的導覽模組實作
    const self = this;
    let currentStep = 0;
    let activeSteps = [];

    function showStep() {
      if (currentStep >= activeSteps.length) {
        exit();
        return;
      }
      const step = activeSteps[currentStep];
      const target = document.getElementById(step.targetId);
      if (!target) {
        currentStep++;
        showStep();
        return;
      }

      const rect = target.getBoundingClientRect();
      const tooltip = self.dom.guideTooltip;
      const ring = self.dom.guideFocusRing;

      // 設定聚光燈與提示框位置
      if (ring) {
        ring.style.width = rect.width + 10 + "px";
        ring.style.height = rect.height + 10 + "px";
        ring.style.top = rect.top - 5 + "px";
        ring.style.left = rect.left - 5 + "px";
      }
      if (tooltip) {
        tooltip.style.opacity = 1;
        // 簡單定位邏輯
        tooltip.style.top = rect.bottom + 20 + "px";
        tooltip.style.left = rect.left + "px";
        if (self.dom.tipText) self.dom.tipText.textContent = step.text;
      }
    }

    function next() {
      currentStep++;
      showStep();
    }
    function exit() {
      self.dom.guideOverlay.classList.add("hidden");
      self.state.isTransitioning = false;
    }

    return {
      start: (screenId) => {
        activeSteps = CONFIG.GUIDE_FLOWS[screenId] || CONFIG.GUIDE_STEPS;
        currentStep = 0;
        self.dom.guideOverlay.classList.remove("hidden");
        if (self.dom.tipNextBtn) self.dom.tipNextBtn.onclick = next;
        showStep();
      },
      exit,
    };
  }

  // ---------------------- 事件監聽器 (Event Listeners) ----------------------

  initEventListeners() {
    // 1. 轉場按鈕
    this.dom.nextScreenBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (this.state.isTransitioning) return;
        const targetId = e.currentTarget.dataset.target;
        this.playTone("uiTap");
        this.performTransition(targetId);
      });
    });

    // 2. 開始按鈕
    if (this.dom.lottieStartBtn) {
      this.dom.lottieStartBtn.addEventListener("click", () => {
        if (this.state.isTransitioning) return;
        this.playTone("uiTap");
        this.performTransition("screen-2"); // 去故事頁
      });
    }

    // 3. 食材拖曳 (Pointer Events for Touch/Mouse)
    this.dom.ingredientTokens.forEach((card) => {
      const ingredient = card.dataset.ingredient;

      const startDrag = (event) => {
        event.preventDefault();
        this.setHandCursor(
          event.clientX < window.innerWidth / 2 ? "left" : "right"
        );

        card.classList.add("drag-active");
        const startX = event.clientX;
        const startY = event.clientY;

        const move = (e) => {
          card.style.transform = `translate(${e.clientX - startX}px, ${
            e.clientY - startY
          }px)`;
        };

        const up = (e) => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);

          const dropZone = this.resolveDropZone(e.clientX, e.clientY);

          // 成功放置
          if (dropZone) {
            const success = this.addIngredient(ingredient, {
              preferredSlot: dropZone.type === "slot" ? dropZone.element : null,
            });
            if (success) {
              this.playTone("drop");
              this.consumeToken(card, dropZone.element);
              this.pulseTarget(dropZone.element);
              return;
            }
          }

          // 失敗回彈
          this.animateBounceBack(card);
        };

        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
      };

      card.addEventListener("pointerdown", startDrag);
    });

    // 4. 清除按鈕
    if (this.dom.selectionSlots) {
      this.dom.selectionSlots.forEach((slot) => {
        const clearBtn = slot.parentNode.querySelector(".slot-clear");
        if (clearBtn) {
          clearBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            const ing = slot.dataset.ingredient;
            if (ing) this.removeIngredient(ing);
          });
        }
      });
    }

    // 5. 影片與跳過
    if (this.dom.castingVideo) {
      this.dom.castingVideo.addEventListener("ended", () =>
        this.handleVideoEnd()
      );
    }
    this.dom.skipVideoBtns.forEach((btn) =>
      btn.addEventListener("click", () => {
        // 跳過影片直接去結果
        if (this.dom.castingVideo) this.dom.castingVideo.pause();
        this.performTransition("screen-7");
      })
    );

    // 6. 音量與導覽
    this.dom.volumeBtns.forEach((btn) =>
      btn.addEventListener("click", () => {
        this.state.isMuted = !this.state.isMuted;
        this.dom.bgmAudio.muted = this.state.isMuted;
        this.showAlert("info", this.state.isMuted ? "靜音" : "開啟音效");
      })
    );

    this.dom.guideBtns.forEach((btn) =>
      btn.addEventListener("click", () => {
        this.Guide.start(this.state.currentScreenId);
      })
    );

    // 7. 施法按鈕
    if (this.dom.castSpellBtn) {
      this.dom.castSpellBtn.addEventListener("click", () => {
        if (!this.dom.castSpellBtn.disabled) {
          this.performTransition("screen-6");
        } else {
          this.showAlert("error", "請放入 3 種食材！");
        }
      });
    }

    // 8. 選擇主食蛋
    if (this.dom.eggCards) {
      this.dom.eggCards.forEach((card) => {
        card.addEventListener("click", () => {
          if (card.classList.contains("locked")) return;
          this.highlightEggChoice(card.dataset.egg);
          this.state.selectedEgg = card.dataset.egg;
        });
      });
    }

    // 9. 確認主食蛋
    if (this.dom.confirmEggBtn) {
      this.dom.confirmEggBtn.addEventListener("click", () => {
        if (this.state.selectedEgg === "米特蛋") {
          this.performTransition("screen-4");
        } else {
          this.showAlert("error", "請先選擇米特蛋");
        }
      });
    }
  }
}

// =========================================================================
// III. 啟動
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
  new GameController();
});
