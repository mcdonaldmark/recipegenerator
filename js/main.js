// main.js

import { findRecipes } from "./api.js";
import { addIngredientToList, renderRecipes } from "./ui.js";

// Restore ingredients and recipes from localStorage, or empty arrays
let ingredients = JSON.parse(localStorage.getItem("ingredients")) || [];
let recipesMap = new Map(); // Map to store recipes by ID

const ingredientForm = document.querySelector("#ingredientForm");
const ingredientInput = document.querySelector("#ingredientInput");

// Restore previous ingredients in the UI
ingredients.forEach(ingredient => addIngredientToList(ingredient, ingredients, updateRecipes));

// Restore previous recipes from localStorage
const savedRecipes = JSON.parse(localStorage.getItem("recipes")) || [];
savedRecipes.forEach(r => recipesMap.set(r.id, r));
if (recipesMap.size > 0) renderRecipes(Array.from(recipesMap.values()), ingredients);

// Add ingredient via form submit
ingredientForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = ingredientInput.value.trim();
  if (!value) return;

  ingredients.push(value.toLowerCase());
  addIngredientToList(value, ingredients, updateRecipes);
  ingredientInput.value = "";

  updateRecipes();
});

// Function to update recipes dynamically
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

  renderRecipes(recipes, ingredients);
  saveState();
}

function saveState() {
  localStorage.setItem("ingredients", JSON.stringify(ingredients));
  localStorage.setItem("recipes", JSON.stringify(Array.from(recipesMap.values())));
}
