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
function makeCode() {
  return "BK-" + Math.floor(1000 + Math.random() * 9000);
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const venueImage = document.getElementById("venueImage");
  const venueName = document.getElementById("venueName");
  const venueAddress = document.getElementById("venueAddress");
  const venueRating = document.getElementById("venueRating");
  const venueHours = document.getElementById("venueHours");
  const venuePhone = document.getElementById("venuePhone");
  const amenitiesEl = document.getElementById("amenities");

  const fieldSelect = document.getElementById("fieldSelect");
  const dateSelect = document.getElementById("dateSelect");
  const slotList = document.getElementById("slotList");
  const chosenSlot = document.getElementById("chosenSlot");
  const chosenPreview = document.getElementById("chosenPreview");
  const bookingForm = document.getElementById("bookingForm");

  const data = await fetch("../data/data/venues.json").then((r) => r.json());
  const venue = (data.venues || []).find((v) => v.id === id);

  if (!venue) {
    venueName.textContent = "Không tìm thấy sân.";
    return;
  }

  // Render info
  venueImage.src = venue.images[0];
  venueName.textContent = venue.name;
  venueAddress.textContent = `${venue.location.address}, ${venue.location.district}, ${venue.location.city}`;
  venueRating.textContent = `${venue.rating} ★`;
  venueHours.textContent = `Mở cửa: ${venue.openHours.start}–${venue.openHours.end}`;
  venuePhone.textContent = `☎ ${venue.phone}`;

  amenitiesEl.innerHTML = venue.amenities
    .map((a) => `<span class="badge">${a}</span>`)
    .join("");

  // Fields options
  fieldSelect.innerHTML = venue.fields
    .map((f) => `<option value="${f.id}">${f.name} (Sân ${f.type})</option>`)
    .join("");

  // Dates options (lấy từ meta.scheduleDates)
  const dates =
    data.meta && data.meta.scheduleDates ? data.meta.scheduleDates : [];
  dateSelect.innerHTML = dates
    .map((d) => `<option value="${d}">${d}</option>`)
    .join("");

  let selected = null; // {date, fieldId, start, end, price}

  function renderSlots() {
    chosenSlot.value = "";
    chosenPreview.textContent = "Chưa chọn giờ.";
    selected = null;

    const fieldId = fieldSelect.value;
    const date = dateSelect.value;

    const field = venue.fields.find((f) => f.id === fieldId);
    const slots =
      field && field.slotsByDate && field.slotsByDate[date]
        ? field.slotsByDate[date]
        : [];

    if (!slots.length) {
      slotList.innerHTML = `<div class="help">Chưa có dữ liệu slot cho ngày này.</div>`;
      return;
    }

    slotList.innerHTML = slots
      .map((s, idx) => {
        const disabled = s.status !== "available" ? "disabled" : "";
        const statusBadge =
          s.status === "available"
            ? `<span class="badge badge--ok">Trống</span>`
            : s.status === "booked"
              ? `<span class="badge badge--bad">Đã đặt</span>`
              : `<span class="badge">Khóa</span>`;

        return `
        <button type="button" class="slot-btn" data-idx="${idx}" ${disabled}>
          <span><strong>${s.start}–${s.end}</strong> • ${window.formatVND(s.price)}</span>
          ${statusBadge}
        </button>
      `;
      })
      .join("");

    // click select
    slotList.querySelectorAll(".slot-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        slotList
          .querySelectorAll(".slot-btn")
          .forEach((b) => b.classList.remove("is-selected"));

        const idx = Number(btn.dataset.idx);
        const s = slots[idx];

        btn.classList.add("is-selected");
        selected = {
          date,
          fieldId,
          start: s.start,
          end: s.end,
          price: s.price,
        };

        chosenSlot.value = `${date}|${fieldId}|${s.start}`;
        chosenPreview.textContent = `Bạn chọn: ${date} • ${s.start}–${s.end} • ${window.formatVND(s.price)}`;
      });
    });
  }

  fieldSelect.addEventListener("change", renderSlots);
  dateSelect.addEventListener("change", renderSlots);

  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!selected) {
      alert("Bạn chưa chọn giờ.");
      return;
    }

    const field = venue.fields.find((f) => f.id === selected.fieldId);
    const code = makeCode();

    const booking = {
      code,
      venueId: venue.id,
      venueName: venue.name,
      fieldId: field.id,
      fieldName: field.name,
      date: selected.date,
      start: selected.start,
      end: selected.end,
      price: selected.price,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    const list = getLocalBookings();
    list.unshift(booking);
    setLocalBookings(list);

    alert(`Đặt sân thành công! Mã: ${code}`);
    window.location.href = "/bookings.html";
  });

  renderSlots();
});
