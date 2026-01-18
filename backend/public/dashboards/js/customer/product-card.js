/* ------------------------- PRODUCT CARD FOR RELATED ------------------------- */
function productCard(p){
  let priceHtml = `$${p.price}`;
  const actualAmount = (p.price - (p.price * (p.discount/100)))
  if(p.discount && p.discount<p.price){
    priceHtml=`⚫️ <span class="line-through text-gray-400 mr-2">${p.price}</span><span class="text-blue-600 font-bold">${moneyFormated(actualAmount)}</span>`;
  }
  const stockStatus = p.stock>0? `<span class="text-green-600 font-semibold text-sm">In Stock (${p.stock})</span>` : `<span class="text-red-600 font-semibold text-sm">Out of Stock</span>`;
  return `
    <div data-id="${p.id}" class="product-item flex gap-4 items-center" onclick="goToProduct(${p.id})">
      <img src="/uploads/products/${p.main_image || 'https://placehold.co/100x100?text=Product'}" class="w-24 h-24 object-cover rounded-lg">
      <div class="flex-1">
        <h3 class="font-semibold text-base">${p.name}</h3>
        <p class="text-sm text-gray-500">${p.category || 'Uncategorized'} • ${p.shop_name}</p>
        <div class="mt-2 flex items-center gap-3">
          <span class="text-lg font-bold">${priceHtml}</span>
          ${stockStatus}
        </div>
      </div>
      <button onclick="event.stopPropagation(); quickAddToCart(${p.id})" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">Add to Cart</button>
    </div>`;
}

function goToProduct(productId){
  window.location.href = `product-details.html?id=${productId}`;
}

function quickAddToCart(productId){
  const product = allProducts.find(p => p.id == productId);
  if(product){
    addToCart(product, 1);
    openCart();
  }
}
