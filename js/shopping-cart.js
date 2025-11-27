// ==============================
// shopping-cart.js
// ==============================

import { getShoppingList } from "./shopping-list.js";

const countSpan = document.getElementById("shoppingCount");
const cartBtn = document.getElementById("shoppingCartBtn");

// ==============================
// Update Shopping List Badge
// ==============================

export function updateShoppingCount() {
  if (!countSpan) return; 
  const list = getShoppingList(); 
  countSpan.textContent = list.length;
}

// ==============================
// Navigate to Shopping List Page
// ==============================
if (cartBtn) {
  cartBtn.addEventListener("click", () => {
    window.location.href = "shopping-list.html";
  });
}

// ==============================
// Initialize Badge on Page Load
// ==============================
updateShoppingCount();
