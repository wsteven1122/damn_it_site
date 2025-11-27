// =========================================================================
// I. 核心配置與資料 (Configuration and Data)
// =========================================================================

const CONFIG = {
  TRANSITION_DURATION: 1000,
  MAX_INGREDIENTS: 3,
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
      text: "點擊這個【開始遊戲】按鈕，即可展開你的煉金廚房之旅！",
      position: "right",
    },
    {
      targetId: "volume-btn",
      text: "這是【音量按鈕】，點擊它來調整 BGM 或音效大小。",
      position: "left",
    },
    {
      targetId: "guide-btn",
      text: "這是【指引按鈕】，可以隨時點擊它來重新查看本教學。",
      position: "left",
    },
    {
      targetId: "menu-btn",
      text: "這是【主食選單】，旁邊是【成果圖鑑】，可以稍後再探索。",
      position: "top",
    },
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
      nextScreenBtns: document.querySelectorAll(".next-screen-btn"),
      ingredientCards: document.querySelectorAll(".ingredient-card"),

      lottieTitleContainer: document.getElementById("lottie-title-container"),
      lottieStartBtn: document.getElementById("lottie-start-btn"),

      messagesContainer: document.getElementById("messages"),
      typingIndicator: document.getElementById("typingIndicator"),
      continueBtn: document.getElementById("continue-btn"),
      dialogSkipBtn: document.getElementById("dialog-skip-btn"),

      castingVideo: document.getElementById("casting-video"),
      nextFromVideoBtn: document.getElementById("next-from-video-btn"),

      resultModal: document.getElementById("result-modal"),
      modalCloseBtn: document.querySelector("#result-modal .close-btn"),
      saveToGalleryBtn: document.getElementById("save-to-gallery-btn"),

      alertBox: document.getElementById("alert-message"),
      alertText: document.getElementById("alert-text"),
      alertIcon: document.getElementById("alert-icon"),

      volumeBtn: document.getElementById("volume-btn"),
      guideBtn: document.getElementById("guide-btn"),
      settingsBtn: document.getElementById("settings-btn"),

      // Guide Elements
      guideOverlay: document.getElementById("guide-overlay"),
      guideFocusRing: document.getElementById("guide-focus-ring"),
      guideTooltip: document.getElementById("guide-tooltip"),
      tipText: document.getElementById("tip-text"),
      tipNextBtn: document.getElementById("tip-next-btn"),

      modalTitle: document.getElementById("modal-title"),
      resultText: document.getElementById("result-text"),
      resultImage: document.getElementById("result-image"),
      selectionStatus: document.getElementById("current-selection-count"),
      castSpellBtn: document.getElementById("cast-spell-btn"),
    };
  }

  init() {
    this.dom.persistentUI.style.display = "none";
    this.loadLottieAnimations();
    this.initEventListeners();
    this.updateIngredientStatus();
  }

  // ---------------------- 核心流程控制 ----------------------

  switchScreens(nextScreenId) {
    let currentScreen = document.querySelector(".screen.active");
    let nextScreen = document.getElementById(nextScreenId);

    if (currentScreen) {
      currentScreen.classList.remove("active");
    }
    if (nextScreen) {
      nextScreen.classList.add("active");
    }
    this.state.currentScreenId = nextScreenId;
    this.updatePersistentUI(nextScreenId);
  }

  updatePersistentUI(screenId) {
    if (
      ["screen-1", "screen-menu", "screen-gallery", "screen-settings"].includes(
        screenId
      )
    ) {
      this.dom.persistentUI.style.display = "none";
    } else {
      this.dom.persistentUI.style.display = "block";
    }
  }

  /** 執行畫面切換並處理特殊流程 */
  async performTransition(nextScreenId) {
    if (this.state.isTransitioning) return;

    this.state.isTransitioning = true;
    this.dom.resultModal.classList.remove("active");
    this.dom.resultModal.style.display = "none";

    try {
      this.switchScreens(nextScreenId);

      if (nextScreenId === "screen-2") {
        // 進入對話流程
        await this.Dialog.start();
        this.state.isTransitioning = false;
        await this.performTransition(this.dom.continueBtn.dataset.target); // Dialog結束後自動切換到screen-3
        return;
      } else if (nextScreenId === "screen-5") {
        // 影片播放流程
        await this.handleVideoTransition();
      } else if (nextScreenId === "screen-6") {
        // 結果生成與彈窗
        this.generateResult();
        this.dom.resultModal.classList.add("active");
        this.dom.resultModal.style.display = "flex";
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

  resetGame() {
    this.state.selectedIngredients.clear();
    this.updateIngredientStatus();
    this.Dialog.reset();

    if (this.dom.castingVideo) {
      this.dom.castingVideo.style.opacity = 0;
      this.dom.castingVideo.pause();
      this.dom.castingVideo.currentTime = 0;
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

  // ---------------------- 食材選擇邏輯 ----------------------

  updateIngredientStatus() {
    if (this.dom.selectionStatus) {
      this.dom.selectionStatus.textContent =
        this.state.selectedIngredients.size;
    }

    const isCastDisabled =
      this.state.selectedIngredients.size === 0 ||
      this.state.selectedIngredients.size > CONFIG.MAX_INGREDIENTS;
    if (this.dom.castSpellBtn) {
      this.dom.castSpellBtn.disabled = isCastDisabled;
    }

    this.dom.ingredientCards.forEach((card) => {
      const ingredient = card.dataset.ingredient;
      const isSelected = this.state.selectedIngredients.has(ingredient);
      const isFull =
        this.state.selectedIngredients.size >= CONFIG.MAX_INGREDIENTS;

      card.classList.toggle("selected", isSelected);
      card.setAttribute("aria-checked", isSelected);
      card.classList.toggle(
        "disabled",
        !isSelected && isFull && !card.classList.contains("locked")
      );
    });
  }

  handleIngredientSelection(event) {
    const card = event.currentTarget;
    const ingredient = card.dataset.ingredient;

    if (
      card.classList.contains("locked") ||
      card.classList.contains("disabled")
    )
      return;

    const isSelected = this.state.selectedIngredients.has(ingredient);
    const isFull =
      this.state.selectedIngredients.size >= CONFIG.MAX_INGREDIENTS;

    if (isSelected) {
      this.state.selectedIngredients.delete(ingredient);
      this.showAlert("info", `✅ ${ingredient} 已從煉金爐中移除。`);
    } else {
      if (isFull) {
        this.showAlert(
          "error",
          `煉金爐已滿！最多只能加入 ${CONFIG.MAX_INGREDIENTS} 個食材。`
        );
        return;
      }
      this.state.selectedIngredients.add(ingredient);
      this.showAlert("success", `✨ ${ingredient} 已成功加入煉金爐！`);
    }

    this.updateIngredientStatus();
  }

  // ---------------------- 影片與結果處理 ----------------------

  async handleVideoTransition() {
    this.dom.nextFromVideoBtn.classList.add("hidden");
    if (this.dom.castingVideo) {
      this.dom.castingVideo.style.opacity = 1;
      this.dom.castingVideo.muted = this.state.isMuted;
    }

    try {
      if (this.dom.castingVideo) {
        this.dom.castingVideo.currentTime = 0;
        await this.dom.castingVideo.play();
      }
    } catch (error) {
      console.warn("影片自動播放被阻止:", error);
      this.showAlert("info", "請點擊影片開始播放或按 [查看結果] 強制繼續");
      this.dom.nextFromVideoBtn.classList.remove("hidden");
      return Promise.resolve();
    }
  }

  handleVideoEnd() {
    if (this.dom.castingVideo) {
      this.dom.castingVideo.style.opacity = 0.5; // 播放完畢後變暗
    }
    this.dom.nextFromVideoBtn.classList.remove("hidden");
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
      image = "assets/results/egg_ultimate.png";
      rarity = "SSSR";
    } else if (has香菜 && has榴槤 && has檸檬) {
      title = "💀 生化武器：廣志之襪";
      text = "你複製了野原廣志的襪子！這顆蛋散發出讓魔法界聞風喪膽的氣味。";
      image = "assets/results/egg_chemical.png";
      rarity = "SSR";
    } else if (count >= 2 && hasTNT && has隕石) {
      title = "💣 地雷系：盧媽媽炸彈";
      text = "這顆蛋看起來隨時會爆炸，充滿了危險的能量，千萬不要搖晃它。";
      image = "assets/results/egg_tnt.png";
      rarity = "SR";
    } else if (count >= 1) {
      title = "🥚 普通成功：經典煉金蛋";
      text =
        "你成功地用奇異的食材煉出了一顆還能吃的經典蛋。雖然無趣，但安全可靠。";
      image = "assets/results/egg_001.png";
      rarity = "R";
    } else {
      title = "💥 失敗結局：爆裂米特渣";
      text = "食材太少，煉金爐無法啟動。您得到了一堆無法形容的殘渣。";
      image = "assets/results/egg_fail.png";
      rarity = "E";
    }

    this.dom.modalTitle.textContent = title;
    this.dom.resultText.textContent = text;
    this.dom.resultImage.src = image;
    document.getElementById("result-rarity").textContent = rarity;
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
      if (currentStep >= CONFIG.GUIDE_STEPS.length) {
        exit();
        return;
      }

      const step = CONFIG.GUIDE_STEPS[currentStep];
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
        currentStep === CONFIG.GUIDE_STEPS.length - 1 ? "完成指引" : "下一步";

      document.getElementById("tip-current-step").textContent = currentStep + 1;
      document.getElementById("tip-total-steps").textContent =
        CONFIG.GUIDE_STEPS.length;
    }

    function start() {
      if (self.state.currentScreenId !== "screen-1") {
        self.showAlert("info", "請先回到首頁才能啟動新手導覽。");
        return;
      }
      if (self.state.isTransitioning) return;

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
        this.performTransition(targetId);
      });
    });

    // 2. Lottie 開始遊戲按鈕 (Screen 1 Start)
    this.dom.lottieStartBtn.addEventListener("click", () => {
      if (this.state.isTransitioning) return;
      this.performTransition(this.dom.lottieStartBtn.dataset.target);
    });

    // 3. 食材選擇
    this.dom.ingredientCards.forEach((card) => {
      card.addEventListener("click", (e) => this.handleIngredientSelection(e));
    });

    // 4. 影片結束
    if (this.dom.castingVideo) {
      this.dom.castingVideo.addEventListener("ended", () =>
        this.handleVideoEnd()
      );
    }

    // 5. Modal 關閉/重置
    const resetHandler = () => {
      this.dom.resultModal.classList.remove("active");
      this.dom.resultModal.style.display = "none";
      this.performTransition("screen-1");
    };

    this.dom.modalCloseBtn.addEventListener("click", resetHandler);
    this.dom.saveToGalleryBtn.addEventListener("click", () => {
      this.dom.resultModal.classList.remove("active");
      this.dom.resultModal.style.display = "none";
      this.performTransition("screen-gallery");
      this.showAlert("success", "結果已儲存到圖鑑！");
    });

    // 6. 永久 UI 按鈕
    this.dom.volumeBtn.addEventListener("click", () => {
      this.state.isMuted = !this.state.isMuted;
      this.dom.volumeBtn.textContent = this.state.isMuted ? "🔇" : "🔊";
      this.showAlert("info", this.state.isMuted ? "已關閉音效" : "已開啟音效");
      if (this.dom.castingVideo) {
        this.dom.castingVideo.muted = this.state.isMuted;
      }
    });

    // 7. 新手導覽按鈕 (僅點擊時啟動)
    this.dom.guideBtn.addEventListener("click", () => this.Guide.start());

    // 8. 設置按鈕
    this.dom.settingsBtn.addEventListener("click", (e) => {
      this.performTransition(e.currentTarget.dataset.target);
    });

    // 9. 施法按鈕 (Cast Spell)
    if (this.dom.castSpellBtn) {
      this.dom.castSpellBtn.addEventListener("click", () => {
        if (!this.dom.castSpellBtn.disabled) {
          this.performTransition(this.dom.castSpellBtn.dataset.target);
        } else {
          this.showAlert("error", "請選擇 1 到 3 種食材才能施法！");
        }
      });
    }
  }
}

// =========================================================================
// III. 程式碼啟動點 (Entry Point)
// =========================================================================

document.addEventListener("DOMContentLoaded", () => {
  new GameController();
});
