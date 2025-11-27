// ui.js
import { addMissingIngredientsToList } from "./shopping-list.js";
import { updateShoppingCount } from "./shopping-cart.js";

// Add ingredient to UI with remove button
export function addIngredientToList(ingredient, ingredientsArray, updateRecipesCallback) {
  const ul = document.querySelector("#ingredientList");

  const li = document.createElement("li");
  li.classList.add("fade-in");

  li.innerHTML = `
    ${ingredient} <button class="remove-btn">Remove</button>
  `;

  ul.appendChild(li);

  const removeBtn = li.querySelector(".remove-btn");
  removeBtn.addEventListener("click", () => {
    const index = ingredientsArray.indexOf(ingredient.toLowerCase());
    if (index > -1) {
      ingredientsArray.splice(index, 1);
    }
    li.remove();

    if (typeof updateRecipesCallback === "function") {
      updateRecipesCallback();
    }
  });
}

// Local storage key for favorites
const FAVORITES_KEY = "favoriteRecipes";

// Toggle recipe in favorites
function toggleFavorite(recipe, favBtn) {
  let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  const index = favorites.findIndex(fav => fav.id === recipe.id);

  if (index === -1) {
    favorites.push(recipe);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    favBtn.textContent = "💖";
  } else {
    favorites.splice(index, 1);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    favBtn.textContent = "❤️";
  }
}

// SHARE HANDLER
function shareRecipe(recipe) {
  const url = `https://www.themealdb.com/meal/${recipe.id}`;
  const text = `Check out this recipe: ${recipe.title}`;

  if (navigator.share) {
    navigator.share({
      title: recipe.title,
      text,
      url
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url);
    alert("Link copied to clipboard!");
  }
}

// -------------------------
// Render recipes on index
// -------------------------
export function renderRecipes(recipes, userIngredients = []) {
  const container = document.querySelector("#results");
  container.innerHTML = "";

  const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  const normalizedUserIngredients = userIngredients.map(i => i.toLowerCase().trim());

  recipes.forEach(recipe => {
    const recipeIngredients = (recipe.ingredients || []).map(i => i.toLowerCase().trim());
    const usedIngredients = recipeIngredients.filter(ing => normalizedUserIngredients.includes(ing));
    const missingIngredients = recipeIngredients.filter(ing => !normalizedUserIngredients.includes(ing));

    const usedList = usedIngredients.length ? usedIngredients.join(", ") : "None";
    const missingList = missingIngredients.length ? missingIngredients.join(", ") : "None";

    const isFavorited = favorites.some(fav => fav.id === recipe.id);

    const card = document.createElement("div");
    card.classList.add("recipe-card", "fade-in");

    card.innerHTML = `
      <button class="share-btn">🔗</button>
      <span class="favorite-btn" title="Toggle Favorite">${isFavorited ? "💖" : "❤️"}</span>

      <img src="${recipe.image}" alt="${recipe.title}" class="card-image">

      <div class="card-body">
        <h3>${recipe.title}</h3>
        <p><strong>Used:</strong> ${usedList}</p>
        <p><strong>Missing:</strong> ${missingList}</p>
      </div>

      <!-- SHOPPING LIST BUTTON -->
      <button class="shopping-list-btn">🛒 Add Missing Items</button>
    `;

    // Card click
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("favorite-btn") &&
          !e.target.classList.contains("share-btn") &&
          !e.target.classList.contains("shopping-list-btn")) 
      {
        window.open(`https://www.themealdb.com/meal/${recipe.id}`, "_blank");
      }
    });

    // Favorite button
    const favBtn = card.querySelector(".favorite-btn");
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(recipe, favBtn);
    });

    // Share button
    const shareBtn = card.querySelector(".share-btn");
    shareBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      shareRecipe(recipe);
    });

    // ------------------------------
    // SHOPPING LIST BUTTON HANDLER
    // ------------------------------
    const shopBtn = card.querySelector(".shopping-list-btn");
    shopBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      const missing = recipeIngredients.filter(ing => !normalizedUserIngredients.includes(ing));

      if (missing.length === 0) {
        alert("You already have all ingredients!");
        return;
      }

      addMissingIngredientsToList(missing);
      updateShoppingCount(); // Update badge
      alert("Missing ingredients added to your shopping list!");
    });

    container.appendChild(card);
  });
}

// -------------------------
// Favorites Page
// -------------------------
export function renderFavoriteCards() {
  const container = document.querySelector("#favoritesList");
  container.innerHTML = "";

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

    // Card click
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("favorite-btn") &&
          !e.target.classList.contains("share-btn")) 
      {
        window.open(`https://www.themealdb.com/meal/${recipe.id}`, "_blank");
      }
    });

    // Favorite remove
    const favBtn = card.querySelector(".favorite-btn");
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFavorite(recipe, favBtn);
      renderFavoriteCards();
    });

    // Share button
    const shareBtn = card.querySelector(".share-btn");
    shareBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      shareRecipe(recipe);
    });

    container.appendChild(card);
  });
}

// -------------------------
// Category Cards
// -------------------------
export function renderCategoryCards(meals) {
  const container = document.querySelector("#categoryResults");
  container.innerHTML = "";

  if (!meals.length) {
    container.innerHTML = "<p style='text-align:center;'>No meals to display.</p>";
    return;
  }

  meals.forEach(meal => {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      if (ing && ing.trim() !== "") ingredients.push(ing.trim());
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

    // Open recipe
    card.addEventListener("click", (e) => {
      if (!e.target.classList.contains("favorite-btn") &&
          !e.target.classList.contains("share-btn")) 
      {
        window.open(`https://www.themealdb.com/meal/${meal.idMeal}`, "_blank");
      }
    });

    const favBtn = card.querySelector(".favorite-btn");
    favBtn.addEventListener("click", (e) => {
      e.stopPropagation();

      const recipeObj = {
        id: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb,
        ingredients
      };

      toggleFavorite(recipeObj, favBtn);
    });

    const shareBtn = card.querySelector(".share-btn");
    shareBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const recipeObj = {
        id: meal.idMeal,
        title: meal.strMeal
      };
      shareRecipe(recipeObj);
    });

    container.appendChild(card);
  });
}
