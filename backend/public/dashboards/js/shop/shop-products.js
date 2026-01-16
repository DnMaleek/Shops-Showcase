// Create Product

document.getElementById("productForm").addEventListener("submit", async e => {
  e.preventDefault();

  const fd = new FormData();

  fd.append("name", document.getElementById("name").value.trim());
  fd.append("description", document.getElementById("description").value.trim());
  fd.append("price", document.getElementById("price").value);
  fd.append("discount_price", document.getElementById("discount_price").value);
  fd.append("category", document.getElementById("category").value);
  fd.append("stock", document.getElementById("stock").value);
  fd.append("sku", document.getElementById("sku").value);
  fd.append("brand", document.getElementById("brand").value);
  fd.append("status", document.getElementById("status").value);

  // Images
  fd.append("main_image", document.getElementById("main_image").files[0]);

  const galleryFiles = document.getElementById("gallery").files;
  for (let i = 0; i < galleryFiles.length; i++) {
    fd.append("gallery", galleryFiles[i]);
  }

  const res = await fetch("/api/products", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token
      // ❌ DO NOT set Content-Type manually
    },
    body: fd
  });

  const data = await res.json();

  if (res.ok) {
    alert("Product added successfully!");
    e.target.reset();
    showSection("products");
  } else {
    alert(data.message || data.error || "Failed to add product");
  }
});


/* ---------- PRODUCTS ---------- */
async function loadMyProducts() {
  const container = document.getElementById("myProducts");
  container.innerHTML = "<p class='text-gray-500 col-span-full text-center py-8'>Loading...</p>";

  try {
    const res = await fetch("/api/products/my", {
      headers: { Authorization: "Bearer " + token }
    });
    const products = await res.json();
    container.innerHTML = "";

    if (!products.length) {
      container.innerHTML = "<p class='text-gray-500 col-span-full text-center py-8'>No products added yet.</p>";
      return;
    }

    products.forEach(p => {
      const cleanName = String(p.name).replace(/'/g, "&#39;").replace(/"/g, "&quot;");
      const cleanDesc = String(p.description || '').replace(/'/g, "&#39;").replace(/"/g, "&quot;");
      
      const imageUrl = p.main_image
          ? `http://localhost:5000/uploads/products/${p.main_image}`
          : "https://via.placeholder.com/300x200?text=No+Image";

        container.innerHTML += `
          <div class="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">

            <!-- Product Image -->
            <img src="${imageUrl}" 
                alt="${p.name}"
                class="w-full h-40 object-cover">

            <div class="p-4 lg:p-6">

              <!-- Name & Status -->
              <div class="flex justify-between items-center mb-2">
                <h3 class="font-bold text-base lg:text-lg text-gray-800">
                  ${p.name}
                </h3>
                <span class="text-xs px-2 py-1 rounded-full 
                  ${p.status === "active" ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-600"}">
                  ${p.status || "active"}
                </span>
              </div>

              <!-- Category -->
              <p class="text-xs text-gray-500 mb-1">
                Category: <span class="font-semibold">${p.category || "N/A"}</span>
              </p>

              <!-- Description -->
              <p class="text-xs lg:text-sm text-gray-600 mb-3 line-clamp-2">
                ${p.description || "No description"}
              </p>

              <!-- Price & Stock -->
              <div class="flex justify-between items-center mb-4">
                <p class="text-xl font-bold text-green-600">
                  $${Number(p.price).toFixed(2)}
                </p>
                <p class="text-sm text-gray-500">
                  Stock: <span class="font-semibold">${p.stock ?? 0}</span>
                </p>
              </div>

              <!-- Actions -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button onclick="viewProductDetails(${p.id})"
                  class="bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition text-sm font-semibold">
                  <i class="fas fa-eye mr-1"></i>View
                </button>

                <button onclick='openEditModal(${JSON.stringify(p)})'
                  class="bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition text-sm font-semibold">
                  <i class="fas fa-edit mr-1"></i>Edit
                </button>

                <button onclick="deleteProduct(${p.id})"
                  class="bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition text-sm font-semibold">
                  <i class="fas fa-trash mr-1"></i>Delete
                </button>
              </div>

            </div>
          </div>
        `;

    });
  } catch {
    container.innerHTML = "<p class='text-red-500 col-span-full text-center py-8'>Failed to load products.</p>";
  }
}

async function deleteProduct(id) {
  showModal(
    'Confirm Delete',
    'Are you sure you want to delete this product? This action cannot be undone.',
    'confirm',
    async () => {
      try {
        const res = await fetch(`/api/products/${id}`, {
          method: "DELETE",
          headers: { Authorization: "Bearer " + token }
        });

        const data = await res.json();
        
        if (res.ok) {
          showModal('Success', data.message || 'Product deleted successfully!', 'success');
          loadMyProducts();
          loadDashboardStats();
        } else {
          showModal('Error', data.message || 'Failed to delete product', 'error');
        }
      } catch (error) {
        showModal('Error', 'Error deleting product: ' + error.message, 'error');
      }
    }
  );
}
