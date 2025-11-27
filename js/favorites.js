// favorites.js
const FAVORITES_KEY = "favoriteRecipes";

// Save recipe to localStorage
export function addToFavorites(recipe) {
  const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

  // Avoid duplicates
  if (!favorites.some(fav => fav.id === recipe.id)) {
    favorites.push(recipe);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    alert(`${recipe.title} added to favorites!`);
  }
}

// Get all favorite recipes
export function getFavorites() {
  return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
}
