// main.js

import { findRecipes } from "./api.js";
import { addIngredientToList, renderRecipes } from "./ui.js";

// Restore ingredients and recipes from localStorage, or empty arrays
let ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
let recipesMap = new Map(); // Map to store recipes by ID
let ingredientInfoMap = new Map(); // Map to store Open Food Facts data per ingredient

const ingredientForm = document.querySelector("#ingredientForm");
const ingredientInput = document.querySelector("#ingredientInput");

// Restore previous ingredients in the UI
ingredients.forEach(ingredient => addIngredientToList(ingredient, ingredients, updateRecipes));

// Restore previous recipes from localStorage
const savedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
savedRecipes.forEach(r => recipesMap.set(r.id, r));
if (recipesMap.size > 0) renderRecipes(Array.from(recipesMap.values()), ingredients);

// Restore previous ingredient info
const savedInfo = JSON.parse(localStorage.getItem("ingredientInfo")) || {};
for (const [key, value] of Object.entries(savedInfo)) {
  ingredientInfoMap.set(key, value);
}

// Add ingredient via form submit
ingredientForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const value = ingredientInput.value.trim();
  if (!value) return;

  const normalizedValue = value.toLowerCase();

  ingredients.push(normalizedValue);
  addIngredientToList(value, ingredients, updateRecipes);
  ingredientInput.value = "";

  // Fetch Open Food Facts info for this ingredient
  await fetchIngredientInfo(normalizedValue);

  updateRecipes();
});

// ---------------------------
// Fetch Open Food Facts info
// ---------------------------
async function fetchIngredientInfo(ingredient) {
  if (ingredientInfoMap.has(ingredient)) return; // Already fetched

  const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    ingredient
  )}&search_simple=1&action=process&json=true&page_size=5`;

  try {
    const res = await fetch(searchUrl);
    const data = await res.json();
    // Store first 5 results for simplicity
    const products = data.products.map(p => ({
      name: p.product_name || "Unknown",
      brand: p.brands || "Unknown",
      nutrition_grade: p.nutrition_grades || "N/A",
      barcode: p.code || "N/A",
      url: p.url || "#"
    }));
    ingredientInfoMap.set(ingredient, products);
    saveIngredientInfo();
  } catch (err) {
    console.error("Error fetching Open Food Facts data:", err);
    ingredientInfoMap.set(ingredient, []);
  }
}

// ---------------------------
// Function to update recipes dynamically
// ---------------------------
async function updateRecipes() {
  const resultsContainer = document.querySelector("#results");

  if (ingredients.length === 0) {
    resultsContainer.innerHTML = "";
    recipesMap.clear();
    saveState();
    return;
  }

  const rawRecipes = await findRecipes(ingredients);

  await Promise.all(
    rawRecipes.map(async (r) => {
      if (!recipesMap.has(r.id)) {
        try {
          const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${r.id}`);
          const data = await res.json();
          const meal = data.meals[0];

          const ingredientsList = [];
          for (let i = 1; i <= 20; i++) {
            const ing = meal[`strIngredient${i}`];
            if (ing && ing.trim() !== "") ingredientsList.push(ing.trim().toLowerCase());
          }

          recipesMap.set(r.id, {
            id: r.id,
            title: r.title,
            image: r.image,
            ingredients: ingredientsList
          });
        } catch (err) {
          console.error("Error fetching meal details:", err);
        }
      }
    })
  );

  // Convert Map to array for rendering
  const recipes = Array.from(recipesMap.values());

  const normalizedUserIngredients = ingredients.map(i => i.toLowerCase().trim());
  recipes.sort((a, b) => {
    const aMatch = a.ingredients.filter(i => normalizedUserIngredients.includes(i)).length;
    const bMatch = b.ingredients.filter(i => normalizedUserIngredients.includes(i)).length;
    return bMatch - aMatch;
  });

  // Render each recipe with proper .recipe-card-content wrapper
  resultsContainer.innerHTML = "";
  recipes.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "recipe-card";

    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}" />
      <button class="favorite-btn">❤️</button>
      <button class="share-btn">🔗</button>
      <div class="recipe-card-content">
        <h3>${recipe.title}</h3>
        <p>Ingredients: ${recipe.ingredients.join(", ")}</p>
        <button class="missing-btn">Missing Items</button>
      </div>
    `;

    resultsContainer.appendChild(card);
  });

  saveState();
}

// ---------------------------
// Save ingredient info to localStorage
// ---------------------------
function saveIngredientInfo() {
  const obj = {};
  ingredientInfoMap.forEach((value, key) => {
    obj[key] = value;
  });
  localStorage.setItem("ingredientInfo", JSON.stringify(obj));
}

// ---------------------------
// Save overall state
// ---------------------------
function saveState() {
  localStorage.setItem("ingredients", JSON.stringify(ingredients));
  localStorage.setItem("recipes", JSON.stringify(Array.from(recipesMap.values())));
}
