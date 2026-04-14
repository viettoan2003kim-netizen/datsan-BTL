/* =========================================================
   profile.js — User profile page
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  if (!requireLogin()) return;

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const profileHeader = document.getElementById("profileHeader");
  const form          = document.getElementById("profileForm");
  const message       = document.getElementById("profileMessage");

  // ---- Avatar header ----
  const avatarLetter = currentUser.name
    ? currentUser.name.trim().charAt(0).toUpperCase()
    : "U";

  profileHeader.innerHTML = `
    <div class="user-box">
      <div class="user-avatar" style="width:56px;height:56px;font-size:1.3rem">${avatarLetter}</div>
      <div>
        <div style="font-size:1.1rem;font-weight:700">${currentUser.name || "Chưa có tên"}</div>
        <div class="muted">${currentUser.email || "Chưa có email"}</div>
        <div class="muted" style="font-size:0.8rem">
          Thành viên từ: ${new Date(currentUser.createdAt).toLocaleDateString("vi-VN")}
        </div>
      </div>
    </div>`;

  // ---- Pre-fill form ----
  document.getElementById("name").value         = currentUser.name || "";
  document.getElementById("email").value        = currentUser.email || "";
  document.getElementById("phone").value        = currentUser.phone || "";
  document.getElementById("birthDate").value    = currentUser.birthDate || "";
  document.getElementById("gender").value       = currentUser.gender || "";
  document.getElementById("favoriteSports").value = (currentUser.favoriteSports || []).join(", ");

  // ---- Submit ----
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name              = document.getElementById("name").value.trim();
    const phone             = document.getElementById("phone").value.trim();
    const birthDate         = document.getElementById("birthDate").value;
    const gender            = document.getElementById("gender").value;
    const favoriteSportsRaw = document.getElementById("favoriteSports").value.trim();
    const favoriteSports    = favoriteSportsRaw
      ? favoriteSportsRaw.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    if (!name) {
      message.textContent = "Họ và tên không được để trống.";
      message.style.color = "#f87171";
      return;
    }

    const result = updateCurrentUserProfile({ name, phone, birthDate, gender, favoriteSports });

    if (!result.success) {
      message.textContent = result.message;
      message.style.color = "#f87171";
      return;
    }

    showToast(result.message, "ok");
    message.textContent = result.message;
    message.style.color = "#4ade80";

    setTimeout(() => { window.location.reload(); }, 900);
  });
});
