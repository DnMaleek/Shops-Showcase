/* ---------- STAFF ---------- */
async function loadStaff() {
  const box = document.getElementById("staffList");
  box.innerHTML = "<p class='text-gray-500 col-span-full text-center py-8'>Loading...</p>";

  try {
    const res = await fetch("/api/staff/my", {
      headers: { Authorization: "Bearer " + token }
    });
    const staff = await res.json();
    box.innerHTML = "";

    if (!staff.length) {
      box.innerHTML = "<p class='text-gray-500 col-span-full text-center py-8'>No staff added.</p>";
      return;
    }

    staff.forEach(s => {
      const roleBadge = s.role === 'admin'
        ? '<span class="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">Admin</span>'
        : '<span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">Staff</span>';

      box.innerHTML += `
        <div class="bg-white p-4 lg:p-6 rounded-xl shadow-md hover:shadow-lg transition">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <i class="fas fa-user text-green-600 text-lg lg:text-xl"></i>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gray-800 text-sm lg:text-base truncate">${s.name}</h3>
              <p class="text-xs lg:text-sm text-gray-600 truncate">${s.email}</p>
            </div>
          </div>
          <div class="mb-4">
            ${roleBadge}
          </div>
          <button onclick="deleteStaff(${s.id})" 
                  class="w-full bg-red-50 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 transition font-semibold text-sm">
            <i class="fas fa-trash mr-2"></i>Remove Staff
          </button>
        </div>
      `;
    });
  } catch {
    box.innerHTML = "<p class='text-red-500 col-span-full text-center py-8'>Failed to load staff.</p>";
  }
}

// Create Shop Staff
document.getElementById("staffForm").addEventListener("submit", async e => {
  e.preventDefault();
  
  try {
    const res = await fetch("/api/staff/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        name: staffName.value,
        email: staffEmail.value,
        password: staffPassword.value,
        role: staffRole.value
      })
    });

    const data = await res.json();
    
    if (res.ok) {
      showModal('Success', data.message || 'Staff member added successfully!', 'success');
      e.target.reset();
      loadStaff();
      loadDashboardStats();
    } else {
      showModal('Error', data.message || 'Failed to add staff member', 'error');
    }
  } catch (error) {
    showModal('Error', 'Error adding staff: ' + error.message, 'error');
  }
});

async function deleteStaff(id) {
  showModal(
    'Confirm Remove',
    'Are you sure you want to remove this staff member? This action cannot be undone.',
    'confirm',
    async () => {
      try {
        const res = await fetch(`/api/staff/${id}`, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token }
        });

        const data = await res.json();
        
        if (res.ok) {
          showModal('Success', data.message || 'Staff member removed successfully!', 'success');
          loadStaff();
          loadDashboardStats();
        } else {
          showModal('Error', data.message || 'Failed to remove staff member', 'error');
        }
      } catch (error) {
        showModal('Error', 'Error removing staff: ' + error.message, 'error');
      }
    }
  );
}