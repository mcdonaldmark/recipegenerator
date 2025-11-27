// ==============================
// ui.js (Optimized)
// ==============================

import { addMissingIngredientsToList } from "./shopping-list.js";
import { updateShoppingCount } from "./shopping-cart.js";

const FAVORITES_KEY = "favoriteRecipes";

// ==============================
// Add Ingredient to UI
// ==============================
export function addIngredientToList(ingredient, ingredientsArray, updateRecipesCallback) {
  const ul = document.querySelector("#ingredientList");

  const li = document.createElement("li");
  li.classList.add("fade-in");
  li.innerHTML = `
    ${ingredient} <button class="remove-btn">Remove</button>
  `;
  ul.appendChild(li);

  li.querySelector(".remove-btn").addEventListener("click", () => {
    const index = ingredientsArray.indexOf(ingredient.toLowerCase());
    if (index > -1) ingredientsArray.splice(index, 1);
    li.remove();
    if (typeof updateRecipesCallback === "function") updateRecipesCallback();
  });
}

// ==============================
// Toggle Favorite Recipe
// ==============================
function toggleFavorite(recipe, favBtn) {
  let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  const index = favorites.findIndex(fav => fav.id === recipe.id);

  if (index === -1) {
    favorites.push(recipe);
    favBtn.textContent = "💖";
  } else {
    favorites.splice(index, 1);
    favBtn.textContent = "❤️";
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

// ==============================
// Share Recipe
// ==============================
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

// ==============================
// Render Recipes (Index Page)
// Optimized for faster display
// ==============================
export function renderRecipes(recipes, userIngredients = []) {
  const container = document.querySelector("#results");
  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  const normalizedUserIngredients = userIngredients.map(i => i.toLowerCase().trim());

  recipes.forEach(recipe => {
    const recipeIngredients = (recipe.ingredients || []).map(i => i.toLowerCase().trim());
    const usedIngredients = recipeIngredients.filter(ing => normalizedUserIngredients.includes(ing));
    const missingIngredients = recipeIngredients.filter(ing => !normalizedUserIngredients.includes(ing));

    const card = document.createElement("div");
    card.classList.add("recipe-card", "fade-in");
    
    card.innerHTML = `
      <button class="share-btn">🔗</button>
      <span class="favorite-btn" title="Toggle Favorite">${favorites.some(fav => fav.id === recipe.id) ? "💖" : "❤️"}</span>
      <img src="${recipe.image}" alt="${recipe.title}" class="card-image">
      <div class="card-body">
        <h3>${recipe.title}</h3>
        <p><strong>Used:</strong> ${usedIngredients.join(", ") || "None"}</p>
        <p><strong>Missing:</strong> ${missingIngredients.join(", ") || "None"}</p>
      </div>
      <button class="shopping-list-btn">🛒 Add Missing Items</button>
    `;

    // Card click
    card.addEventListener("click", e => {
      if (!e.target.classList.contains("favorite-btn") &&
          !e.target.classList.contains("share-btn") &&
          !e.target.classList.contains("shopping-list-btn")) {
        window.open(`https://www.themealdb.com/meal/${recipe.id}`, "_blank");
      }
    });

    card.querySelector(".favorite-btn").addEventListener("click", e => {
      e.stopPropagation();
      toggleFavorite(recipe, e.target);
    });

    card.querySelector(".share-btn").addEventListener("click", e => {
      e.stopPropagation();
      shareRecipe(recipe);
    });

    card.querySelector(".shopping-list-btn").addEventListener("click", e => {
      e.stopPropagation();
      if (missingIngredients.length === 0) {
        alert("You already have all ingredients!");
        return;
      }
      addMissingIngredientsToList(missingIngredients);
      updateShoppingCount();
      alert("Missing ingredients added to your shopping list!");
    });

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

// ==============================
// Render Favorites Page
// ==============================
export function renderFavoriteCards() {
  const container = document.querySelector("#favoritesList");
  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];

  favorites.forEach(recipe => {
    const card = document.createElement("div");
    card.classList.add("recipe-card", "fade-in");
    card.innerHTML = `
      <button class="share-btn">🔗</button>
      <span class="favorite-btn" title="Remove Favorite">💖</span>
      <img src="${recipe.image}" alt="${recipe.title}" class="card-image">
      <div class="card-body">
        <h3>${recipe.title}</h3>
        <p><strong>Ingredients:</strong> ${recipe.ingredients ? recipe.ingredients.join(", ") : "N/A"}</p>
      </div>
    `;

    card.addEventListener("click", e => {
      if (!e.target.classList.contains("favorite-btn") && !e.target.classList.contains("share-btn")) {
        window.open(`https://www.themealdb.com/meal/${recipe.id}`, "_blank");
      }
    });

    card.querySelector(".favorite-btn").addEventListener("click", e => {
      e.stopPropagation();
      toggleFavorite(recipe, e.target);
      renderFavoriteCards();
    });

    card.querySelector(".share-btn").addEventListener("click", e => {
      e.stopPropagation();
      shareRecipe(recipe);
    });

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}

// ==============================
// Render Category Cards
// ==============================
export function renderCategoryCards(meals) {
  const container = document.querySelector("#categoryResults");
  container.innerHTML = "";
  const fragment = document.createDocumentFragment();

  if (!meals.length) {
    container.innerHTML = "<p style='text-align:center;'>No meals to display.</p>";
    return;
  }

  meals.forEach(meal => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      if (ing?.trim()) ingredients.push(ing.trim());
    }

    const card = document.createElement("div");
    card.classList.add("recipe-card", "fade-in");
    card.innerHTML = `
      <button class="share-btn">🔗</button>
      <span class="favorite-btn" title="Toggle Favorite">❤️</span>
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="card-image">
      <div class="card-body">
        <h3>${meal.strMeal}</h3>
        <p><strong>Ingredients:</strong> ${ingredients.join(", ")}</p>
      </div>
    `;

    card.addEventListener("click", e => {
      if (!e.target.classList.contains("favorite-btn") && !e.target.classList.contains("share-btn")) {
        window.open(`https://www.themealdb.com/meal/${meal.idMeal}`, "_blank");
      }
    });

    card.querySelector(".favorite-btn").addEventListener("click", e => {
      e.stopPropagation();
      const recipeObj = {
        id: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb,
        ingredients
      };
      toggleFavorite(recipeObj, e.target);
    });

    card.querySelector(".share-btn").addEventListener("click", e => {
      e.stopPropagation();
      shareRecipe({ id: meal.idMeal, title: meal.strMeal });
    });

    fragment.appendChild(card);
  });

  container.appendChild(fragment);
}
