async function viewProductDetails(productId) {
  try {
    const res = await fetch(
      `http://localhost:5000/api/products/${productId}/details`
    );

    const p = await res.json();

    // Main image
    document.getElementById("modalMainImage").src =
      p.main_image
        ? `http://localhost:5000/uploads/products/${p.main_image}`
        : "https://via.placeholder.com/400x300?text=No+Image";

    // Gallery
    const gallery = document.getElementById("modalGallery");
    gallery.innerHTML = "";

    if (p.gallery.length) {
      p.gallery.forEach(img => {
        gallery.innerHTML += `
          <img src="http://localhost:5000/uploads/products/${img}"
               class="w-20 h-20 object-cover rounded cursor-pointer hover:ring-2 ring-green-500"
               onclick="document.getElementById('modalMainImage').src=this.src">
        `;
      });
    }

    // Text details
    document.getElementById("modalName").textContent = p.name;
    document.getElementById("modalPrice").textContent = `$${Number(p.price).toFixed(2)}`;
    document.getElementById("modalCategory").textContent = p.category || "N/A";
    document.getElementById("modalStock").textContent = p.stock ?? 0;
    document.getElementById("modalStatus").textContent = p.status || "active";
    document.getElementById("modalDescription").textContent =
      p.description || "No description";

    // Show modal
    document.getElementById("productModal").classList.remove("hidden");

  } catch (err) {
    alert("Failed to load product details");
  }
}

function closeProductModal() {
  document.getElementById("productModal").classList.add("hidden");
}