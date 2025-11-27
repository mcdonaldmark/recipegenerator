import { renderCategoryCards } from "./ui.js"; // import from ui.js

const categoriesList = document.querySelector("#categoriesList");
const categoryResults = document.querySelector("#categoryResults");
const selectedCategoryTitle = document.querySelector("#selectedCategoryTitle");
const ingredientFilterInput = document.querySelector("#ingredientFilterInput");
const resetCategoryBtn = document.querySelector("#resetCategoryBtn");

let ingredientMeals = []; // Meals filtered by ingredient
let currentCategory = ""; // Selected category

// Fetch and render categories
async function fetchCategories() {
    try {
        const res = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
        const data = await res.json();
        renderCategories(data.categories);
    } catch (err) {
        console.error(err);
    }
}

function renderCategories(categories) {
    categoriesList.innerHTML = "";
    categories.forEach(cat => {
        const card = document.createElement("div");
        card.classList.add("category-card", "fade-in");
        card.innerHTML = `
            <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}">
            <h3>${cat.strCategory}</h3>
        `;
        card.addEventListener("click", () => selectCategory(cat.strCategory));
        categoriesList.appendChild(card);
    });
}

// When category is selected
async function selectCategory(category) {
    currentCategory = category;
    let mealsToRender = [];

    if (ingredientFilterInput.value.trim()) {
        // Filter ingredientMeals by selected category
        mealsToRender = ingredientMeals.filter(meal => meal.strCategory === category);
    } else {
        // Fetch meals by category
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`);
        const data = await res.json();
        if (!data.meals) return;

        // Fetch full details
        mealsToRender = await Promise.all(
            data.meals.map(async m => {
                const detailRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`);
                const detailData = await detailRes.json();
                return detailData.meals[0];
            })
        );
    }

    selectedCategoryTitle.textContent = `Meals in "${category}"`;
    renderCategoryCards(mealsToRender); // <-- use ui.js function for cards
}

// Ingredient filter
ingredientFilterInput.addEventListener("input", async () => {
    const query = ingredientFilterInput.value.trim();
    if (!query) {
        categoryResults.innerHTML = "";
        selectedCategoryTitle.textContent = currentCategory ? `Meals in "${currentCategory}"` : "Meals";
        return;
    }

    // Fetch meals by ingredient
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (!data.meals) {
        categoryResults.innerHTML = "<p style='text-align:center;'>No meals match this ingredient.</p>";
        return;
    }

    // Fetch full details
    ingredientMeals = await Promise.all(
        data.meals.map(async m => {
            const detailRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`);
            const detailData = await detailRes.json();
            return detailData.meals[0];
        })
    );

    // Apply category filter if selected
    let mealsToRender = ingredientMeals;
    if (currentCategory) {
        mealsToRender = ingredientMeals.filter(m => m.strCategory === currentCategory);
    }

    renderCategoryCards(mealsToRender); // <-- use ui.js function for cards
});

// Reset
resetCategoryBtn.addEventListener("click", () => {
    ingredientFilterInput.value = "";
    currentCategory = "";
    ingredientMeals = [];
    categoryResults.innerHTML = "";
    selectedCategoryTitle.textContent = "Meals";
});

// Initial
fetchCategories();
