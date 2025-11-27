// js/favorites-main.js
import { getFavorites } from "./favorites.js";

const FAVORITES_KEY = "favoriteRecipes";
const favoritesList = document.querySelector("#favoritesList");

// Toggle recipe in favorites
function toggleFavorite(recipeId) {
  let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  favorites = favorites.filter(fav => fav.id !== recipeId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  renderFavorites(); // Re-render after removal
}

// Share handler
function shareRecipe(recipe) {
  const url = `https://www.themealdb.com/meal/${recipe.id}`;
  const text = `Check out this recipe: ${recipe.title}`;

  if (navigator.share) {
    navigator.share({ title: recipe.title, text, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  }
}

// Render favorites like index page with ingredients list
export function renderFavorites() {
  const favorites = getFavorites();
  favoritesList.innerHTML = "";

  if (favorites.length === 0) {
    favoritesList.innerHTML = "<p style='text-align:center;'>No favorites yet.</p>";
    return;
  }

  favorites.forEach(recipe => {
    const card = document.createElement("div");
    card.classList.add("recipe-card", "fade-in");

    // Build ingredients list
    const ingredients = recipe.ingredients || [];
    const ingredientListHTML = ingredients.length
      ? `<p><strong>Ingredients:</strong> ${ingredients.join(", ")}</p>`
      : "<p><strong>Ingredients:</strong> None listed</p>";

    card.innerHTML = `
      <button class="share-btn">🔗</button>
      <span class="favorite-btn" title="Remove Favorite">💖</span>

      <img src="${recipe.image}" alt="${recipe.title}" class="card-image">
      <div class="card-body">
        <h3>${recipe.title}</h3>
        ${ingredientListHTML}
      </div>
    `;

    // Click card opens recipe page
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("favorite-btn") &&
          !e.target.classList.contains("share-btn")) 
      {
        const recipeUrl = `https://www.themealdb.com/meal/${recipe.id}`;
        window.open(recipeUrl, "_blank");
      }
    });

    // Favorite button removes recipe
    const favBtn = card.querySelector(".favorite-btn");
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(recipe.id);
    });

    // Share button
    const shareBtn = card.querySelector(".share-btn");
    shareBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      shareRecipe(recipe);
    });

    favoritesList.appendChild(card);
  });
}

// Initial render
renderFavorites();
