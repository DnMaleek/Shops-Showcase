/* ---------- LOGOUT ---------- */
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("shop");
  window.location.href = "/login/login.html";
}
