// js/categories.js

const categoriesList = document.getElementById("categoriesList");
const categoryResults = document.getElementById("categoryResults");

// Load all categories from TheMealDB
async function loadCategories() {
    try {
        const res = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
        const data = await res.json();
        const categories = data.categories;

        categoriesList.innerHTML = "";

        categories.forEach(cat => {
            const card = document.createElement("div");
            card.classList.add("category-card");

            card.innerHTML = `
                <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}">
                <h3>${cat.strCategory}</h3>
            `;

            card.addEventListener("click", () => loadMealsByCategory(cat.strCategory));
            categoriesList.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading categories:", err);
        categoriesList.innerHTML = "<p>Failed to load categories.</p>";
    }
}

// Load meals by category
async function loadMealsByCategory(category) {
    try {
        const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(category)}`);
        const data = await res.json();
        const meals = data.meals || [];

        categoryResults.innerHTML = "";

        meals.forEach(meal => {
            const card = document.createElement("div");
            card.classList.add("recipe-card", "fade-in");

            card.innerHTML = `
                <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
                <h3>${meal.strMeal}</h3>
            `;

            card.addEventListener("click", () => {
                window.open(`https://www.themealdb.com/meal/${meal.idMeal}`, "_blank");
            });

            categoryResults.appendChild(card);
        });

    } catch (err) {
        console.error("Error loading meals:", err);
        categoryResults.innerHTML = "<p>Failed to load meals for this category.</p>";
    }
}

// Initial load
loadCategories();
