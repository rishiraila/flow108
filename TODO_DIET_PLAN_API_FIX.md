# Diet Plan API Fix TODO

## Issues Identified
- [x] `fetchAssignedUsers` function using incorrect API endpoint - RESOLVED: Current endpoint `/AdminDietPlan/${planId}/users` is working correctly
- [ ] `editMeal` function using incorrect API endpoint - NEEDS VERIFICATION
- [x] `deleteMeal` function using incorrect API endpoint - FIXED: Updated to use `/meals/${mealId}`

## Fixes Applied
- [x] Verified `fetchAssignedUsers` endpoint `/AdminDietPlan/${planId}/users` works correctly (returns proper user data)
- [ ] Verify `editMeal` endpoint `/AdminDietPlan/meals/${editingMeal.Id}` is correct
- [x] Fixed `deleteMeal` endpoint from `/AdminDietPlan/meals/delete/${mealId}` to `/meals/${mealId}`
- [ ] Test all API calls work correctly

## Files Modified
- [x] `src/app/DietPlan/[id]/page.js` - Updated deleteMeal endpoint
