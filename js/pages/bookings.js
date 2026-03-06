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
  const root = document.getElementById("bookingList");
  const list = getLocalBookings();

  function render() {
    const bookings = getLocalBookings();
    if (!bookings.length) {
      root.innerHTML = `<div class="card card--padded" style="grid-column:1/-1">Chưa có booking nào. <a href="/venues.html" style="text-decoration:underline">Đặt sân ngay</a></div>`;
      return;
    }

    root.innerHTML = bookings
      .map(
        (b, idx) => `
      <div class="card card--padded">
        <div style="display:flex; justify-content:space-between; gap:10px; align-items:start">
          <div>
            <div class="badge badge--ok">${b.code}</div>
            <h3 style="margin:10px 0 4px">${b.venueName}</h3>
            <div class="muted">${b.fieldName} • ${b.date} • ${b.start}–${b.end}</div>
          </div>
          <div class="price">${window.formatVND(b.price)}</div>
        </div>

        <hr class="hr" />
        <button class="btn btn--ghost btn--full" data-cancel="${idx}">Hủy booking (demo)</button>
      </div>
    `,
      )
      .join("");

    root.querySelectorAll("[data-cancel]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.cancel);
        const next = getLocalBookings();
        next.splice(i, 1);
        setLocalBookings(next);
        render();
      });
    });
  }

  render();
});
