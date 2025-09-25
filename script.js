/**
 * Khởi chạy ứng dụng Ecosystem
 */
function initEcosystem() {
  fetchData("ecosystem.json")
    .then(data => renderEcosystem(data))
    .then(() => initTiltEffect())
    .catch(err => console.error("Lỗi load ecosystem.json:", err));
}

/**
 * Lấy dữ liệu JSON từ file
 * @param {string} url - Đường dẫn đến file JSON
 * @returns {Promise<object>}
 */
function fetchData(url) {
  return fetch(url).then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  });
}

/**
 * Render toàn bộ ecosystem ra giao diện
 * @param {object} ecosystem - dữ liệu từ ecosystem.json
 */
function renderEcosystem(ecosystem) {
  const container = document.getElementById("ecosystem");
  container.innerHTML = ""; // clear nếu đã có data cũ

  Object.entries(ecosystem).forEach(([category, projects]) => {
    const card = createCategoryCard(category, projects);
    container.appendChild(card);
  });
}

/**
 * Tạo card theo từng category
 * @param {string} category - tên category (DeFi, NFT,...)
 * @param {Array} projects - danh sách dự án trong category
 * @returns {HTMLElement}
 */
function createCategoryCard(category, projects) {
  const card = document.createElement("div");
  card.className = "bg-white/80 rounded-2xl shadow-xl p-6";

  card.innerHTML = `
    <h2 class="text-2xl font-bold text-orange-600 text-center mb-6">${category}</h2>
    <div class="grid grid-cols-3 gap-6">
      ${projects.map(p => createProjectItem(p)).join("")}
    </div>
  `;
  return card;
}

/**
 * Tạo HTML string cho 1 dự án
 * @param {object} project - gồm {name, logo}
 * @returns {string}
 */
function createProjectItem(project) {
  return `
    <div class="flex flex-col items-center tilt cursor-pointer">
      <img src="${project.logo}" alt="${project.name}" 
        class="w-20 h-20 rounded-full border border-orange-300 shadow-lg" />
      <p class="text-xs mt-2 font-medium text-gray-700">${project.name}</p>
    </div>
  `;
}

/**
 * Kích hoạt hiệu ứng VanillaTilt
 */
function initTiltEffect() {
  VanillaTilt.init(document.querySelectorAll(".tilt"), {
    max: 20,
    speed: 400,
    glare: true,
    "max-glare": 0.3
  });
}

// Gọi khởi chạy
initEcosystem();
