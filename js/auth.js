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

  const existedUser = users.find((user) => user.email === email);

  if (existedUser) {
    return {
      success: false,
      message: "Email này đã được đăng ký.",
    };
  }

  const newUser = {
    id: Date.now(),
    name,
    email,
    password,
  };

  users.push(newUser);
  saveUsers(users);

  return {
    success: true,
    message: "Đăng ký thành công!",
  };
}

function loginUser(email, password) {
  const users = getUsers();

  const foundUser = users.find(
    (user) => user.email === email && user.password === password,
  );

  if (!foundUser) {
    return {
      success: false,
      message: "Email hoặc mật khẩu không đúng.",
    };
  }

  saveCurrentUser(foundUser);

  return {
    success: true,
    message: "Đăng nhập thành công!",
  };
}

function requireLogin() {
  const currentUser = getCurrentUser();

  if (!currentUser) {
    alert("Bạn cần đăng nhập trước.");
    window.location.href = "./login.html";
  }
}
