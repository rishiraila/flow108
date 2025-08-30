# Workout Image Display Fix - Progress Tracking

## Plan Overview
Fix workout image display issues by:
1. Adding URL conversion logic for relative image paths
2. Fixing field name mismatches between API response and frontend code
3. Ensuring consistent image display across all workout-related pages

## Completed Tasks

### ✅ API Utility Updates (`src/app/utils/api.js`)
- [x] Updated `fetchWorkoutsByPlan` function to convert relative image URLs to absolute URLs
- [x] Updated `fetchWorkoutPlans` function to convert relative image URLs to absolute URLs
- [x] Added base domain conversion logic using `https://flow108.coinagesoft.com`

### ✅ Exercise Page Updates (`src/app/Exercise/page.js`)
- [x] Fixed field name mismatch: Changed `workout.ImageUrl` to `workout.Image` to match API response

### ✅ WorkoutDetails Page Updates (`src/app/WorkoutDetails/page.js`)
- [x] Added URL conversion logic in `fetchWorkoutDetails` function
- [x] Ensures individual workout images display correctly with absolute URLs

## Testing Required
- [ ] Test Exercise page to ensure workout plan images display correctly
- [ ] Test WorkoutDetails page to ensure individual workout images display correctly
- [ ] Verify that both relative and absolute URLs work properly
- [ ] Check that fallback images work when no image is available

## Files Modified
1. `src/app/utils/api.js` - Added URL conversion for workout plans and workouts
2. `src/app/Exercise/page.js` - Fixed field name mismatch
3. `src/app/WorkoutDetails/page.js` - Added URL conversion for individual workouts

## Technical Details
- **Base Domain**: `https://flow108.coinagesoft.com`
- **API Field**: `Image` (not `ImageUrl`)
- **Conversion Logic**: Relative paths starting with `/` are converted to absolute URLs
- **Fallback**: Uses `/assets/img/avatars/14.png` when no image is available

## Notes
- The API returns relative paths like `/uploads/workouts/db9cee77-5e56-494a-9452-dd386561c33d.png`
- These need to be converted to absolute URLs like `https://flow108.coinagesoft.com/uploads/workouts/db9cee77-5e56-494a-9452-dd386561c33d.png`
- The conversion pattern follows the same approach used for forum posts in the existing code
