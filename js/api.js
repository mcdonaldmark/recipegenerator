// ==============================
// TheMealDB API - Multi-Ingredient Recipe Search
// ==============================

export async function findRecipes(ingredientsArray) {
  if (!ingredientsArray || ingredientsArray.length === 0) return [];

  const recipeMap = new Map();

  try {
    // -----------------------------
    // Step 1: Search each ingredient
    // -----------------------------
    await Promise.all(
      ingredientsArray.map(async (ingredient) => {
        const url = `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(ingredient)}`;
        const response = await fetch(url);
        const data = await response.json();
        if (!data.meals) return;
        data.meals.forEach((meal) => {
          recipeMap.set(meal.idMeal, meal);
        });
      })
    );

    // ------------------------------------------
    // Step 2: Fetch full details for each unique meal
    // ------------------------------------------
    const detailedMeals = await Promise.all(
      Array.from(recipeMap.values()).map(async (meal) => {
        const detailRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`);
        const detailData = await detailRes.json();
        return detailData.meals[0]; 
      })
    );

    // ------------------------------------------
    // Step 3: Process ingredients
    // ------------------------------------------
    const normalizedIngredients = ingredientsArray.map((i) => i.toLowerCase().trim());

    const recipes = detailedMeals.map((meal) => {
      const mealIngredients = [];

      for (let i = 1; i <= 20; i++) {
        const ing = meal[`strIngredient${i}`];
        if (ing && ing.trim() !== "") mealIngredients.push(ing.toLowerCase().trim());
      }

      const usedIngredientCount = mealIngredients.filter((i) => normalizedIngredients.includes(i)).length;
      const missedIngredientCount = mealIngredients.length - usedIngredientCount;

      return {
        id: meal.idMeal,
        title: meal.strMeal,
        image: meal.strMealThumb,
        usedIngredientCount,
        missedIngredientCount,
        ...meal
      };
    });

    // ------------------------------------------
    // Step 4: Sort recipes
    // ------------------------------------------
    recipes.sort((a, b) => b.usedIngredientCount - a.usedIngredientCount);

    return recipes;

  } catch (err) {
    console.error("Error fetching recipes:", err);
    return [];
  }
}
