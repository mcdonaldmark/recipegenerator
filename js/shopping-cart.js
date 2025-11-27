// shopping-cart.js
import { getShoppingList } from "./shopping-list.js";

const countSpan = document.getElementById("shoppingCount");
const cartBtn = document.getElementById("shoppingCartBtn");

// Update the shopping list badge count
export function updateShoppingCount() {
  if (!countSpan) return;
  const list = getShoppingList();
  countSpan.textContent = list.length;
}

// Optional: click cart button to navigate to shopping list page
if (cartBtn) {
  cartBtn.addEventListener("click", () => {
    window.location.href = "shopping-list.html";
  });
}

// Initialize badge on page load
updateShoppingCount();
