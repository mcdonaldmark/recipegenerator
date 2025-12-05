// ==============================
// TheMealDB API - Multi-Ingredient Recipe Search
// ==============================

export async function findRecipes(ingredientsArray) {
  if (!ingredientsArray || ingredientsArray.length === 0) return [];

  const ingredientLower = ingredientsArray.map(i => i.toLowerCase().trim());
  const recipeMap = new Map();

  try {
    // -----------------------------
    // Step 1: Fetch meals for each ingredient (one by one)
    // -----------------------------
    const ingredientResults = await Promise.all(
      ingredientLower.map(async (ingredient) => {
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`;
        const res = await fetch(url);
        const data = await res.json();

        return data.meals || [];
      })
    );

    // Flatten all results into a single array
    const flatMeals = ingredientResults.flat();

    if (flatMeals.length === 0) return [];

    // -----------------------------
    // Step 2: Fetch full details for unique meals
    // -----------------------------
    await Promise.all(
      flatMeals.map(async (meal) => {
        if (!recipeMap.has(meal.idMeal)) {
          const detailRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
          const detailData = await detailRes.json();
          recipeMap.set(meal.idMeal, detailData.meals[0]);
        }
      })
    );

    // -----------------------------
    // Step 3: Process ingredients and calculate matches
    // -----------------------------
    const processedRecipes = Array.from(recipeMap.values()).map((meal) => {
      const mealIngredients = [];

      for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        if (ing && ing.trim() !== "") mealIngredients.push(ing.toLowerCase().trim());
      }

      const usedIngredientCount = mealIngredients.filter((i) => ingredientLower.includes(i)).length;
      const missedIngredientCount = mealIngredients.length - usedIngredientCount;

      return {
        id: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb,
        ingredients: mealIngredients,
        usedIngredientCount,
        missedIngredientCount,
        ...meal
      };
    });

    // -----------------------------
    // Step 4: Sort recipes by best match
    // -----------------------------
    processedRecipes.sort((a, b) => b.usedIngredientCount - a.usedIngredientCount);

    return processedRecipes;

  } catch (err) {
    console.error("Error fetching recipes:", err);
    return [];
  }
}
