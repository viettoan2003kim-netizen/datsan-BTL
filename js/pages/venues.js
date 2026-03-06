document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("venueGrid");
  const form = document.getElementById("filterForm");
  const qInput = document.getElementById("q");
  const citySelect = document.getElementById("city");

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
        return `
          <a class="card venue-card" href="./venues details.html?id=${encodeURIComponent(v.id)}">
            <img class="venue-card__img" src="${v.images[0]}" alt="${v.name}" />
            <div class="venue-card__body">
              <h3 style="margin:0 0 6px">${v.name}</h3>
              <div class="muted">${v.location.district}, ${v.location.city}</div>
              <div style="margin-top:8px; font-weight:700">Từ ${window.formatVND(v.priceFrom)}/giờ</div>
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

    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (city) next.set("city", city);

    history.replaceState(
      null,
      "",
      "./venues.html" + (next.toString() ? "?" + next.toString() : ""),
    );
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    apply();
  });

  apply();
});
