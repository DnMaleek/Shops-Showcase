/* ---------- EDIT PRODUCT MODAL ---------- */
let currentEditProduct = null;

function openEditModal(product) {
  currentEditProduct = product.id;

  // Populate all fields with product data
  document.getElementById('editProductId').value = product.id || '';
  document.getElementById('editName').value = product.name || '';
  document.getElementById('editDescription').value = product.description || '';
  document.getElementById('editPrice').value = product.price || 0;
  document.getElementById('editDiscountPrice').value = product.discount || '';
  document.getElementById('editStock').value = product.stock || 0;
  document.getElementById('editCategory').value = product.category || '';
  document.getElementById('editBrand').value = product.brand || '';
  document.getElementById('editSKU').value = product.sku || '';
  document.getElementById('editStatus').value = product.status || 'active';

  // Clear file inputs
  document.getElementById('editMainImage').value = '';
  document.getElementById('editGallery').value = '';

  // Show modal
  document.getElementById('editModal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('editModal').classList.add('hidden');
  currentEditProduct = null;
}

// Edit form submission
document.getElementById('editProductForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const productId = document.getElementById('editProductId').value;
  
  if (!productId) {
    showModal('Error', 'Product ID is missing', 'error');
    return;
  }

  const formData = new FormData();
  
  // Add all form fields
  formData.append('name', document.getElementById('editName').value);
  formData.append('description', document.getElementById('editDescription').value);
  formData.append('price', document.getElementById('editPrice').value);
  formData.append('discount', document.getElementById('editDiscountPrice').value || '');
  formData.append('stock', document.getElementById('editStock').value || 0);
  formData.append('category', document.getElementById('editCategory').value || '');
  formData.append('brand', document.getElementById('editBrand').value || '');
  formData.append('sku', document.getElementById('editSKU').value || '');
  formData.append('status', document.getElementById('editStatus').value || 'active');

  // Add main image if selected
  const mainImageInput = document.getElementById('editMainImage');
  if (mainImageInput.files && mainImageInput.files.length > 0) {
    formData.append('main_image', mainImageInput.files[0]);
  }

  // Add gallery images if selected
  const galleryInput = document.getElementById('editGallery');
  if (galleryInput.files && galleryInput.files.length > 0) {
    Array.from(galleryInput.files).forEach(file => {
      formData.append('gallery', file);
    });
  }

  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      showModal('Success', 'Product updated successfully!', 'success');
      closeEditModal();
      closeEditModal()
      loadMyProducts();
    } else {
      showModal('Error', data.message || 'Failed to update product', 'error');
    }
  } catch (error) {
    console.error('Error updating product:', error);
    showModal('Error', 'An error occurred while updating the product', 'error');
  }
});