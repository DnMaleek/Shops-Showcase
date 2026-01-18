/* ------------------------- LOAD PRODUCT DETAILS ------------------------- */
async function loadProductDetails(){
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if(!productId){
    window.location.href = 'index.html';
    return;
  }

  try {
    // Fetch product details with gallery images
    const detailsRes = await fetch(`/api/products/${productId}/details`);
    const productDetails = await detailsRes.json();
    
    if(!productDetails){
      window.location.href = 'index.html';
      return;
    }

    currentProduct = productDetails;

    // Fetch all products for related products section
    const allRes = await fetch("/api/products");
    allProducts = await allRes.json();

    // Populate page titile
    document.getElementById('product_detail').textContent = currentProduct.name;

    // Populate product details
    document.getElementById('productName').textContent = currentProduct.name

        const brandEl = document.getElementById("productBrand");

        if (
        currentProduct.brand &&
        currentProduct.brand !== "null" &&
        currentProduct.brand.trim() !== ""
        ) {
        brandEl.textContent = `• ${currentProduct.brand}`;
        brandEl.classList.remove("hidden");
        } else {
        brandEl.textContent = "";
        brandEl.classList.add("hidden");
        }

    document.getElementById('productCategory').textContent = currentProduct.category || 'Uncategorized';
    
    // Get shop name from allProducts since details endpoint might not include it
    const fullProduct = allProducts.find(p => p.id == productId);
    if(fullProduct){
      document.getElementById('productShop').textContent = fullProduct.shop_name;
      document.getElementById('productShop').onclick = () => window.location.href = `shop.html?id=${fullProduct.shop_id}`;
      currentProduct.shop_name = fullProduct.shop_name;
      currentProduct.shop_id = fullProduct.shop_id;
    }
    
    // Description
    document.getElementById('productDescription').textContent = currentProduct.description || 'No description available for this product.';
    
    // Price
    let priceHtml = `<span class="text-4xl font-bold text-gray-800">${currentProduct.price}</span>`;
    if(currentProduct.discount && currentProduct.discount < currentProduct.price){
      actualAmount = currentProduct.price - (currentProduct.price*(currentProduct.discount/100))
      const savings = ((1 - actualAmount/currentProduct.price) * 100).toFixed(0);
      priceHtml = `
        <div class="flex items-center gap-3">
          ⚫️ <span class="text-2xl line-through text-gray-400">${currentProduct.price}</span>
          <span class="text-4xl font-bold text-blue-600">${moneyFormated(actualAmount)}</span>
          <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">Save ${savings}%</span>
        </div>`;
    }
    document.getElementById('productPrice').innerHTML = priceHtml;
    
    // Stock
    const stockHtml = currentProduct.stock > 0 
      ? `<span class="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">✓ In Stock (${currentProduct.stock} available)</span>`
      : `<span class="inline-block bg-red-100 text-red-700 px-4 py-2 rounded-full font-semibold">✗ Out of Stock</span>`;
    document.getElementById('productStock').innerHTML = stockHtml;
    
    // Main image
    const mainImageSrc = currentProduct.main_image 
      ? `/uploads/products/${currentProduct.main_image}` 
      : 'https://placehold.co/600x600?text=Product';
    document.querySelector('#mainImage img').src = mainImageSrc;
    
    // Image gallery - use gallery images from database or fallback to main image
    let galleryImages = [];
    
    if(currentProduct.gallery && currentProduct.gallery.length > 0){
      // Use gallery images from database
      galleryImages = currentProduct.gallery.map(img => `/uploads/products/${img}`);
    } else {
      // Fallback to main image if no gallery images
      galleryImages = [mainImageSrc];
    }
    
    // Always include main image as first gallery item
    if(currentProduct.main_image && !galleryImages.includes(mainImageSrc)){
      galleryImages.unshift(mainImageSrc);
    }
    
    // Create gallery HTML
    const galleryHtml = galleryImages.map((imgSrc, index) => {
      const activeClass = index === 0 ? 'active' : '';
      return `<img src="${imgSrc}" class="gallery-image ${activeClass} w-full h-20 object-cover rounded-lg" onclick="changeMainImage('${imgSrc}')">`;
    }).join('');
    
    document.getElementById('imageGallery').innerHTML = galleryHtml;
    
    // Load related products (same category or same shop)
    const relatedProducts = allProducts.filter(p => 
      p.id != currentProduct.id && 
      (p.category === currentProduct.category || p.shop_name === currentProduct.shop_name)
    ).slice(0, 6);
    
    document.getElementById('relatedProducts').innerHTML = relatedProducts.map(productCard).join('');
    
  } catch(err) {
    console.error('Error loading product details:', err);
    alert('Failed to load product details');
    window.location.href = 'index.html';
  }
}

function changeMainImage(src){
  document.querySelector('#mainImage img').src = src;
  document.querySelectorAll('.gallery-image').forEach(img => img.classList.remove('active'));
  // Find the clicked image and add active class
  document.querySelectorAll('.gallery-image').forEach(img => {
    if(img.src === src || img.getAttribute('onclick').includes(src)){
      img.classList.add('active');
    }
  });
}

loadProductDetails();
