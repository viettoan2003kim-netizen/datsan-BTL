document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("venueGrid");
  const form = document.getElementById("filterForm");
  const qInput = document.getElementById("q");
  const citySelect = document.getElementById("city");

  // Lấy query từ URL (từ searchbar ở index.html)
  const params = new URLSearchParams(window.location.search);
  qInput.value = params.get("q") || "";
  citySelect.value = params.get("city") || "";

  const data = await fetch("../data/data/venues.json").then((r) => r.json());
  const venues = data.venues || [];

  function matches(venue, q, city) {
    const text = (
      venue.name +
      " " +
      venue.location.city +
      " " +
      venue.location.district
    ).toLowerCase();
    const qOk = !q || text.includes(q.toLowerCase());
    const cityOk = !city || venue.location.city === city;
    return qOk && cityOk;
  }

  function render(list) {
    if (!list.length) {
      grid.innerHTML = `<div class="card card--padded" style="grid-column:1/-1">Không tìm thấy sân phù hợp.</div>`;
      return;
    }

    grid.innerHTML = list
      .map((v) => {
        const types = v.fields.map((f) => `Sân ${f.type}`).join(" • ");
        return `
        <a class="card venue-card" href="/venue-detail.html?id=${encodeURIComponent(v.id)}">
          <img class="venue-card__img" src="${v.images[0]}" alt="${v.name}" loading="lazy" />
          <div class="venue-card__body">
            <div class="venue-card__top">
              <div>
                <h3 style="margin:0 0 4px">${v.name}</h3>
                <div class="muted" style="font-size:0.92rem">${v.location.district}, ${v.location.city}</div>
              </div>
              <span class="badge badge--ok">${v.rating} ★</span>
            </div>

            <div style="display:flex; justify-content:space-between; gap:10px; align-items:center">
              <div class="price">Từ ${window.formatVND(v.priceFrom)}/giờ</div>
              <div class="muted" style="font-size:0.9rem">${types}</div>
            </div>
          </div>
        </a>
      `;
      })
      .join("");
  }

  function apply() {
    const q = qInput.value.trim();
    const city = citySelect.value;
    const filtered = venues.filter((v) => matches(v, q, city));
    render(filtered);

    // Update URL
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (city) next.set("city", city);
    history.replaceState(
      null,
      "",
      "/venues.html" + (next.toString() ? "?" + next.toString() : ""),
    );
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    apply();
  });

  apply();
});
