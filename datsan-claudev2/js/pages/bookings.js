/* =========================================================
   bookings.js — My bookings page
   ========================================================= */

function getLocalBookings() {
  try {
    return JSON.parse(localStorage.getItem("bookings") || "[]");
  } catch {
    return [];
  }
}

function setLocalBookings(list) {
  localStorage.setItem("bookings", JSON.stringify(list));
}

document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return;

  const root = document.getElementById("bookingList");
  const currentUser = getCurrentUser();

  function getMyBookings() {
    const all = getLocalBookings();
    // Filter by current user email if available; else show all (backward compat)
    return all.filter((b) => !b.userEmail || b.userEmail === currentUser.email);
  }

  function getStatusBadge(status) {
    if (status === "confirmed") return `<span class="badge badge--ok">✓ Đã xác nhận</span>`;
    if (status === "cancelled") return `<span class="badge badge--bad">✗ Đã hủy</span>`;
    return `<span class="badge">${status || "Pending"}</span>`;
  }

  function formatDate(dateStr) {
    try {
      return new Date(dateStr).toLocaleDateString("vi-VN", {
        weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  function render() {
    const bookings = getMyBookings();

    if (!bookings.length) {
      root.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">📋</div>
          <div class="empty-state__title">Chưa có booking nào</div>
          <div class="empty-state__desc">Đặt sân ngay để bắt đầu hành trình thể thao!</div>
          <a class="btn btn--primary" href="/venues.html">🔍 Xem danh sách sân</a>
        </div>`;
      return;
    }

    root.innerHTML = bookings
      .map(
        (b, idx) => `
        <div class="card card--padded">
          <div style="display:flex; justify-content:space-between; gap:10px; align-items:start; flex-wrap:wrap">
            <div>
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-bottom:8px">
                <span class="badge">${b.code}</span>
                ${getStatusBadge(b.status)}
              </div>
              <h3 style="margin:0 0 4px">${b.venueName}</h3>
              <div class="muted" style="font-size:0.9rem">
                🏟️ ${b.fieldName} &nbsp;·&nbsp;
                📅 ${formatDate(b.date)} &nbsp;·&nbsp;
                ⏰ ${b.start}–${b.end}
              </div>
            </div>
            <div class="price" style="white-space:nowrap">${window.formatVND(b.price)}</div>
          </div>

          <hr class="hr" />

          <div style="display:flex; gap:10px; flex-wrap:wrap">
            <a class="btn btn--ghost" href="/venues_details.html?id=${b.venueId}" style="flex:1; min-width:120px">
              Xem sân
            </a>
            ${b.status !== "cancelled" ? `
            <button class="btn btn--ghost" data-cancel="${idx}"
              style="flex:1; min-width:120px; color:#fca5a5; border-color:rgba(239,68,68,0.3)">
              Hủy booking
            </button>` : ""}
          </div>
        </div>`
      )
      .join("");

    root.querySelectorAll("[data-cancel]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!confirm("Bạn có chắc muốn hủy booking này?")) return;

        const allBookings = getLocalBookings();
        // Mark as cancelled instead of deleting
        const myBookings = getMyBookings();
        const targetCode = myBookings[Number(btn.dataset.cancel)].code;

        const updated = allBookings.map((b) =>
          b.code === targetCode ? { ...b, status: "cancelled" } : b
        );
        setLocalBookings(updated);
        showToast("Đã hủy booking.", "ok");
        render();
      });
    });
  }

  render();
});
