// 卡片資料：首頁拼貼格與 Hover Gallery 共用
const cards = [
  {
    title: "Arcane Pantry",
    subtitle: "靜置中的香氣會自己說故事。",
    color: "var(--accent-celadon)",
    link: "#story",
    span: { cols: 2, rows: 2 },
  },
  {
    title: "Orbiting Egg",
    subtitle: "月光下的米特蛋正緩慢旋轉。",
    color: "var(--accent-mist)",
    link: "#home",
    span: { cols: 2, rows: 3 },
  },
  {
    title: "Field Notes",
    subtitle: "將香料、失眠與勇氣裝訂成冊。",
    color: "var(--accent-ember)",
    link: "#future-select-main",
    span: { cols: 2, rows: 2 },
  },
  {
    title: "Alchemy Drafts",
    subtitle: "配方的塗鴉比公式更誠實。",
    color: "var(--accent-ink)",
    link: "#future-select-ingredients",
    span: { cols: 3, rows: 2 },
  },
  {
    title: "Result Atlas",
    subtitle: "56 種結局像 56 種氣味的平行宇宙。",
    color: "var(--accent-glow)",
    link: "#future-result",
    span: { cols: 2, rows: 2 },
  },
  {
    title: "Gallery Drift",
    subtitle: "放大的米特蛋肖像，像翻閱雜誌。",
    color: "var(--accent-pearl)",
    link: "#future-gallery",
    span: { cols: 3, rows: 2 },
  },
  {
    title: "Premium Lab",
    subtitle: "付費版的秘密房間，裡頭有柔光與氣泡。",
    color: "var(--accent-haze)",
    link: "#future-premium",
    span: { cols: 2, rows: 2 },
  },
  {
    title: "Soft Spells",
    subtitle: "呼吸式的微動畫，像魔法在紙上拉線。",
    color: "var(--accent-rose)",
    link: "#hover-gallery",
    span: { cols: 2, rows: 2 },
  },
  {
    title: "Midnight Broth",
    subtitle: "霧面玻璃下的湯面折射出綠光。",
    color: "var(--accent-mist)",
    link: "#story",
    span: { cols: 2, rows: 2 },
  },
];

function createCard(card, variant = "hover") {
  const item = document.createElement("a");
  item.className = variant === "hero" ? "grid-card" : "hover-card";
  item.href = card.link;
  item.style.setProperty("--card-bg", card.color);

  if (variant === "hero") {
    item.style.gridColumn = `span ${card.span.cols}`;
    item.style.gridRow = `span ${card.span.rows}`;
  } else {
    item.style.gridColumn = `span ${Math.max(1, card.span.cols - 1)}`;
    item.style.gridRow = `span ${Math.max(1, card.span.rows)}`;
  }

  const title = document.createElement("h3");
  title.className = "card-title";
  title.textContent = card.title;

  const subtitle = document.createElement("p");
  subtitle.className = "card-subtitle";
  subtitle.textContent = card.subtitle;

  const arrow = document.createElement("span");
  arrow.className = "card-arrow";
  arrow.textContent = "↗";

  item.append(title, subtitle, arrow);
  return item;
}

function renderCards(containerId, variant) {
  const container = document.getElementById(containerId);
  if (!container) return;
  cards.forEach((card) => container.appendChild(createCard(card, variant)));
}

function createMarquee(containerId, text) {
  const root = document.getElementById(containerId);
  if (!root) return;
  const track = document.createElement("div");
  track.className = "marquee-track";
  const segment = document.createElement("span");
  segment.textContent = text;
  segment.className = "marquee-segment";
  for (let i = 0; i < 6; i += 1) {
    track.appendChild(segment.cloneNode(true));
  }
  root.appendChild(track);
}

function initPage() {
  renderCards("grid-hero-cards", "hero");
  renderCards("hover-gallery-grid", "hover");
  createMarquee(
    "footer-marquee",
    "SEND US ANYTHING • WE ARE LOOKING FOR CONTRIBUTORS • 風味、故事、照片都歡迎 • "
  );
}

document.addEventListener("DOMContentLoaded", initPage);
