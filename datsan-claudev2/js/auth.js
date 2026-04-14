/* =========================================================
   auth.js — Authentication & user management
   ========================================================= */

function getUsers() {
  return JSON.parse(localStorage.getItem("users") || "[]");
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("currentUser") || "null");
}

function saveCurrentUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
}

function logoutUser() {
  localStorage.removeItem("currentUser");
}

function registerUser(name, email, password) {
  const users = getUsers();

  if (users.find((u) => u.email === email)) {
    return { success: false, message: "Email này đã được đăng ký." };
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
    avatar: "",
    phone: "",
    birthDate: "",
    gender: "",
    favoriteSports: [],
    favoriteVenues: [],
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  return { success: true, message: "Đăng ký thành công!" };
}

function loginUser(email, password) {
  const users = getUsers();
  const found = users.find((u) => u.email === email && u.password === password);

  if (!found) {
    return { success: false, message: "Email hoặc mật khẩu không đúng." };
  }

  saveCurrentUser(found);
  return { success: true, message: "Đăng nhập thành công!" };
}

function updateCurrentUserProfile(updatedData) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, message: "Chưa có người dùng đăng nhập." };
  }

  const users = getUsers();
  const updatedUser = { ...currentUser, ...updatedData };
  const newUsers = users.map((u) =>
    u.id === currentUser.id ? updatedUser : u
  );

  saveUsers(newUsers);
  saveCurrentUser(updatedUser);

  return { success: true, message: "Cập nhật hồ sơ thành công!" };
}

function requireLogin(redirectTo = "/login.html") {
  if (!getCurrentUser()) {
    showToast("Bạn cần đăng nhập trước.", "warn");
    setTimeout(() => { window.location.href = redirectTo; }, 800);
    return false;
  }
  return true;
}

// Expose to global
window.getUsers = getUsers;
window.saveUsers = saveUsers;
window.getCurrentUser = getCurrentUser;
window.saveCurrentUser = saveCurrentUser;
window.logoutUser = logoutUser;
window.registerUser = registerUser;
window.loginUser = loginUser;
window.updateCurrentUserProfile = updateCurrentUserProfile;
window.requireLogin = requireLogin;
