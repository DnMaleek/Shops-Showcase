/* ---------- DASHBOARD STATS ---------- */
const token1 = localStorage.getItem('token')

async function loadDashboardStats() {
  try {
    // Load products count
    const productsRes = await fetch("/api/products/my", {
      headers: { Authorization: "Bearer " + token1 }
    });
    const products = await productsRes.json();
    document.getElementById("totalProducts").textContent = products.length;
    
    // Count active products
    const activeCount = products.filter(p => p.status === 'active').length;
    document.getElementById("activeProducts").textContent = activeCount;

    // Load staff count
    const staffRes = await fetch("/api/staff/my", {
      headers: { Authorization: "Bearer " + token }
    });
    const staff = await staffRes.json();
    document.getElementById("totalStaff").textContent = staff.length;
  } catch (error) {
    console.error("Failed to load dashboard stats:", error);
  }
}
loadDashboardStats();
