// shopping-list-main.js
import { getShoppingList, removeIngredientFromList, clearShoppingList } from "./shopping-list.js";
import { updateShoppingCount } from "./shopping-cart.js";

const shoppingListContainer = document.getElementById("shoppingList");
const clearBtn = document.getElementById("clearShoppingListBtn");

// Render the shopping list
function renderShoppingList() {
  const list = getShoppingList();
  shoppingListContainer.innerHTML = "";

  if (list.length === 0) {
    shoppingListContainer.innerHTML = "<p style='text-align:center;'>Your shopping list is empty.</p>";
    updateShoppingCount();
    return;
  }

  list.forEach(ingredient => {
    const li = document.createElement("li");
    li.classList.add("fade-in");
    li.innerHTML = `
      ${ingredient} <button class="remove-btn">Remove</button>
    `;

    const removeBtn = li.querySelector(".remove-btn");
    removeBtn.addEventListener("click", () => {
      removeIngredientFromList(ingredient);
      renderShoppingList();
      updateShoppingCount();
    });

    shoppingListContainer.appendChild(li);
  });

  updateShoppingCount();
}

// Clear list button
clearBtn.addEventListener("click", () => {
  clearShoppingList();
  renderShoppingList();
  updateShoppingCount();
});

// Initial render
renderShoppingList();
