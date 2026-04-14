/* =========================================================
   venues.js — Venue listing & filter page
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("venueGrid");
  const form = document.getElementById("filterForm");
  const qInput = document.getElementById("q");
  const citySelect = document.getElementById("city");

  // Restore filter state from URL
  const params = new URLSearchParams(window.location.search);
  qInput.value = params.get("q") || "";
  citySelect.value = params.get("city") || "";

  // Load data
  let venues = [];
  try {
    const data = await fetch(window.getDataPath()).then((r) => r.json());
    venues = data.venues || [];
  } catch (err) {
    grid.innerHTML = `<div class="card card--padded empty-state">
      <div class="empty-state__icon">⚠️</div>
      <div class="empty-state__title">Không tải được danh sách sân</div>
      <div class="empty-state__desc">Vui lòng thử lại sau.</div>
    </div>`;
    return;
  }

  function matches(venue, q, city) {
    const text = [
      venue.name,
      venue.location.city,
      venue.location.district,
      venue.location.address,
    ]
      .join(" ")
      .toLowerCase();

    const qOk = !q || text.includes(q.toLowerCase());
    const cityOk = !city || venue.location.city === city;
    return qOk && cityOk;
  }

  function renderStars(rating) {
    const full = Math.round(rating);
    return "★".repeat(full) + "☆".repeat(5 - full);
  }

  function render(list) {
    if (!list.length) {
      grid.innerHTML = `
        <div class="card card--padded empty-state">
          <div class="empty-state__icon">🔍</div>
          <div class="empty-state__title">Không tìm thấy sân phù hợp</div>
          <div class="empty-state__desc">Thử tìm với từ khóa khác hoặc bỏ bộ lọc thành phố.</div>
        </div>`;
      return;
    }

    grid.innerHTML = list
      .map(
        (v) => `
        <a class="card venue-card" href="/venues_details.html?id=${encodeURIComponent(v.id)}">
          <img class="venue-card__img" src="${v.images[0]}" alt="${v.name}" loading="lazy" />
          <div class="venue-card__body">
            <div class="venue-card__top">
              <h3 style="margin:0">${v.name}</h3>
              <span class="badge badge--ok">${v.rating}★</span>
            </div>
            <div class="muted" style="font-size:0.88rem">
              📍 ${v.location.district}, ${v.location.city}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:4px">
              <div class="price">Từ ${window.formatVND(v.priceFrom)}/giờ</div>
              <div class="muted" style="font-size:0.8rem">⏰ ${v.openHours.start}–${v.openHours.end}</div>
            </div>
          </div>
        </a>`
      )
      .join("");
  }

  function apply() {
    const q = qInput.value.trim();
    const city = citySelect.value;
    const filtered = venues.filter((v) => matches(v, q, city));
    render(filtered);

    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (city) next.set("city", city);
    history.replaceState(null, "", "/venues.html" + (next.toString() ? "?" + next.toString() : ""));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    apply();
  });

  // Live search on input
  qInput.addEventListener("input", () => apply());

  apply();
});
