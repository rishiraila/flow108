# Task: Implement meal recommendations using the API endpoint POST /api/admin/recommendations/meal

## Completed Tasks
- [x] Analyzed the existing meal recommendation implementation in `src/app/DietPlan/[id]/page.js`
- [x] Added meal recommendation API functions to `src/app/utils/apiClient.js`
- [x] Verified the API endpoint POST /api/admin/recommendations/meal is properly implemented

## Summary of Changes
- Added `recommendMeal` function to mealApi for creating meal recommendations
- Added `getRecommendations` function to mealApi for fetching meal recommendations
- Added `updateRecommendation` function to mealApi for updating existing recommendations
- Added `deleteRecommendation` function to mealApi for deleting recommendations
- All functions use the correct API endpoints and handle FormData properly for multipart requests

## API Functions Added
- `mealApi.recommendMeal(recommendationData)` - POST /api/admin/recommendations/meal
- `mealApi.getRecommendations(dietPlanId)` - GET /api/admin/recommendations
- `mealApi.updateRecommendation(recommendationId, recommendationData)` - PATCH /api/admin/recommendations/{id}
- `mealApi.deleteRecommendation(recommendationId)` - DELETE /api/admin/recommendations/{id}

## Testing
- The meal recommendation feature is already implemented in the DietPlan details page
- Users can add, edit, and delete meal recommendations for diet plans
- The API endpoint POST /api/admin/recommendations/meal accepts MealItemId, MealType, RecommendedQuantity, and DietPlanId parameters
