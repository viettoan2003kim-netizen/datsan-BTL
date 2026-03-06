async function loadPartial(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;

  const res = await fetch(url);
  el.innerHTML = await res.text();
}

function initNavbarToggle() {
  const btn = document.querySelector(".nav-toggle");
  const menu = document.getElementById("navMenu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });
}

function formatVND(value) {
  try {
    return new Intl.NumberFormat("vi-VN").format(value) + "đ";
  } catch {
    return value + "đ";
  }
}

window.formatVND = formatVND;

document.addEventListener("DOMContentLoaded", async () => {
  await loadPartial("#site-navbar", "/partials/navbar.html");
  await loadPartial("#site-footer", "/partials/footer.html");
  initNavbarToggle();
  renderAuthNav();
});
function renderAuthNav() {
  const navActions = document.getElementById("navActions");
  if (!navActions) return;

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (!currentUser) return;

  const firstLetter = currentUser.name
    ? currentUser.name.trim().charAt(0).toUpperCase()
    : "U";

  navActions.innerHTML = `
    <div class="user-box">
      <div class="user-avatar">${firstLetter}</div>
      <span class="user-name">${currentUser.name}</span>
      <button class="btn btn--ghost" id="logoutBtn" type="button">Đăng xuất</button>
    </div>
  `;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      alert("Bạn đã đăng xuất.");
      window.location.href = "./index.html";
    });
  }
}
