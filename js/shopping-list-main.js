// shopping-list-main.js
import { getShoppingList, removeIngredientFromList, clearShoppingList } from "./shopping-list.js";
import { updateShoppingCount } from "./shopping-cart.js";

const shoppingListContainer = document.getElementById("shoppingList");
const clearBtn = document.getElementById("clearShoppingListBtn");

// ➜ Your USDA API key goes here
const FDC_API_KEY = "VvAc3udjrHDwwDP71isedePavcgetySZnFaQ8dLv";

// Cache nutrition data so we don’t fetch the same item twice
let nutritionCache = JSON.parse(localStorage.getItem("nutritionCache")) || {};

// --- Manual overrides for simple ingredients ---
const ZERO_NUTRITION_OVERRIDES = {
  water: { calories: 0, fat: 0, carbs: 0, protein: 0 },
  salt: { calories: 0, fat: 0, carbs: 0, protein: 0 },
  pepper: { calories: 0, fat: 0, carbs: 0, protein: 0 },
  "vegetable oil": { calories: 900, fat: 100, carbs: 0, protein: 0 },
  sugar: { calories: 400, fat: 0, carbs: 100, protein: 0 }
};

// Fetch nutrition info from USDA FoodData Central
async function fetchNutritionData(ingredient) {
  const key = ingredient.toLowerCase().trim();

  // Check manual overrides first
  if (ZERO_NUTRITION_OVERRIDES[key]) {
    nutritionCache[key] = ZERO_NUTRITION_OVERRIDES[key];
    localStorage.setItem("nutritionCache", JSON.stringify(nutritionCache));
    return ZERO_NUTRITION_OVERRIDES[key];
  }

  // If cached → return immediately
  if (nutritionCache[key]) {
    return nutritionCache[key];
  }

  try {
    // 1) Search for the ingredient (limit to Foundation and SR Legacy for accuracy)
    const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${FDC_API_KEY}&query=${encodeURIComponent(
      ingredient
    )}&pageSize=3&dataType=Foundation,SR Legacy`;

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.foods || searchData.foods.length === 0) {
      return null;
    }

    // Pick the first reliable result
    const food = searchData.foods[0];
    const fdcId = food.fdcId;

    // 2) Get detailed nutrient data using fdcId
    const detailUrl = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${FDC_API_KEY}`;
    const detailRes = await fetch(detailUrl);
    const detailData = await detailRes.json();

    const nutrients = {};
    if (detailData.foodNutrients) {
      detailData.foodNutrients.forEach(n => {
        nutrients[n.nutrientName.toLowerCase()] = {
          value: n.value,
          unit: n.unitName
        };
      });
    }

    // Convert raw FDC nutrient list → simplified macros
    const nutrition = {
      calories:
        nutrients["energy"]?.value ||
        nutrients["energy (kcal)"]?.value ||
        "N/A",
      fat:
        nutrients["total lipid (fat)"]?.value ||
        nutrients["fat"]?.value ||
        "N/A",
      carbs:
        nutrients["carbohydrate, by difference"]?.value ||
        nutrients["carbohydrates"]?.value ||
        "N/A",
      protein:
        nutrients["protein"]?.value ||
        nutrients["proteins"]?.value ||
        "N/A",
    };

    // Save to cache
    nutritionCache[key] = nutrition;
    localStorage.setItem("nutritionCache", JSON.stringify(nutritionCache));

    return nutrition;
  } catch (err) {
    console.error("USDA Nutrition Fetch Error:", err);
    return null;
  }
}

// Render the shopping list
async function renderShoppingList() {
  const list = getShoppingList();
  shoppingListContainer.innerHTML = "";

  if (list.length === 0) {
    shoppingListContainer.innerHTML = "<p style='text-align:center;'>Your shopping list is empty.</p>";
    updateShoppingCount();
    return;
  }

  for (const ingredient of list) {
    const li = document.createElement("li");
    li.classList.add("fade-in");

    li.innerHTML = `
      <strong>${ingredient}</strong>
      <div class="nutrition-loading">Loading nutrition...</div>
      <button class="remove-btn">Remove</button>
    `;

    shoppingListContainer.appendChild(li);

    // Load nutrition data
    const nutrition = await fetchNutritionData(ingredient);
    const infoBox = li.querySelector(".nutrition-loading");

    if (!nutrition) {
      infoBox.innerHTML = `<span class="nutrition-info">No data available</span>`;
    } else {
      infoBox.innerHTML = `
        <span class="nutrition-info">
          ${nutrition.calories} kcal / 100g |
          Fat: ${nutrition.fat}g |
          Carbs: ${nutrition.carbs}g |
          Protein: ${nutrition.protein}g
        </span>
      `;
    }

    // Remove button functionality
    const removeBtn = li.querySelector(".remove-btn");
    removeBtn.addEventListener("click", () => {
      removeIngredientFromList(ingredient);
      renderShoppingList();
      updateShoppingCount();
    });
  }

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
