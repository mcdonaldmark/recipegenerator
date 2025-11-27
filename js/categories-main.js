// ==============================
// Category & Ingredient Management - TheMealDB
// ==============================

import { renderCategoryCards } from "./ui.js";

const categoriesList = document.querySelector("#categoriesList");
const categoryResults = document.querySelector("#categoryResults");
const selectedCategoryTitle = document.querySelector("#selectedCategoryTitle");
const ingredientFilterInput = document.querySelector("#ingredientFilterInput");
const resetCategoryBtn = document.querySelector("#resetCategoryBtn");

let ingredientMeals = [];
let currentCategory = ""; 

// ==============================
// Fetch and Render Categories
// ==============================
async function fetchCategories() {
    try {
        const res = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
        const data = await res.json();
        renderCategories(data.categories);
    } catch (err) {
        console.error("Error fetching categories:", err);
    }
}


function renderCategories(categories) {
    categoriesList.innerHTML = "";

    categories.forEach((cat) => {
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

// ==============================
// Handle Category Selection
// ==============================
async function selectCategory(category) {
    currentCategory = category;
    let mealsToRender = [];

    try {
        if (ingredientFilterInput.value.trim()) {
            mealsToRender = ingredientMeals.filter((meal) => meal.strCategory === category);
        } else {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`);
            const data = await res.json();
            if (!data.meals) return;

            mealsToRender = await Promise.all(
                data.meals.map(async (m) => {
                    const detailRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`);
                    const detailData = await detailRes.json();
                    return detailData.meals[0];
                })
            );
        }

        selectedCategoryTitle.textContent = `Meals in "${category}"`;
        renderCategoryCards(mealsToRender);
    } catch (err) {
        console.error("Error fetching meals for category:", err);
    }
}

// ==============================
// Ingredient Filter Input
// ==============================
ingredientFilterInput.addEventListener("input", async () => {
    const query = ingredientFilterInput.value.trim();

    if (!query) {
        categoryResults.innerHTML = "";
        selectedCategoryTitle.textContent = currentCategory ? `Meals in "${currentCategory}"` : "Meals";
        return;
    }

    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!data.meals) {
            categoryResults.innerHTML = "<p style='text-align:center;'>No meals match this ingredient.</p>";
            return;
        }

        ingredientMeals = await Promise.all(
            data.meals.map(async (m) => {
                const detailRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${m.idMeal}`);
                const detailData = await detailRes.json();
                return detailData.meals[0];
            })
        );

        let mealsToRender = ingredientMeals;
        if (currentCategory) {
            mealsToRender = ingredientMeals.filter((m) => m.strCategory === currentCategory);
        }

        renderCategoryCards(mealsToRender);
    } catch (err) {
        console.error("Error fetching meals for ingredient filter:", err);
    }
});

// ==============================
// Reset Filters
// ==============================
resetCategoryBtn.addEventListener("click", () => {
    ingredientFilterInput.value = "";
    currentCategory = "";
    ingredientMeals = [];
    categoryResults.innerHTML = "";
    selectedCategoryTitle.textContent = "Meals";
});

// ==============================
// Initial Load
// ==============================
fetchCategories();
