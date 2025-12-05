// =========================================================================
// I. 核心配置與資料 (Configuration and Data)
// =========================================================================

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
  // 故事訊息 (Screen 2)
  STORY_MESSAGES: [
    "我是一位廚師，因為到了30歲依舊母胎單身，因此獲得魔法成為了魔法廚師。",
    "在因緣巧合之下，我拿到了霍格滑茲的入學 offer，一年前順利畢業。",
    "直到上週六做飯時，我突然想到——如果把魔法用在食材上會怎麼樣？",
    "於是我買了蛋、米特蛋、還跑到十公里外的賣場找魔法材料。",
    "至於結果？我也不知道。",
    "事不宜遲，馬上開始行動！",
  ],
  // 導覽步驟 (Guide Module)
  GUIDE_STEPS: [
    {
      targetId: "lottie-start-btn",
      text: "點擊這個【開始遊戲】按鈕，即可展開你的煉蛋廚房之旅！",
      position: "right",
    },
    {
      targetId: "global-volume-btn",
      text: "這是【音量按鈕】，點擊它來調整 BGM 或音效大小。",
      position: "left",
    },
    {
      targetId: "global-guide-btn",
      text: "這是【指引按鈕】，可以隨時點擊它來重新查看本教學。",
      position: "left",
    },
  ],
  GUIDE_FLOWS: {
    "screen-1": [
      {
        targetId: "lottie-start-btn",
        text: "點擊【開始遊戲】啟動冒險，畫面上的雙手也會跟著前往廚房！",
        position: "right",
      },
      {
        targetId: "global-guide-btn",
        text: "任何時候想再看教學，點擊這顆【導覽】按鈕即可。",
        position: "left",
      },
    ],
    "screen-2": [
      {
        targetId: "messages",
        text: "這裡播放故事對話，搭配雙手框住情境，請慢慢閱讀。",
        position: "right",
      },
      {
        targetId: "dialog-skip-btn",
        text: "想直接進入遊戲可以按【跳過故事】。",
        position: "top",
      },
      {
        targetId: "continue-btn",
        text: "看完後點【進入煉蛋爐】繼續。",
        position: "top",
      },
    ],
    "screen-5": [
      {
        targetId: "selection-row",
        text: "這些欄位顯示已放入的食材，按叉叉可清除。",
        position: "bottom",
      },
      {
        targetId: "ingredient-tray",
        text: "直接拖曳原始圖片食材到米特蛋上方，最多三種。",
        position: "top",
      },
      {
        targetId: "cast-spell-btn",
        text: "選好後按【MAGIC】啟動，跳轉進入變身影片。",
        position: "top",
      },
    ],
    "screen-6": [
      {
        targetId: "casting-video",
        text: "影片全幅鋪滿舞台，搭配光暈讓變身效果更明顯。",
        position: "right",
      },
      {
        targetId: "skip-video-btn",
        text: "右下角有【Skip】可以提前結束。",
        position: "left",
      },
      {
        targetId: "next-from-video-btn",
        text: "完成後點擊【查看結果】繼續。",
        position: "top",
      },
    ],
    "screen-gallery": [
      {
        targetId: "floating-gallery-field",
        text: "卡片在空間中漂浮，鎖定的成品會呈現半透明覆蓋。",
        position: "left",
      },
    ],
  },
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
    };
    this.loadModules(); // 載入模塊 (Dialog, Guide)
    this.init();
  }

  // ---------------------- DOM 初始化 ----------------------

  getDOMElements() {
    // 集中查詢所有需要的 DOM 元素
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
      nextFromVideoBtn: document.getElementById("next-from-video-btn"),
      resultTitle: document.getElementById("result-title"),
      resultDescription: document.getElementById("result-description"),
      resultImage: document.getElementById("result-main-image"),
      resultRarity: document.getElementById("result-rarity"),

      alertBox: document.getElementById("alert-message"),
      alertText: document.getElementById("alert-text"),
      alertIcon: document.getElementById("alert-icon"),

      volumeBtns: document.querySelectorAll(".volume-toggle"),
      guideBtns: document.querySelectorAll(".guide-trigger"),
      settingsBtns: document.querySelectorAll("#settings-btn, [data-target='screen-settings']"),
      spinnerOverlay: document.getElementById("spinner-overlay"),
      skipVideoBtns: document.querySelectorAll(".skip-video-btn"),

      // Guide Elements
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
    if (this.dom.curtainLayer) {
      this.dom.curtainLayer.classList.add("open");
      this.dom.curtainLayer.setAttribute("aria-hidden", "true");
    }
    this.loadLottieAnimations();
    this.setupBackgroundMusic();
    this.setupSoundBoard();
    this.setupSunEasterEgg();
    this.initEventListeners();
    this.updateIngredientStatus();
    this.updateHandState(this.state.currentScreenId);
    this.updateOverlayLayers(this.state.currentScreenId);
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
      requestAnimationFrame(() => nextScreen.classList.remove("incoming"));
      setTimeout(() => nextScreen.classList.remove("wave-enter"), CONFIG.TRANSITION_DURATION + 180);
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
    const hideToolbar = false;
    this.dom.persistentUI.classList.toggle("hidden", hideToolbar);
  }

  updateHandState(screenId) {
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
      this.dom.screenOverlay.setAttribute("aria-hidden", anyActive ? "false" : "true");
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
      if (nextScreenId === "screen-7") {
        this.generateResult();
        await this.preloadImage(this.state.resultPayload?.image);
        this.renderResultPage();
      }

      await this.playCurtainTransition(() => this.switchScreens(nextScreenId));

      if (nextScreenId === "screen-2") {
        // 進入對話流程
        await this.Dialog.start();
        this.state.isTransitioning = false;
        await this.performTransition(this.dom.continueBtn.dataset.target); // Dialog結束後自動切換到screen-3
        return;
      } else if (nextScreenId === "screen-6") {
        // 影片播放流程
        await this.handleVideoTransition();
      } else if (nextScreenId === "screen-7") {
        // 結果生成頁
        this.playSfxGroup("result");
      }

      // 額外處理：回到首頁時重置遊戲
      if (nextScreenId === "screen-1") {
        this.resetGame();
      }
    } catch (error) {
      console.error(`轉場失敗到 ${nextScreenId}:`, error);
      this.showAlert("error", "轉場動畫或流程出錯了！");
    } finally {
      this.state.isTransitioning = false;
    }
  }

  playCurtainTransition(midpointCallback) {
    return new Promise((resolve) => {
      const layer = this.dom.curtainLayer;
      if (!layer) {
        midpointCallback?.();
        resolve();
        return;
      }

      const closeMs = CONFIG.CURTAIN_CLOSE_MS;
      const shakeMs = CONFIG.CURTAIN_SHAKE_MS;
      const openMs = CONFIG.CURTAIN_OPEN_MS;
      const totalDuration = closeMs + shakeMs + openMs;

      this.playSfxGroup("transition");

      layer.style.setProperty(
        "--curtain-close",
        `${closeMs}ms cubic-bezier(0.7, 0.05, 0.95, 0.25)`
      );
      layer.style.setProperty(
        "--curtain-open",
        `${openMs}ms cubic-bezier(0.18, 0.78, 0.2, 1)`
      );

      layer.setAttribute("aria-hidden", "false");
      layer.classList.add("active");
      layer.classList.remove("open", "shudder");
      void layer.offsetWidth;
      const midpointTimer = setTimeout(() => {
        midpointCallback?.();
        layer.classList.add("shudder");
      }, closeMs + 120);

      const openTimer = setTimeout(() => {
        layer.classList.add("open");
      }, closeMs + shakeMs);

      const cleanupTimer = setTimeout(() => {
        layer.classList.remove("active", "shudder");
        layer.classList.add("open");
        layer.setAttribute("aria-hidden", "true");
        resolve();
      }, totalDuration);

      this.state.transitionTimers = [midpointTimer, openTimer, cleanupTimer];
    });
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
    const icons = { success: "✅", error: "❌", info: "💡" };

    this.dom.alertBox.classList.remove("success", "error", "info", "hidden");
    this.dom.alertBox.classList.add(type);
    this.dom.alertText.textContent = text;
    this.dom.alertIcon.textContent = icons[type] || "💡";
    this.dom.alertBox.classList.remove("hidden");

    setTimeout(() => {
      this.dom.alertBox.classList.add("hidden");
    }, 3000);
  }

  loadLottieAnimations() {
    if (typeof lottie === "undefined") return;
    if (!this.dom.lottieTitleContainer || !this.dom.lottieStartBtn) return;

    // 標題動畫
    this.state.lottieInstances.title = lottie.loadAnimation({
      container: this.dom.lottieTitleContainer,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "animations/main_title_animation.json",
    });

    // 開始按鈕動畫
    this.state.lottieInstances.startBtn = lottie.loadAnimation({
      container: this.dom.lottieStartBtn,
      renderer: "svg",
      loop: false,
      autoplay: false,
      path: "animations/start_button_animation.json",
    });

    // 按鈕互動效果
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

  setupSoundBoard() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.audioCtx = new AudioContext();
    this.sfxProfile = CONFIG.SFX_PROFILE;
    this.sfxSets = {
      transition: [
        () => this.playSweep(680, 160, 0.6, 0.3),
        () => this.playBubbleChord([620, 520, 420], 0.08, 0.22),
        () => this.playSweep(180, 520, 0.55, 0.26, "triangle"),
      ],
      result: [
        () => this.playBurst([320, 540, 760], 0.06, 0.4),
        () => this.playSweep(420, 120, 0.5, 0.34, "sine", true),
        () => this.playBurst([260, 420, 260, 820], 0.05, 0.36),
      ],
    };

    const unlock = () => {
      this.audioCtx.resume();
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("touchstart", unlock);
    };

    document.addEventListener("pointerdown", unlock);
    document.addEventListener("touchstart", unlock);
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

  playSweep(startFreq, endFreq, duration = 0.6, volume = 0.22, type = "sine", reverse = false) {
    if (!this.audioCtx || this.state.isMuted) return;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const now = this.audioCtx.currentTime;

    osc.type = type;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    if (reverse) {
      osc.frequency.setValueAtTime(endFreq, now);
      osc.frequency.exponentialRampToValueAtTime(startFreq, now + duration);
    } else {
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    }

    osc.connect(gain).connect(this.audioCtx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  playBurst(frequencies = [], spacing = 0.06, volume = 0.28) {
    if (!this.audioCtx || this.state.isMuted) return;
    const now = this.audioCtx.currentTime;
    frequencies.forEach((freq, index) => {
      const start = now + index * spacing;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "square";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume, start);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
      osc.connect(gain).connect(this.audioCtx.destination);
      osc.start(start);
      osc.stop(start + 0.22);
    });
  }

  playBubbleChord(frequencies = [], spacing = 0.1, volume = 0.22) {
    if (!this.audioCtx || this.state.isMuted) return;
    const now = this.audioCtx.currentTime;
    frequencies.forEach((freq, index) => {
      const start = now + index * spacing;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(volume, start);
      gain.gain.linearRampToValueAtTime(0.0001, start + 0.4);
      osc.connect(gain).connect(this.audioCtx.destination);
      osc.start(start);
      osc.stop(start + 0.42);
    });
  }

  playSfxGroup(groupName) {
    if (!this.sfxSets?.[groupName]) return;
    const pool = this.sfxSets[groupName];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    pick?.();
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

  // ---------------------- 食材選擇邏輯 ----------------------

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
      if (value === ingredient) return null;
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
    const isCastDisabled =
      filledCount === 0 || filledCount > CONFIG.MAX_INGREDIENTS;
    if (this.dom.castSpellBtn) {
      this.dom.castSpellBtn.disabled = isCastDisabled;
    }

    this.dom.ingredientTokens.forEach((card) => {
      const ingredient = card.dataset.ingredient;
      const isSelected = this.state.selectedIngredients.has(ingredient);
      const isFull = filledCount >= CONFIG.MAX_INGREDIENTS;
      card.classList.toggle("selected", isSelected);
      card.setAttribute("aria-pressed", isSelected);
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
            thumb.alt = `${ingredient} 圖片`;
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
          if (hint) hint.textContent = "拖曳食材進入";
          if (thumb) {
            thumb.removeAttribute("src");
            thumb.alt = "已選食材縮圖";
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
      this.showAlert("info", `${ingredient} 已在煉蛋爐中，換個食材試試。`);
      this.playTone("error");
      return false;
    }

    if (isFull) {
      this.showAlert(
        "error",
        `煉蛋爐已滿！最多只能加入 ${CONFIG.MAX_INGREDIENTS} 個食材。`
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
      this.showAlert("success", `✨ ${ingredient} 已成功加入米特蛋！`);
      this.playTone("success");
    }
    this.triggerEggReact();
    this.updateIngredientStatus();
    return true;
  }

  removeIngredient(ingredient, { silent = false } = {}) {
    const existed =
      this.state.selectedIngredients.has(ingredient) ||
      this.state.slotOrder.includes(ingredient);
    if (!existed) return;
    this.state.slotOrder = this.state.slotOrder.map((value) =>
      value === ingredient ? null : value
    );
    this.syncSelectedIngredientsFromSlots();
    if (!silent) {
      this.showAlert("info", `✅ ${ingredient} 已從煉蛋爐中移除。`);
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
      egg.addEventListener("animationend", () => egg.classList.remove("react"), {
        once: true,
      });
    }

    this.dom.dropTarget.addEventListener(
      "animationend",
      () => this.dom.dropTarget.classList.remove("feed-react"),
      { once: true }
    );
  }

  resolveDropZone(x, y) {
    const zones = [];
    if (this.dom.dropTarget) zones.push({ type: "pot", element: this.dom.dropTarget });
    if (this.dom.selectionSlots?.length) {
      this.dom.selectionSlots.forEach((slot) => zones.push({ type: "slot", element: slot }));
    }

    return zones.find(({ element }) => {
      const rect = element.getBoundingClientRect();
      return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    });
  }

  animateBounceBack(card, onDone) {
    card.classList.add("drag-revert");
    requestAnimationFrame(() => {
      card.style.transform = "translate(0, 0)";
    });

    let handleEnd;
    const cleanup = () => {
      card.classList.remove("drag-active", "drag-revert", "dragging");
      card.style.transition = "";
      card.style.transform = "";
      this.clearHandCursor();
      card.removeEventListener("transitionend", handleEnd);
      onDone?.();
    };

    const fallback = setTimeout(cleanup, 360);
    handleEnd = () => {
      clearTimeout(fallback);
      cleanup();
    };

    card.addEventListener("transitionend", handleEnd, { once: true });
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
    const cardRect = card.getBoundingClientRect();
    const targetRect = targetElement?.getBoundingClientRect();
    const dx = targetRect
      ? targetRect.left + targetRect.width / 2 - (cardRect.left + cardRect.width / 2)
      : 0;
    const dy = targetRect
      ? targetRect.top + targetRect.height / 2 - (cardRect.top + cardRect.height / 2)
      : 0;

    card.style.transition = "transform 0.26s ease, opacity 0.26s ease";
    card.style.transform = `translate(${dx}px, ${dy}px) scale(0.88)`;
    requestAnimationFrame(() => card.classList.add("consumed"));
    setTimeout(() => {
      card.classList.remove("consumed", "drag-active", "dragging");
      card.style.transition = "";
      card.style.transform = "";
      card.style.opacity = "";
      this.clearHandCursor();
    }, 360);
  }

  setupSunEasterEgg() {
    if (!this.dom.sunEasterBtn || !this.dom.sunHatchPopover) return;

    const openPopover = () => {
      this.dom.sunHatchPopover.hidden = false;
      this.dom.sunHatchPopover.classList.remove("show");
      void this.dom.sunHatchPopover.offsetWidth;
      this.dom.sunHatchPopover.classList.add("show");
      this.playTone("success");
    };

    const closePopover = () => {
      this.dom.sunHatchPopover.classList.remove("show");
      this.dom.sunHatchPopover.hidden = true;
    };

    this.dom.sunEasterBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      openPopover();
    });

    this.dom.sunHatchClose?.addEventListener("click", (event) => {
      event.stopPropagation();
      closePopover();
    });
  }

  // ---------------------- 影片與結果處理 ----------------------

  async handleVideoTransition() {
    this.dom.nextFromVideoBtn.classList.add("locked");
    this.dom.nextFromVideoBtn.disabled = true;
    this.dom.transformationSpace?.classList.remove("casting-finished");
    this.dom.transformationSpace?.classList.add("casting-active");
    if (this.dom.castingVideo) {
      this.dom.castingVideo.style.opacity = 0.9;
      this.dom.castingVideo.muted = this.state.isMuted;
    }

    if (this.dom.spinnerOverlay) {
      this.dom.spinnerOverlay.style.opacity = 1;
      this.dom.spinnerOverlay.style.display = "flex";
    }

    try {
      if (this.dom.castingVideo) {
        this.dom.castingVideo.currentTime = 0;
        await this.dom.castingVideo.play();
        if (this.dom.spinnerOverlay) {
          setTimeout(() => {
            this.dom.spinnerOverlay.style.opacity = 0;
            this.dom.spinnerOverlay.style.display = "none";
          }, 320);
        }
      }
    } catch (error) {
      console.warn("影片自動播放被阻止:", error);
      this.showAlert("info", "請點擊影片開始播放或按 [查看結果] 強制繼續");
      this.dom.nextFromVideoBtn.classList.remove("locked");
      this.dom.nextFromVideoBtn.disabled = false;
      if (this.dom.spinnerOverlay) {
        this.dom.spinnerOverlay.style.opacity = 0;
        this.dom.spinnerOverlay.style.display = "none";
      }
      return Promise.resolve();
    }
  }

  handleVideoEnd() {
    if (this.dom.castingVideo) {
      this.dom.castingVideo.style.opacity = 0.5; // 播放完畢後變暗
      this.dom.castingVideo.pause();
    }
    this.dom.transformationSpace?.classList.remove("casting-active");
    this.dom.transformationSpace?.classList.add("casting-finished");
    this.dom.nextFromVideoBtn.classList.remove("locked");
    this.dom.nextFromVideoBtn.disabled = false;
  }

  generateResult() {
    const ingredients = Array.from(this.state.selectedIngredients);
    const count = ingredients.length;

    const hasTNT = ingredients.includes("TNT");
    const has榴槤 = ingredients.includes("榴槤");
    const has魷魚 = ingredients.includes("魷魚");
    const has檸檬 = ingredients.includes("檸檬");
    const has香菜 = ingredients.includes("香菜");
    const has隕石 = ingredients.includes("隕石");

    let title, text, image, rarity;

    // 根據食材組合生成結果
    if (count === 3 && has榴槤 && has魷魚 && hasTNT) {
      title = "💥 究極爆臭：毀滅之蛋";
      text =
        "榴槤、TNT、魷魚完美結合，獲得了一顆可以毀滅世界的臭蛋。稀有度：SSSR";
      image = "./img/核武器.png";
      rarity = "SSSR";
    } else if (has香菜 && has榴槤 && has檸檬) {
      title = "💀 生化武器：廣志之襪";
      text = "你複製了野原廣志的襪子！這顆蛋散發出讓魔法界聞風喪膽的氣味。";
      image = "./img/生化武器.png";
      rarity = "SSR";
    } else if (count >= 2 && hasTNT && has隕石) {
      title = "💣 地雷系：盧媽媽炸彈";
      text = "這顆蛋看起來隨時會爆炸，充滿了危險的能量，千萬不要搖晃它。";
      image = "./img/地雷系蛋.png";
      rarity = "SR";
    } else if (count >= 1) {
      title = "🥚 普通成功：經典煉蛋";
      text =
        "你成功地用奇異的食材煉出了一顆還能吃的經典蛋。雖然無趣，但安全可靠。";
      image = "./img/吃飯蛋 1.png";
      rarity = "R";
    } else {
      title = "💥 失敗結局：爆裂米特渣";
      text = "食材太少，煉蛋爐無法啟動。您得到了一堆無法形容的殘渣。";
      image = "./img/流浪漢.png";
      rarity = "E";
    }

    this.state.resultPayload = { title, text, image, rarity };
  }

  renderResultPage() {
    const payload = this.state.resultPayload;
    if (!payload) return;
    if (this.dom.resultTitle) this.dom.resultTitle.textContent = payload.title;
    if (this.dom.resultDescription)
      this.dom.resultDescription.textContent = payload.text;
    if (this.dom.resultImage) this.dom.resultImage.src = payload.image;
    if (this.dom.resultRarity) this.dom.resultRarity.textContent = payload.rarity;
  }

  // ---------------------- 模塊加載 ----------------------

  loadModules() {
    this.Dialog = this.createDialogModule();
    this.Guide = this.createGuideModule();
  }

  // ---------------------- 對話模塊 (Screen 2) ----------------------

  createDialogModule() {
    let aborted = false;
    const self = this;

    function showTyping() {
      self.dom.typingIndicator.classList.add("visible");
    }

    function hideTyping() {
      self.dom.typingIndicator.classList.remove("visible");
    }

    async function typeMessage(text) {
      const bubble = document.createElement("div");
      bubble.className = "message-bubble";
      bubble.textContent = "";
      self.dom.messagesContainer.appendChild(bubble);
      self.dom.messagesContainer.scrollTop = self.dom.messagesContainer.scrollHeight;

      await wait(250);

      for (let i = 0; i <= text.length; i++) {
        if (aborted) return;
        bubble.textContent = text.substring(0, i);
        await wait(35);
      }

      bubble.classList.add("pop-in");
      self.dom.messagesContainer.scrollTop = self.dom.messagesContainer.scrollHeight;
    }

    function renderAllMessagesInstant() {
      self.dom.messagesContainer.innerHTML = "";
      CONFIG.STORY_MESSAGES.forEach((text) => {
        const bubble = document.createElement("div");
        bubble.className = "message-bubble instant";
        bubble.textContent = text;
        self.dom.messagesContainer.appendChild(bubble);
      });
      self.dom.messagesContainer.scrollTop = self.dom.messagesContainer.scrollHeight;
      hideTyping();
    }

    function finishDialog() {
      hideTyping();
      self.dom.continueBtn.classList.remove("hidden");
      self.dom.dialogSkipBtn.disabled = true;
    }

    return {
      start: () => {
        return new Promise((resolve) => {
          aborted = false;
          self.dom.continueBtn.classList.add("hidden");
          self.dom.dialogSkipBtn.disabled = false;
          self.dom.messagesContainer.innerHTML = "";
          self.dom.messagesContainer.scrollTop = 0;

          const handleContinue = () => {
            resolve();
          };

          self.dom.continueBtn.addEventListener("click", handleContinue, {
            once: true,
          });

          self.dom.dialogSkipBtn.onclick = () => {
            aborted = true;
            renderAllMessagesInstant();
            finishDialog();
          };

          (async () => {
            for (let i = 0; i < CONFIG.STORY_MESSAGES.length; i++) {
              if (aborted) break;
              showTyping();
              await wait(900 + Math.random() * 700);
              hideTyping();
              await typeMessage(CONFIG.STORY_MESSAGES[i]);
            }

            if (!aborted) {
              finishDialog();
            }
          })();
        });
      },
      reset: () => {
        aborted = false;
        self.dom.messagesContainer.innerHTML = "";
        self.dom.continueBtn.classList.add("hidden");
        hideTyping();
      },
    };
  }

  // ---------------------- 導覽模塊 (Guide Module) ----------------------

  createGuideModule() {
    let currentStep = 0;
    let activeSteps = CONFIG.GUIDE_STEPS;
    const self = this;

    // 輔助函數：取得目標元素範圍
    function getTargetRect(element) {
      const rect = element.getBoundingClientRect();
      const padding = 15;
      return {
        x: rect.x - padding,
        y: rect.y - padding,
        width: rect.width + 2 * padding,
        height: rect.height + 2 * padding,
      };
    }

    // 輔助函數：計算提示框位置 (略，與上一個版本相同)
    function calculateTooltipPosition(targetRect, position) {
      let top, left;
      const tooltip = self.dom.guideTooltip;

      tooltip.style.opacity = 0;
      tooltip.style.display = "block";

      top = targetRect.y + targetRect.height / 2 - tooltip.offsetHeight / 2;
      left = targetRect.x + targetRect.width + 30;

      if (position === "left") {
        left = targetRect.x - tooltip.offsetWidth - 30;
      } else if (position === "top") {
        top = targetRect.y - tooltip.offsetHeight - 30;
        left = targetRect.x + targetRect.width / 2 - tooltip.offsetWidth / 2;
      } else if (position === "bottom") {
        top = targetRect.y + targetRect.height + 30;
        left = targetRect.x + targetRect.width / 2 - tooltip.offsetWidth / 2;
      }

      left = Math.max(
        20,
        Math.min(left, window.innerWidth - tooltip.offsetWidth - 20)
      );
      top = Math.max(
        20,
        Math.min(top, window.innerHeight - tooltip.offsetHeight - 20)
      );

      tooltip.style.opacity = 1;
      return { top, left };
    }

    function showStep() {
      if (currentStep >= activeSteps.length) {
        exit();
        return;
      }

      const step = activeSteps[currentStep];
      const targetElement = document.getElementById(step.targetId);

      if (!targetElement || targetElement.offsetParent === null) {
        currentStep++;
        showStep();
        return;
      }

      const targetRect = getTargetRect(targetElement);

      self.dom.guideFocusRing.style.width = `${targetRect.width}px`;
      self.dom.guideFocusRing.style.height = `${targetRect.height}px`;
      self.dom.guideFocusRing.style.top = `${targetRect.y}px`;
      self.dom.guideFocusRing.style.left = `${targetRect.x}px`;

      self.dom.tipText.textContent = step.text;

      const tooltipPos = calculateTooltipPosition(targetRect, step.position);
      self.dom.guideTooltip.style.top = `${tooltipPos.top}px`;
      self.dom.guideTooltip.style.left = `${tooltipPos.left}px`;

      self.dom.guideTooltip.classList.add("active");
      self.dom.tipNextBtn.textContent =
        currentStep === activeSteps.length - 1 ? "完成指引" : "下一步";

      document.getElementById("tip-current-step").textContent = currentStep + 1;
      document.getElementById("tip-total-steps").textContent = activeSteps.length;
    }

    function start(screenId = self.state.currentScreenId) {
      if (self.state.isTransitioning) return;

      activeSteps = CONFIG.GUIDE_FLOWS[screenId] || CONFIG.GUIDE_STEPS;

      self.dom.guideOverlay.classList.remove("hidden");
      self.dom.guideTooltip.classList.add("active");
      currentStep = 0;
      showStep();
      self.state.isTransitioning = true; // 鎖定遊戲流程
    }

    function exit() {
      self.dom.guideOverlay.classList.add("hidden");
      self.dom.guideTooltip.classList.remove("active");
      self.state.isTransitioning = false;
    }

    function next() {
      currentStep++;
      showStep();
    }

    self.dom.tipNextBtn.addEventListener("click", next);
    self.dom.guideOverlay.addEventListener("click", (event) => {
      if (event.target === self.dom.guideOverlay) {
        next();
      }
    });

    return { start, exit, next };
  }

  // ---------------------- 事件監聽器 ----------------------

  initEventListeners() {
    // 1. 普通轉場按鈕 (Menu, Gallery, Next, Back)
    this.dom.nextScreenBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        if (this.state.isTransitioning) return;
        const targetId = e.currentTarget.dataset.target;
        this.playTone("uiTap");
        this.performTransition(targetId);
      });
    });

    // 2. 開始遊戲按鈕 (Screen 1 Start)
    if (this.dom.lottieStartBtn) {
      this.dom.lottieStartBtn.addEventListener("click", () => {
        if (this.state.isTransitioning) return;
        this.playTone("uiTap");
        this.performTransition(this.dom.lottieStartBtn.dataset.target);
      });
    }

    // 3. 食材選擇/拖曳
    this.dom.ingredientTokens.forEach((card) => {
      const ingredient = card.dataset.ingredient;
      card.addEventListener("dragstart", (e) => e.preventDefault());

      const startPointerDrag = (event) => {
        if (event.pointerType && event.pointerType !== "mouse") return;
        if (typeof event.button === "number" && event.button !== 0) return;
        event.preventDefault();

        const side = event.clientX < window.innerWidth / 2 ? "left" : "right";
        this.setHandCursor(side);
        card.classList.add("drag-active");
        card.style.transition = "none";

        const startX = event.clientX;
        const startY = event.clientY;

        const handleMove = (moveEvent) => {
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;
          card.style.transform = `translate(${dx}px, ${dy}px)`;
        };

        const handleUp = (upEvent) => {
          window.removeEventListener("pointermove", handleMove);
          window.removeEventListener("pointerup", handleUp);

          const dropZone = this.resolveDropZone(upEvent.clientX, upEvent.clientY);

          const resetCard = () => {
            card.classList.remove("drag-active", "dragging", "drag-revert");
            card.style.transition = "";
            card.style.transform = "";
            this.clearHandCursor();
          };

          if (dropZone?.type === "pot") {
            const added = this.addIngredient(ingredient);
            if (added) {
              this.playTone("drop");
              this.spawnFlash(dropZone.element);
              this.pulseTarget(dropZone.element);
              this.consumeToken(card, dropZone.element);
              return;
            }
          } else if (dropZone?.type === "slot") {
            const added = this.addIngredient(ingredient, {
              preferredSlot: dropZone.element,
            });
            if (added) {
              this.playTone("drop");
              this.spawnFlash(dropZone.element, "slot-flash");
              this.pulseTarget(dropZone.element);
              this.animateBounceBack(card, resetCard);
              return;
            }
          }

          this.animateBounceBack(card, resetCard);
        };

        window.addEventListener("pointermove", handleMove);
        window.addEventListener("pointerup", handleUp, { once: true });
      };

      card.addEventListener("pointerdown", startPointerDrag);

      // 提供點擊/鍵盤選取以確保行動裝置也能玩
      card.addEventListener("click", () => {
        this.playTone("uiTap");
        this.addIngredient(ingredient);
      });
      card.addEventListener("keyup", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.playTone("uiTap");
          this.addIngredient(ingredient);
        }
      });
    });

    // 3-1. 快速清除單一槽位
    if (this.dom.selectionSlots) {
      this.dom.selectionSlots.forEach((slot) => {
        const clearBtn = slot.querySelector(".slot-clear");
        if (!clearBtn) return;

        clearBtn.addEventListener("click", (event) => {
          event.stopPropagation();
          const ingredient = slot.dataset.ingredient;
          if (ingredient) this.removeIngredient(ingredient);
        });
      });
    }

    // 4. 影片結束
    if (this.dom.castingVideo) {
      this.dom.castingVideo.addEventListener("ended", () =>
        this.handleVideoEnd()
      );
    }

    if (this.dom.skipVideoBtns?.length) {
      this.dom.skipVideoBtns.forEach((btn) =>
        btn.addEventListener("click", () => {
          this.playTone("uiTap");
          if (this.dom.castingVideo) {
            this.dom.castingVideo.pause();
            this.dom.castingVideo.currentTime = this.dom.castingVideo.duration;
          }
          this.handleVideoEnd();
        })
      );
    }

    // 5. 永久 UI 按鈕
    this.dom.volumeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.playTone("uiTap");
        this.state.isMuted = !this.state.isMuted;
        this.dom.volumeBtns.forEach((el) => {
          el.classList.toggle("muted", this.state.isMuted);
          el.setAttribute("aria-pressed", this.state.isMuted);
          el.setAttribute(
            "aria-label",
            this.state.isMuted ? "音量已靜音" : "音量開啟"
          );
        });
        this.showAlert("info", this.state.isMuted ? "已關閉音效" : "已開啟音效");
        if (this.dom.castingVideo) {
          this.dom.castingVideo.muted = this.state.isMuted;
        }
        if (this.dom.bgmAudio) {
          this.dom.bgmAudio.muted = this.state.isMuted;
        }
        if (this.audioCtx) {
          this.state.isMuted ? this.audioCtx.suspend() : this.audioCtx.resume();
        }
      });
    });

    // 6. 新手導覽按鈕 (僅點擊時啟動)
    this.dom.guideBtns.forEach((btn) =>
      btn.addEventListener("click", () => {
        this.playTone("uiTap");
        this.Guide.start(this.state.currentScreenId);
      })
    );

    // 7. 設置按鈕
    this.dom.settingsBtns.forEach((btn) =>
      btn.addEventListener("click", (e) => {
        if (!e.currentTarget.dataset.target) return;
        this.performTransition(e.currentTarget.dataset.target);
      })
    );

    // 8. 施法按鈕 (Cast Spell)
    if (this.dom.castSpellBtn) {
      this.dom.castSpellBtn.addEventListener("click", () => {
        if (!this.dom.castSpellBtn.disabled) {
          this.performTransition(this.dom.castSpellBtn.dataset.target);
        } else {
          this.showAlert("error", "請選擇 1 到 3 種食材才能施法！");
        }
      });
    }

    // 10. 主食蛋選擇
    if (this.dom.eggCards?.length) {
      this.dom.eggCards.forEach((card) => {
        const eggName = card.dataset.egg;
        const isLocked = card.classList.contains("locked");
        const chooseBtn = card.querySelector(".choose-egg-btn");
        const selectEgg = () => {
          if (isLocked) {
            this.showAlert("info", "此蛋需付費解鎖，請先購買後再試！");
            return;
          }
          this.state.selectedEgg = eggName;
          this.highlightEggChoice(eggName);
        };

        card.addEventListener("click", selectEgg);
        chooseBtn?.addEventListener("click", (e) => {
          e.stopPropagation();
          selectEgg();
        });
      });
    }

    if (this.dom.confirmEggBtn) {
      this.dom.confirmEggBtn.addEventListener("click", () => {
        if (this.state.selectedEgg === "米特蛋") {
          this.performTransition(this.dom.confirmEggBtn.dataset.target);
        } else {
          this.showAlert("error", "目前僅米特蛋可體驗，請先選擇米特蛋！");
        }
      });
      this.highlightEggChoice(this.state.selectedEgg);
    }
  }
}

// =========================================================================
// III. 程式碼啟動點 (Entry Point)
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
  new GameController();
});
