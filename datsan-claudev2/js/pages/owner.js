/* =========================================================
   owner.js — Owner dashboard page
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  if (!requireLogin()) return;

  const currentUser = getCurrentUser();
  const allBookings = JSON.parse(localStorage.getItem("bookings") || "[]");

  // Stats
  const totalBookings   = allBookings.length;
  const confirmedCount  = allBookings.filter((b) => b.status === "confirmed").length;
  const cancelledCount  = allBookings.filter((b) => b.status === "cancelled").length;
  const totalRevenue    = allBookings
    .filter((b) => b.status === "confirmed")
    .reduce((sum, b) => sum + (b.price || 0), 0);

  document.getElementById("statTotal").textContent     = totalBookings;
  document.getElementById("statConfirmed").textContent  = confirmedCount;
  document.getElementById("statCancelled").textContent  = cancelledCount;
  document.getElementById("statRevenue").textContent    = window.formatVND(totalRevenue);

  // Recent bookings table
  const tbody = document.getElementById("bookingTable");
  if (!allBookings.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="muted" style="text-align:center;padding:24px">Chưa có booking nào.</td></tr>`;
  } else {
    tbody.innerHTML = allBookings
      .slice(0, 20)
      .map((b) => {
        const statusBadge =
          b.status === "confirmed"
            ? `<span class="badge badge--ok">Xác nhận</span>`
            : `<span class="badge badge--bad">Đã hủy</span>`;
        return `
          <tr>
            <td><span class="badge">${b.code}</span></td>
            <td>${b.userName || b.userEmail || "—"}</td>
            <td>${b.venueName}</td>
            <td>${b.date} ${b.start}–${b.end}</td>
            <td>${window.formatVND(b.price)}</td>
            <td>${statusBadge}</td>
          </tr>`;
      })
      .join("");
  }

  // Load venue stats
  let venueStats = [];
  try {
    const data = await fetch(window.getDataPath()).then((r) => r.json());
    venueStats = (data.venues || []).map((v) => {
      const count = allBookings.filter((b) => b.venueId === v.id && b.status === "confirmed").length;
      const revenue = allBookings
        .filter((b) => b.venueId === v.id && b.status === "confirmed")
        .reduce((s, b) => s + (b.price || 0), 0);
      return { ...v, bookingCount: count, revenue };
    });
  } catch {}

  const venueTableBody = document.getElementById("venueStatsTable");
  if (venueTableBody) {
    venueTableBody.innerHTML = venueStats
      .map(
        (v) => `
        <tr>
          <td><a href="/venues_details.html?id=${v.id}">${v.name}</a></td>
          <td>${v.location.city}</td>
          <td>${v.rating}★</td>
          <td>${v.bookingCount}</td>
          <td>${window.formatVND(v.revenue)}</td>
        </tr>`
      )
      .join("");
  }
});
