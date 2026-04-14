/* =========================================================
   app.js — Global utilities
   ========================================================= */

// ---------- Partial loader ----------
async function loadPartial(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    el.innerHTML = await res.text();
  } catch (err) {
    console.warn(`loadPartial(${url}):`, err.message);
  }
}

// ---------- Nav toggle ----------
function initNavbarToggle() {
  const btn = document.querySelector(".nav-toggle");
  const menu = document.getElementById("navMenu");
  if (!btn || !menu) return;

  btn.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (!btn.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    }
  });
}

// ---------- Format VND ----------
function formatVND(value) {
  try {
    return new Intl.NumberFormat("vi-VN").format(value) + "đ";
  } catch {
    return value + "đ";
  }
}
window.formatVND = formatVND;

// ---------- Toast system (replaces alert) ----------
function showToast(message, type = "ok", duration = 3000) {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast--${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = "toastOut 0.25s ease forwards";
    setTimeout(() => toast.remove(), 260);
  }, duration);
}
window.showToast = showToast;

// ---------- Auth nav renderer ----------
function renderAuthNav() {
  const navActions = document.getElementById("navActions");
  if (!navActions) return;

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  if (!currentUser) {
    // Already showing login/register buttons from navbar.html
    return;
  }

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

  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    showToast("Bạn đã đăng xuất.", "ok");
    setTimeout(() => { window.location.href = "/index.html"; }, 800);
  });
}

// ---------- Resolve data path (works from any depth) ----------
function getDataPath() {
  // Use absolute path so it works regardless of page depth
  return "/data/venues.json";
}
window.getDataPath = getDataPath;

// ---------- Boot ----------
document.addEventListener("DOMContentLoaded", async () => {
  await loadPartial("#site-navbar", "/partials/navbar.html");
  await loadPartial("#site-footer", "/partials/footer.html");
  initNavbarToggle();
  renderAuthNav();
});
