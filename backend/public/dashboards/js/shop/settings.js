/* ---------- SETTINGS ---------- */
document.getElementById("settingsForm").addEventListener("submit", async e => {
  e.preventDefault();

  const shop_name = document.getElementById('shopName').value;
  const description = document.getElementById('shopDescription').value;
  const email = document.getElementById('shopEmail').value;
  const phone = document.getElementById('shopPhone').value;
  const logo = document.getElementById('shopLogo').value;
  
  showModal('Success', 'Settings saved successfully!', 'success');
  
  // You can implement the actual API call here:
  try {
    const res = await fetch("/api/shops/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        shop_name,
        description,
        email,
        phone,
        logo,
      })
    });
    
    const data = await res.json();
    if (res.ok) {
      showModal('Success', data.message || 'Settings saved successfully!', 'success');
    } else {
      showModal('Error', data.message || 'Failed to save settings', 'error');
    }
  } catch (error) {
    showModal('Error', 'Error saving settings: ' + error.message, 'error');
  }
});

async function loadSettings() {
  const token = localStorage.getItem('token');
  const res = await fetch('/api/shops/settings',{ 
    headers: { Authorization: `Bearer ${token}`}
  });
  const data = await res.json();

  document.getElementById('shopName').value = data.shop_name;
  document.getElementById('shopDescription').value = data.description;
  document.getElementById('shopEmail').value = data.email;
  document.getElementById('shopPhone').value = data.phone;
  document.getElementById('shopLogo').value = data.logo;
}

loadSettings();