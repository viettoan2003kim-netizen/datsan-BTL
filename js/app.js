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
  // Dùng đường dẫn tuyệt đối để owner pages (/owner/...) vẫn load được.
  await loadPartial("#site-navbar", "/partials/navbar.html");
  await loadPartial("#site-footer", "/partials/footer.html");
  initNavbarToggle();
});
