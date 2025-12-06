// ==============================
// api.js - Handles MealDB API Requests
// ==============================

// Search recipes by multiple ingredients
export async function findRecipes(ingredientsArray) {
  if (!ingredientsArray || ingredientsArray.length === 0) return [];

  const recipesMap = new Map();

  try {
    // Fetch recipes for each ingredient
    await Promise.all(
      ingredientsArray.map(async (ingredient) => {
        const res = await fetch(
          `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`
        );
        const data = await res.json();
        const meals = Array.isArray(data.meals) ? data.meals : [];

        meals.forEach((meal) => {
          if (!recipesMap.has(meal.idMeal)) {
            recipesMap.set(meal.idMeal, {
              id: meal.idMeal,
              title: meal.strMeal,
              image: meal.strMealThumb,
            });
          }
        });
      })
    );

    return Array.from(recipesMap.values());
  } catch (err) {
    console.error("Error fetching recipes from MealDB:", err);
    return [];
  }
}
