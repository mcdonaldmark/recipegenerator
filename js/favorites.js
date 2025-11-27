// ==============================
// js/favorites.js
// ==============================

const FAVORITES_KEY = "favoriteRecipes";

// ==============================
// Add Recipe to Favorites
// ==============================

export function addToFavorites(recipe) {
  const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

  if (!favorites.some((fav) => fav.id === recipe.id)) {
    favorites.push(recipe);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    alert(`${recipe.title} added to favorites!`);
  }
}

// ==============================
// Get All Favorite Recipes
// ==============================

export function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}
