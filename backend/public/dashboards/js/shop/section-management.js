/* ---------- SECTION SWITCHING ---------- */
function showSection(sectionId, el = null) {
  // Remove active from all sidebar items
  document.querySelectorAll(".sidebar-item").forEach(item =>
    item.classList.remove("active")
  );

  // Hide all main sections
  ["dashboard","products","addProduct","addStaff","viewStaff","settings"].forEach(id => {
    document.getElementById(id)?.classList.add("hidden");
  });

  // Show the selected section
  const section = document.getElementById(sectionId);
  if (section) section.classList.remove("hidden");

  // Activate clicked sidebar item
  if (el) el.classList.add("active");

  // Close mobile menu if open
  sidebar.classList.remove('active');
  menuOverlay.classList.add('hidden');

  // Load relevant data
  if (sectionId === "dashboard") loadDashboardStats();
  if (sectionId === "products") loadMyProducts();
  if (sectionId === "viewStaff") loadStaff();
}
