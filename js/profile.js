document.addEventListener("DOMContentLoaded", async () => {
  requireLogin();

  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  if (!currentUser) return;

  const basicEl = document.getElementById("profileBasic");
  const favoriteLocationEl = document.getElementById("favoriteLocation");
  const favoriteVenuesEl = document.getElementById("favoriteVenues");
  const bookingHistoryEl = document.getElementById("bookingHistory");

  const allBookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  const myBookings = allBookings.filter(
    (booking) => booking.userEmail === currentUser.email,
  );

  const favoriteVenueIds = JSON.parse(
    localStorage.getItem(`favoriteVenues_${currentUser.email}`) || "[]",
  );

  let venuesData = { venues: [] };
  try {
    venuesData = await fetch("/data/data/venues.json").then((r) => r.json());
  } catch (err) {
    console.error("Không tải được venues.json", err);
  }

  const venues = venuesData.venues || [];

  // 1) Thông tin cơ bản
  const avatarLetter = currentUser.name
    ? currentUser.name.trim().charAt(0).toUpperCase()
    : "U";

  basicEl.innerHTML = `
    <div class="user-box" style="margin-bottom:16px">
      <div class="user-avatar" style="width:56px;height:56px">${avatarLetter}</div>
      <div>
        <div style="font-size:1.1rem; font-weight:700">${currentUser.name || "Chưa cập nhật"}</div>
        <div class="muted">${currentUser.email || "Chưa có email"}</div>
      </div>
    </div>

    <div class="grid" style="gap:8px">
      <div><strong>Số điện thoại:</strong> ${currentUser.phone || "Chưa cập nhật"}</div>
      <div><strong>Ngày sinh:</strong> ${currentUser.birthDate || "Chưa cập nhật"}</div>
      <div><strong>Giới tính:</strong> ${currentUser.gender || "Chưa cập nhật"}</div>
    </div>
  `;

  // 2) Vị trí thường chơi
  const locationCount = {};
  myBookings.forEach((booking) => {
    const key = booking.locationText || booking.district || booking.city || "";
    if (!key) return;
    locationCount[key] = (locationCount[key] || 0) + 1;
  });

  const sortedLocations = Object.entries(locationCount).sort(
    (a, b) => b[1] - a[1],
  );
  favoriteLocationEl.textContent = sortedLocations.length
    ? `${sortedLocations[0][0]} (${sortedLocations[0][1]} lần đặt)`
    : "Chưa có dữ liệu vị trí thường chơi.";

  // 3) Sân yêu thích
  const favoriteVenues = venues.filter((venue) =>
    favoriteVenueIds.includes(venue.id),
  );

  if (!favoriteVenues.length) {
    favoriteVenuesEl.innerHTML = `<div class="muted" style="grid-column:1/-1">Bạn chưa có sân yêu thích nào.</div>`;
  } else {
    favoriteVenuesEl.innerHTML = favoriteVenues
      .map(
        (venue) => `
        <a class="card venue-card" href="./venues details.html?id=${encodeURIComponent(venue.id)}">
          <img class="venue-card__img" src="${venue.images[0]}" alt="${venue.name}" />
          <div class="venue-card__body">
            <h3 style="margin:0 0 6px">${venue.name}</h3>
            <div class="muted">${venue.location.district}, ${venue.location.city}</div>
            <div style="margin-top:8px;font-weight:700">Từ ${window.formatVND(venue.priceFrom)}/giờ</div>
          </div>
        </a>
      `,
      )
      .join("");
  }

  // 4) Lịch sử đặt sân
  if (!myBookings.length) {
    bookingHistoryEl.innerHTML = `<div class="muted" style="grid-column:1/-1">Bạn chưa có booking nào.</div>`;
  } else {
    bookingHistoryEl.innerHTML = myBookings
      .map(
        (booking) => `
        <div class="card card--padded">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:start">
            <div>
              <div class="badge">${booking.code || "BK"}</div>
              <h3 style="margin:10px 0 4px">${booking.venueName || "Chưa rõ sân"}</h3>
              <div class="muted">
                ${booking.fieldName || ""} • ${booking.date || ""} • ${booking.start || ""}-${booking.end || ""}
              </div>
            </div>
            <div style="font-weight:700">${window.formatVND(booking.price || 0)}</div>
          </div>
        </div>
      `,
      )
      .join("");
  }
});
