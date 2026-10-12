# ParentMentor AI Architecture

## Architect Summary

The current implementation keeps the existing React + Flask + SQLite structure and extends it in place for a fuller parenting support product.

## Frontend

The frontend remains a single React app with view-based navigation managed in [App.jsx](/home/soujanyabandari/Documents/parentmentor/frontend/src/App.jsx) and [AppShell.jsx](/home/soujanyabandari/Documents/parentmentor/frontend/src/components/AppShell.jsx).

Key frontend areas:

1. Landing and auth modal for login/signup
2. Dashboard for onboarding, child switching, quick stats, and quick actions
3. Children page for profile editing and child detail summaries
4. Coach page for AI chat and saved history
5. Routines page for generation and CRUD
6. Activities page for generation and saved activities
7. Rewards page for tasks, points, rewards, and badges
8. Insights page for weekly summaries and simple visual trend blocks
9. Child mode page for simplified mission-first interaction

## Backend

The Flask backend still uses modular routes and services, now extended with additive endpoints and domain areas.

Route groups:

1. `auth`
   - register
   - login
   - current user fetch/update

2. `children`
   - list
   - create
   - detail
   - update
   - delete
   - mode switch

3. `coach`
   - chat
   - routine generation
   - activity generation

4. `tasks`
   - list
   - create
   - update
   - toggle complete
   - delete

5. `routines`
   - list
   - create
   - update
   - delete

6. `activities`
   - list
   - create
   - delete

7. `moods`
   - list
   - create
   - delete

8. `rewards` and `badges`
   - reward CRUD
   - reward claim
   - badge list

9. `dashboard`, `analytics`, `insights`
   - child summary data
   - weekly insight aggregates

## Data Model

SQLite schema is still created in [db.py](/home/soujanyabandari/Documents/parentmentor/backend/models/db.py) and now includes:

1. `users`
2. `children`
3. `chat_history`
4. `routines`
5. `daily_logs`
6. `tasks`
7. `activities`
8. `mood_logs`
9. `rewards`
10. `badges`
11. `weekly_insights`

The migration strategy is additive. Existing auth and prior MVP data stay intact, while new columns and tables are created on startup.

## Service Layer

Business logic stays in `backend/services/`:

1. `auth_service.py`
2. `child_service.py`
3. `task_service.py`
4. `routine_service.py`
5. `activity_service.py`
6. `mood_service.py`
7. `reward_service.py`
8. `analytics_service.py`
9. `chat_service.py`
10. `ai_service.py`

The AI service is currently a safe structured fallback generator, which keeps the demo functional even without an external API key.

## Data Flow

1. Parent authenticates and stores JWT in local storage.
2. Frontend fetches current user and children.
3. Selected child drives dashboard, coach, routines, rewards, insights, and child mode.
4. Protected endpoints validate the token and scope all data by parent user id and child id.
5. SQLite persists all child-specific records so the demo survives refreshes.

## UI Theme

The visual language intentionally shifted to a bright child-loving theme:

1. light backgrounds instead of black
2. warm pastel gradients
3. rounded cards and softer shadows
4. playful heading typography
5. simpler, larger child mode actions
