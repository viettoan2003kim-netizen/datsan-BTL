/* =========================================================
   venue-detail.js — Venue detail & booking
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

function makeCode() {
  return "BK-" + Math.floor(1000 + Math.random() * 9000);
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const venueImage   = document.getElementById("venueImage");
  const venueName    = document.getElementById("venueName");
  const venueAddress = document.getElementById("venueAddress");
  const venueRating  = document.getElementById("venueRating");
  const venueHours   = document.getElementById("venueHours");
  const venuePhone   = document.getElementById("venuePhone");
  const amenitiesEl  = document.getElementById("amenities");
  const fieldSelect  = document.getElementById("fieldSelect");
  const dateSelect   = document.getElementById("dateSelect");
  const slotList     = document.getElementById("slotList");
  const chosenSlot   = document.getElementById("chosenSlot");
  const chosenPreview = document.getElementById("chosenPreview");
  const bookingForm  = document.getElementById("bookingForm");

  if (!id) {
    venueName.textContent = "Thiếu ID sân.";
    return;
  }

  let data, venue;
  try {
    data = await fetch(window.getDataPath()).then((r) => r.json());
    venue = (data.venues || []).find((v) => v.id === id);
  } catch (err) {
    venueName.textContent = "Không tải được dữ liệu.";
    return;
  }

  if (!venue) {
    venueName.textContent = "Không tìm thấy sân.";
    return;
  }

  // ---- Render info ----
  venueImage.src = venue.images[0];
  venueImage.alt = venue.name;
  venueName.textContent = venue.name;
  venueAddress.textContent = `${venue.location.address}, ${venue.location.district}, ${venue.location.city}`;
  venueRating.textContent = `${venue.rating} ★`;
  venueHours.textContent = `⏰ ${venue.openHours.start}–${venue.openHours.end}`;
  venuePhone.textContent = `☎ ${venue.phone}`;

  amenitiesEl.innerHTML = venue.amenities
    .map((a) => `<span class="badge">${a}</span>`)
    .join("");

  // ---- Image gallery (thumbnails) ----
  if (venue.images.length > 1) {
    const thumbsEl = document.getElementById("imageGallery");
    if (thumbsEl) {
      thumbsEl.innerHTML = venue.images
        .map((src, i) => `
          <img src="${src}" alt="Ảnh ${i+1}" class="gallery-thumb${i === 0 ? ' is-active' : ''}"
            style="width:70px;height:50px;object-fit:cover;border-radius:8px;cursor:pointer;border:2px solid ${i===0?'var(--brand)':'var(--border)'};opacity:${i===0?'1':'0.6'}"
            data-src="${src}" />`)
        .join("");
      thumbsEl.querySelectorAll(".gallery-thumb").forEach((thumb) => {
        thumb.addEventListener("click", () => {
          venueImage.src = thumb.dataset.src;
          thumbsEl.querySelectorAll(".gallery-thumb").forEach((t) => {
            t.style.borderColor = "var(--border)";
            t.style.opacity = "0.6";
          });
          thumb.style.borderColor = "var(--brand)";
          thumb.style.opacity = "1";
        });
      });
    }
  }

  // ---- Field options ----
  fieldSelect.innerHTML = venue.fields
    .map((f) => `<option value="${f.id}">${f.name} — Sân ${f.type} (${f.surface})</option>`)
    .join("");

  // ---- Date options ----
  const dates = data.meta?.scheduleDates || [];
  dateSelect.innerHTML = dates
    .map((d) => {
      const date = new Date(d);
      const label = date.toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" });
      return `<option value="${d}">${label} (${d})</option>`;
    })
    .join("");

  let selected = null;

  function renderSlots() {
    chosenSlot.value = "";
    chosenPreview.textContent = "Chưa chọn giờ.";
    selected = null;

    const fieldId = fieldSelect.value;
    const date    = dateSelect.value;
    const field   = venue.fields.find((f) => f.id === fieldId);
    const slots   = field?.slotsByDate?.[date] || [];

    if (!slots.length) {
      slotList.innerHTML = `<div class="help">Chưa có dữ liệu slot cho ngày này.</div>`;
      return;
    }

    slotList.innerHTML = slots
      .map((s, idx) => {
        const isBooked  = s.status === "booked";
        const isBlocked = s.status === "blocked";
        const disabled  = isBooked || isBlocked ? "disabled" : "";

        let statusBadge = `<span class="badge badge--ok">Trống</span>`;
        if (isBooked)  statusBadge = `<span class="badge badge--bad">Đã đặt</span>`;
        if (isBlocked) statusBadge = `<span class="badge">${s.note || "Khóa"}</span>`;

        return `
          <button type="button" class="slot-btn" data-idx="${idx}" ${disabled}>
            <span><strong>${s.start}–${s.end}</strong> · ${window.formatVND(s.price)}</span>
            ${statusBadge}
          </button>`;
      })
      .join("");

    slotList.querySelectorAll(".slot-btn:not([disabled])").forEach((btn) => {
      btn.addEventListener("click", () => {
        slotList.querySelectorAll(".slot-btn").forEach((b) => b.classList.remove("is-selected"));
        const idx = Number(btn.dataset.idx);
        const s   = slots[idx];
        btn.classList.add("is-selected");
        selected = { date, fieldId, start: s.start, end: s.end, price: s.price };
        chosenSlot.value = `${date}|${fieldId}|${s.start}`;
        chosenPreview.textContent = `✅ ${date} · ${s.start}–${s.end} · ${window.formatVND(s.price)}`;
      });
    });
  }

  fieldSelect.addEventListener("change", renderSlots);
  dateSelect.addEventListener("change", renderSlots);
  renderSlots();

  // ---- Booking submit ----
  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Check login
    const user = getCurrentUser();
    if (!user) {
      showToast("Bạn cần đăng nhập để đặt sân.", "warn");
      setTimeout(() => { window.location.href = "/login.html"; }, 1000);
      return;
    }

    if (!selected) {
      showToast("Bạn chưa chọn giờ.", "err");
      return;
    }

    const field = venue.fields.find((f) => f.id === selected.fieldId);
    const code  = makeCode();

    const booking = {
      code,
      venueId:   venue.id,
      venueName: venue.name,
      fieldId:   field.id,
      fieldName: field.name,
      date:      selected.date,
      start:     selected.start,
      end:       selected.end,
      price:     selected.price,
      status:    "confirmed",
      userEmail: user.email,
      userName:  user.name,
      createdAt: new Date().toISOString(),
    };

    const list = getLocalBookings();
    list.unshift(booking);
    setLocalBookings(list);

    showToast(`Đặt sân thành công! Mã: ${code}`, "ok");
    setTimeout(() => { window.location.href = "/bookings.html"; }, 1000);
  });
});
