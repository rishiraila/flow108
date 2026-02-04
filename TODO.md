# Fix User List Page Blank Issue

## Problem
When an admin unassigns the only user on a page (e.g., 3rd page), the page becomes blank instead of redirecting to the previous page or the last available page.

## Root Cause
After unassigning a user, the `userPage` state is not adjusted, so if the current page becomes empty, it stays on that empty page.

## Solution
Modify the `unassignUser` function in `src/app/DietPlan/[id]/page.js` to:
1. Update the assigned users list optimistically
2. Calculate the new total pages after the update
3. If the current page is now empty, adjust `userPage` to the previous page or the last available page

## Tasks
- [x] Update unassignUser function to handle page adjustment after unassignment
- [x] Test the fix to ensure pagination works correctly when unassigning the last user on a page
