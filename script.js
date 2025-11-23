// Base data for hover gallery cards
const cards = [
  {
    title: "Arcane Pantry",
    subtitle: "靜置中的香氣會自己說故事。",
    color: "var(--accent-celadon)",
    link: "#story",
    span: { cols: 3, rows: 2 },
  },
  {
    title: "Orbiting Egg",
    subtitle: "月光下的米特蛋正緩慢旋轉。",
    color: "var(--accent-mist)",
    link: "#hero",
    span: { cols: 2, rows: 2 },
  },
  {
    title: "Field Notes",
    subtitle: "將香料、失眠與勇氣裝訂成冊。",
    color: "var(--accent-ember)",
    link: "#future-select-main",
    span: { cols: 2, rows: 1 },
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
    span: { cols: 2, rows: 1 },
  },
  {
    title: "Gallery Drift",
    subtitle: "放大的米特蛋肖像，像翻閱雜誌。",
    color: "var(--accent-pearl)",
    link: "#future-gallery",
    span: { cols: 2, rows: 2 },
  },
  {
    title: "Premium Lab",
    subtitle: "付費版的秘密房間，裡頭有柔光與氣泡。",
    color: "var(--accent-haze)",
    link: "#future-premium",
    span: { cols: 3, rows: 1 },
  },
];

function createCard(card) {
  const item = document.createElement("a");
  item.className = "hover-card";
  item.href = card.link;
  item.style.setProperty("--card-bg", card.color);
  item.style.gridColumn = `span ${card.span.cols}`;
  item.style.gridRow = `span ${card.span.rows}`;

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

function renderHoverGallery() {
  const gallery = document.getElementById("hover-gallery-grid");
  if (!gallery) return;
  cards.forEach((card) => gallery.appendChild(createCard(card)));
}

function createMarquee(containerId, text) {
  const root = document.getElementById(containerId);
  if (!root) return;
  const track = document.createElement("div");
  track.className = "marquee-track";
  const segment = document.createElement("span");
  segment.textContent = text;
  segment.className = "marquee-segment";
  for (let i = 0; i < 4; i += 1) {
    track.appendChild(segment.cloneNode(true));
  }
  root.appendChild(track);
}

function initPage() {
  renderHoverGallery();
  createMarquee("footer-marquee", "SEND US ANYTHING • WE ARE LOOKING FOR CONTRIBUTORS • ");
}

document.addEventListener("DOMContentLoaded", initPage);
