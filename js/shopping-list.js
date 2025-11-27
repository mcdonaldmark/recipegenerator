// shopping-list.js

const SHOPPING_LIST_KEY = "shoppingList";

// Add missing ingredients to the shopping list (no duplicates)
export function addMissingIngredientsToList(missingIngredients) {
  const currentList = JSON.parse(localStorage.getItem(SHOPPING_LIST_KEY)) || [];

  missingIngredients.forEach(ing => {
    const normalized = ing.toLowerCase().trim();
    if (!currentList.includes(normalized)) {
      currentList.push(normalized);
    }
  });

  localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(currentList));
}

// Get shopping list
export function getShoppingList() {
  return JSON.parse(localStorage.getItem(SHOPPING_LIST_KEY)) || [];
}

// Remove an ingredient from the shopping list
export function removeIngredientFromList(ingredient) {
  const currentList = JSON.parse(localStorage.getItem(SHOPPING_LIST_KEY)) || [];
  const index = currentList.indexOf(ingredient.toLowerCase().trim());
  if (index > -1) {
    currentList.splice(index, 1);
    localStorage.setItem(SHOPPING_LIST_KEY, JSON.stringify(currentList));
  }
}

// Clear entire shopping list
export function clearShoppingList() {
  localStorage.removeItem(SHOPPING_LIST_KEY);
}
