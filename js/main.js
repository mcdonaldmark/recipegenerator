// ==============================
// main.js - Recipe Finder with Ingredient Info
// ==============================

import { findRecipes } from "./api.js";
import { addIngredientToList, renderRecipes } from "./ui.js";

let ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
let recipesMap = new Map();
let ingredientInfoMap = new Map();

const ingredientForm = document.querySelector("#ingredientForm");
const ingredientInput = document.querySelector("#ingredientInput");

// ==============================
// Restore previous state from localStorage
// ==============================
ingredients.forEach((ingredient) => addIngredientToList(ingredient, ingredients, updateRecipes));

const savedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
savedRecipes.forEach((r) => recipesMap.set(r.id, r));
if (recipesMap.size > 0) renderRecipes(Array.from(recipesMap.values()), ingredients);

const savedInfo = JSON.parse(localStorage.getItem("ingredientInfo")) || {};
for (const [key, value] of Object.entries(savedInfo)) {
  ingredientInfoMap.set(key, value);
}

// ==============================
// Add Ingredient
// ==============================
ingredientForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const value = ingredientInput.value.trim();
  if (!value) return;

  const normalizedValue = value.toLowerCase();

  ingredients.push(normalizedValue);
  addIngredientToList(value, ingredients, updateRecipes);
  ingredientInput.value = "";

  await fetchIngredientInfo(normalizedValue);

  updateRecipes();
});

// ==============================
// Fetch Open Food Facts Data
// ==============================
async function fetchIngredientInfo(ingredient) {
  if (ingredientInfoMap.has(ingredient)) return;

  const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
    ingredient
  )}&search_simple=1&action=process&json=true&page_size=5`;

  try {
    const res = await fetch(searchUrl);
    const data = await res.json();

    const products = data.products.map((p) => ({
      name: p.product_name || "Unknown",
      brand: p.brands || "Unknown",
      nutrition_grade: p.nutrition_grades || "N/A",
      barcode: p.code || "N/A",
      url: p.url || "#",
    }));

    ingredientInfoMap.set(ingredient, products);
    saveIngredientInfo();
  } catch (err) {
    console.error("Error fetching Open Food Facts data:", err);
    ingredientInfoMap.set(ingredient, []);
  }
}

// ==============================
// Update Recipes Dynamically
// ==============================
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
            ingredients: ingredientsList,
          });
        } catch (err) {
          console.error("Error fetching meal details:", err);
        }
      }
    })
  );

  const recipes = Array.from(recipesMap.values());

  const normalizedUserIngredients = ingredients.map((i) => i.toLowerCase().trim());
  recipes.sort((a, b) => {
    const aMatch = a.ingredients.filter((i) => normalizedUserIngredients.includes(i)).length;
    const bMatch = b.ingredients.filter((i) => normalizedUserIngredients.includes(i)).length;
    return bMatch - aMatch;
  });

  renderRecipes(recipes, ingredients);

  saveState();
}

// ==============================
// Save Ingredient Info to localStorage
// ==============================
function saveIngredientInfo() {
  const obj = {};
  ingredientInfoMap.forEach((value, key) => {
    obj[key] = value;
  });
  localStorage.setItem("ingredientInfo", JSON.stringify(obj));
}

// ==============================
// Save Overall State to localStorage
// ==============================
function saveState() {
  localStorage.setItem("ingredients", JSON.stringify(ingredients));
  localStorage.setItem("recipes", JSON.stringify(Array.from(recipesMap.values())));
}
