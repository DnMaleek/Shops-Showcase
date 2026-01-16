/* ---------- SECTION SWITCHING ---------- */
function showSection(sectionId, el = null) {
  // Remove active from all
  document.querySelectorAll(".sidebar-item").forEach(item =>
    item.classList.remove("active")
  );

  // Hide all sections
  ["dashboard","products","addProduct","staff","settings"].forEach(id => {
    document.getElementById(id)?.classList.add("hidden");
  });

  // Show selected
  document.getElementById(sectionId)?.classList.remove("hidden");

  // Activate clicked item
  if (el) el.classList.add("active");

  // Close mobile menu
  sidebar.classList.remove('active');
  menuOverlay.classList.add('hidden');

  // Load section data
  if (sectionId === "dashboard") loadDashboardStats();
  if (sectionId === "products") loadMyProducts();
  if (sectionId === "staff") loadStaff();
}