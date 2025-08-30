# Workout Management System - Implementation Plan

## Phase 1: Completed - Image Display Fix

### ✅ API Utility Updates (`src/app/utils/api.js`)
- Updated `fetchWorkoutsByPlan` function to convert relative image URLs to absolute URLs
- Updated `fetchWorkoutPlans` function to convert relative image URLs to absolute URLs
- Added base domain conversion logic using `https://flow108.coinagesoft.com`

### ✅ Exercise Page Updates (`src/app/Exercise/page.js`)
- Fixed field name mismatch: Changed `workout.ImageUrl` to `workout.Image` to match API response

### ✅ WorkoutDetails Page Updates (`src/app/WorkoutDetails/page.js`)
- Added URL conversion logic in `fetchWorkoutDetails` function
- Ensures individual workout images display correctly with absolute URLs

## Phase 2: New Functionality Implementation

### 1. Create Workouts Subpage (`src/app/Exercise/Workouts/page.js`)
- [ ] Create new page component to list all workouts
- [ ] Implement fetch functionality for workouts
- [ ] Add edit and delete functionality for individual workouts
- [ ] Create UI for workout management

### 2. Update Exercise Page (`src/app/Exercise/page.js`)
- [ ] Add "Assign Workout" button to workout plans
- [ ] Implement modal/UI for selecting workouts to assign
- [ ] Connect to `assignWorkoutToPlan` API function
- [ ] Add state management for assignment process

### 3. API Integration
- [ ] Ensure proper API endpoints are available for workout management
- [ ] Implement error handling and loading states

## Technical Details
- **Base Domain**: `https://flow108.coinagesoft.com`
- **API Field**: `Image` (not `ImageUrl`)
- **Conversion Logic**: Relative paths starting with `/` are converted to absolute URLs
- **Fallback**: Uses `/assets/img/avatars/14.png` when no image is available

## Available API Functions
- `addWorkoutPlan` - Create new workout plan
- `updateWorkoutPlan` - Update existing workout plan
- `deleteWorkoutPlan` - Delete workout plan
- `assignUsersToWorkout` - Assign users to workout plan
- `assignWorkoutToPlan` - Assign workout to workout plan

## Next Steps
1. Create workouts subpage with CRUD operations
2. Add assign workout functionality to exercise page
3. Test all functionality
4. Deploy and verify
