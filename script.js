/**
 * Khởi chạy ứng dụng Ecosystem
 */
function initEcosystem() {
  fetchData("ecosystem.json")
    .then(data => renderEcosystem(data))
    .then(() => {
      initTiltEffect();
      initScrollReveal();
      animateLogosOnLoad();
    })
    .catch(err => console.error("Lỗi load ecosystem.json:", err));
}

/**
 * Lấy dữ liệu JSON từ file
 * @param {string} url
 * @returns {Promise<object>}
 */
function fetchData(url) {
  return fetch(url).then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  });
}

/**
 * Escape string để tránh XSS khi in vào HTML
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (typeof str !== "string") return str;
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Render toàn bộ ecosystem ra giao diện
 * @param {object} ecosystem
 */
function renderEcosystem(ecosystem) {
  const container = document.getElementById("ecosystem");
  container.innerHTML = "";

  // Những category muốn có hiệu ứng glass/frosted
  const frostedCategories = new Set(["tool", "wallet", "other", "defi", "nft", "memecoin"]);
  Object.entries(ecosystem).forEach(([category, projects]) => {
    const isFrosted = frostedCategories.has(category.toLowerCase());
    const card = createCategoryCard(category, projects, isFrosted);
    container.appendChild(card);
  });
}

/**
 * Tạo card theo từng category
 * @param {string} category
 * @param {Array} projects
 * @param {boolean} isFrosted - nếu true áp class glass-card
 * @returns {HTMLElement}
 */
function createCategoryCard(category, projects, isFrosted) {
  const card = document.createElement("div");
  // nếu frosted thì dùng lớp .glass-card, ngược lại dùng bg-white/80
  const baseClass = isFrosted ? "glass-card" : "bg-white/80";
  card.className = `${baseClass} rounded-2xl shadow-xl p-6`;

  card.innerHTML = `
    <h2 class="text-2xl font-bold text-orange-600 text-center mb-6">${escapeHtml(category)}</h2>
    <div class="grid grid-cols-3 gap-6">
      ${projects.map(p => createProjectItem(p)).join("")}
    </div>
  `;
  return card;
}

/**
 * Tạo HTML string cho 1 dự án
 * @param {object} project - {name, logo}
 * @returns {string}
 */
function createProjectItem(project) {
  const name = escapeHtml(project.name || "");
  const logo = escapeHtml(project.logo || "");

  // ⚡ Tilt chỉ áp dụng cho .logo-glass, không bao text
  return `
    <div class="flex flex-col items-center cursor-pointer">
      <div class="logo-glass tilt">
        <img src="${logo}" alt="${name}" />
      </div>
      <p class="text-xs mt-2 font-medium text-gray-700">${name}</p>
    </div>
  `;
}

/**
 * Kích hoạt hiệu ứng VanillaTilt
 */
function initTiltEffect() {
  VanillaTilt.init(document.querySelectorAll(".tilt"), {
    max: 18,
    speed: 450,
    glare: true,
    "max-glare": 0.28,
  });
}

function initScrollReveal() {
  // Khi scroll tới mỗi card
  ScrollReveal().reveal(".glass-card, .bg-white\\/80", {
    origin: "bottom",
    distance: "40px",
    duration: 800,
    interval: 200,
    scale: 0.95,
    opacity: 0.3
  });
}

/**
 * Animate logo pop effect khi vừa render DOM
 */
function animateLogosOnLoad() {
  const logos = document.querySelectorAll(".logo-glass");
  logos.forEach((logo, idx) => {
    // delay khác nhau cho từng logo để stagger
    const delay = idx * 100;

    anime({
      targets: logo,
      scale: [0.6, 1],
      opacity: [0, 1],
      easing: "easeOutElastic(1, .8)",
      delay: delay + 300,
      duration: 800
    });
  });
}

function addParticleEffectToLogo(logoSelector) {
  const logo = document.querySelector(logoSelector);

  if (!logo) return;

  // Tạo canvas bên trong logo
  const canvas = document.createElement("div");
  canvas.className = "particle-canvas";
  logo.appendChild(canvas);

  tsParticles.load(canvas, {
    particles: {
      number: { value: 0 }, // ban đầu không có hạt
      color: { value: ["#ffcc00", "#ff66cc", "#66ccff"] },
      shape: { type: "circle" },
      opacity: { value: 0.8 },
      size: { value: { min: 2, max: 5 } },
      move: { enable: true, speed: 2, direction: "none", random: true },
    },
    interactivity: {
      events: {
        onHover: { enable: true, mode: "trail" }, // khi hover thì tạo hạt
      },
      modes: {
        trail: {
          delay: 0.005,
          quantity: 6,
        },
      },
    },
    background: { color: "transparent" }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  addParticleEffectToLogo(".logo-glass");
});

// Gọi khởi chạy
initEcosystem();
