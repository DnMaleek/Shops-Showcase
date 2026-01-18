/* ------------------------- CART ------------------------- */
function openCart(){ cartPanel.classList.add("open"); }
function closeCart(){ cartPanel.classList.remove("open"); }

let cart = JSON.parse(localStorage.getItem('shopzone_cart') || '[]');

function updateCart(){
  const container = document.getElementById("cartItems");
  container.innerHTML = "";
  let total = 0;
  cart.forEach((item,index)=>{
    const price = item.discount && item.discount<item.price ? item.discount : item.price;
    const itemTotal = price*item.qty;
    total+=itemTotal;
    container.innerHTML += `
      <div class="cart-item flex gap-2 items-center p-2">
        <img src="/uploads/products/${item.main_image || 'https://placehold.co/50x50?text=Product'}" class="w-12 h-12 object-cover rounded">
        <div class="flex-1">
          <p class="text-sm font-semibold">${item.name}</p>
          <p class="text-xs text-gray-500">$${price} x ${item.qty}</p>
        </div>
        <button onclick="removeFromCart(${index})" class="text-red-500 font-bold">&times;</button>
      </div>`;
  });
  document.getElementById("cartTotal").textContent = total.toFixed(2);
  localStorage.setItem('shopzone_cart', JSON.stringify(cart));
}

function addToCart(product, qty = 1){
  const existing = cart.find(p=>p.id===product.id);
  if(existing){ existing.qty += qty; } else{ cart.push({...product, qty: qty}); }
  updateCart();
}

function removeFromCart(index){ 
  cart.splice(index,1); 
  updateCart(); 
}

/* ------------------------- ADD TO CART ------------------------- */
function addToCartFromDetails(){
  if(currentProduct){
    addToCart(currentProduct, quantity);
    openCart();
  }
}

updateCart();
