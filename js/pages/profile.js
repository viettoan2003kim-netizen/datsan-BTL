document.addEventListener("DOMContentLoaded", () => {
  requireLogin();

  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const profileHeader = document.getElementById("profileHeader");
  const form = document.getElementById("profileForm");
  const message = document.getElementById("profileMessage");

  const avatarLetter = currentUser.name
    ? currentUser.name.trim().charAt(0).toUpperCase()
    : "U";

  profileHeader.innerHTML = `
    <div class="user-box">
      <div class="user-avatar" style="width:56px;height:56px">${avatarLetter}</div>
      <div>
        <div style="font-size:1.1rem;font-weight:700">${currentUser.name || "Chưa có tên"}</div>
        <div class="muted">${currentUser.email || "Chưa có email"}</div>
      </div>
    </div>
  `;

  document.getElementById("name").value = currentUser.name || "";
  document.getElementById("email").value = currentUser.email || "";
  document.getElementById("phone").value = currentUser.phone || "";
  document.getElementById("birthDate").value = currentUser.birthDate || "";
  document.getElementById("gender").value = currentUser.gender || "";
  document.getElementById("favoriteSports").value = (
    currentUser.favoriteSports || []
  ).join(", ");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const birthDate = document.getElementById("birthDate").value;
    const gender = document.getElementById("gender").value;
    const favoriteSportsInput = document
      .getElementById("favoriteSports")
      .value.trim();

    const favoriteSports = favoriteSportsInput
      ? favoriteSportsInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    const result = updateCurrentUserProfile({
      name,
      phone,
      birthDate,
      gender,
      favoriteSports,
    });

    if (!result.success) {
      message.textContent = result.message;
      message.style.color = "#f87171";
      return;
    }

    message.textContent = result.message;
    message.style.color = "#4ade80";

    setTimeout(() => {
      window.location.reload();
    }, 700);
  });
});
