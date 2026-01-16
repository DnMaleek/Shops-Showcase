/* ---------- SETTINGS ---------- */
document.getElementById("settingsForm").addEventListener("submit", async e => {
  e.preventDefault();
  
  showModal('Success', 'Settings saved successfully!', 'success');
  
  // You can implement the actual API call here:
  /*
  try {
    const res = await fetch("/api/shops/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token
      },
      body: JSON.stringify({
        shop_name: shopName.value,
        description: shopDescription.value,
        email: shopEmail.value,
        phone: shopPhone.value,
        logo: shopLogo.value
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
  */
});